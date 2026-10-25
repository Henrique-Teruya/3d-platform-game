import * as THREE from 'three';
import type { MovementConfig } from '../../config/movementConfig';
import type { EventBus } from '../core/EventBus';
import type { InputManager, InputSnapshot } from '../input/InputManager';
import type { PhysicsWorld, SurfaceMaterialType } from '../physics/PhysicsWorld';
import {
  accelerateHorizontal,
  applyAirMovement,
  applyGroundFriction,
  computeEffectiveGravity,
  computeSlideStep,
  computeWallJumpVelocity,
  computeWishDirection,
  projectVelocityOnPlane,
  type Vec2XZ,
  type Vec3XYZ,
} from './MovementMath';

export type PlayerMovementState =
  | 'IDLE'
  | 'WALKING'
  | 'RUNNING'
  | 'SPRINTING'
  | 'SLIDING'
  | 'JUMPING'
  | 'FALLING'
  | 'WALL_RUNNING';

// Pre-allocated scratchpad objects for zero GC in fixed update loop
const _wishDir: Vec2XZ = { x: 0, z: 0 };
const _vel2D: Vec2XZ = { x: 0, z: 0 };
const _vel3D: Vec3XYZ = { x: 0, y: 0, z: 0 };

export class PlayerController {
  public readonly position = new THREE.Vector3(0, 0, 0);
  public readonly prevPosition = new THREE.Vector3(0, 0, 0);
  public readonly interpolatedPosition = new THREE.Vector3(0, 0, 0);
  public readonly velocity = new THREE.Vector3(0, 0, 0);

  public yaw = 0; // radians, 0 = looking along -Z
  public pitch = 0; // radians, clamped [-85 deg, +85 deg]

  public state: PlayerMovementState = 'IDLE';
  public isGrounded = true;
  public isSliding = false;
  public wallRunSide: 'none' | 'left' | 'right' = 'none';
  public currentSurface: SurfaceMaterialType = 'concrete';

  private groundNormal = { x: 0, y: 1, z: 0 };
  private wallNormal = { x: 0, z: 0 };
  private lastWallNormal = { x: 0, z: 0 };
  private hasLastWall = false;

  private coyoteTimer = 0;
  private wallRunTimer = 0;
  private wallJumpCooldownTimer = 0;
  private slideBoostCooldownTimer = 0;
  private footstepTimer = 0;
  private activeMovingPlatformId: string | undefined;

  private currentEyeHeight: number;
  private prevEyeHeight: number;

  constructor(
    private readonly physics: PhysicsWorld,
    private readonly events: EventBus,
    public config: MovementConfig,
  ) {
    this.currentEyeHeight = config.cameraEyeHeightStand;
    this.prevEyeHeight = config.cameraEyeHeightStand;
  }

  public spawnAt(x: number, y: number, z: number, yawRad = 0): void {
    this.position.set(x, y, z);
    this.prevPosition.set(x, y, z);
    this.interpolatedPosition.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.yaw = yawRad;
    this.pitch = 0;
    this.state = 'IDLE';
    this.isGrounded = true;
    this.isSliding = false;
    this.wallRunSide = 'none';
    this.coyoteTimer = 0;
    this.wallRunTimer = 0;
    this.wallJumpCooldownTimer = 0;
    this.slideBoostCooldownTimer = 0;
    this.hasLastWall = false;
    this.activeMovingPlatformId = undefined;
    this.currentEyeHeight = this.config.cameraEyeHeightStand;
    this.prevEyeHeight = this.config.cameraEyeHeightStand;

    this.physics.createPlayerCapsule(
      this.position,
      this.config.playerHeightStand,
      this.config.playerRadius,
    );
  }

  public applyLookDelta(dx: number, dy: number, sensitivity: number, invertY: boolean): void {
    const radPerPixel = 0.0022 * sensitivity;
    this.yaw -= dx * radPerPixel;
    const pitchSign = invertY ? 1 : -1;
    this.pitch += dy * radPerPixel * pitchSign;

    const maxPitch = (85 * Math.PI) / 180;
    if (this.pitch > maxPitch) this.pitch = maxPitch;
    if (this.pitch < -maxPitch) this.pitch = -maxPitch;
  }

  public fixedUpdate(fixedDt: number, input: InputSnapshot, inputManager: InputManager): void {
    this.prevPosition.copy(this.position);
    this.prevEyeHeight = this.currentEyeHeight;

    if (this.wallJumpCooldownTimer > 0) {
      this.wallJumpCooldownTimer = Math.max(0, this.wallJumpCooldownTimer - fixedDt);
    }
    if (this.slideBoostCooldownTimer > 0) {
      this.slideBoostCooldownTimer = Math.max(0, this.slideBoostCooldownTimer - fixedDt);
    }

    // 1. Carry player with moving platform if standing on one
    if (this.isGrounded && this.activeMovingPlatformId) {
      const platform = this.physics.getMovingPlatform(this.activeMovingPlatformId);
      if (platform) {
        this.position.add(platform.frameDelta);
        this.physics.setPlayerFootPosition(
          this.position.x,
          this.position.y,
          this.position.z,
          this.isSliding ? this.config.playerHeightSlide : this.config.playerHeightStand,
        );
      }
    }

    // 2. Compute horizontal wish direction from input and camera yaw
    computeWishDirection(input.moveForward, input.moveRight, this.yaw, _wishDir);
    const hasWishInput = Math.hypot(_wishDir.x, _wishDir.z) > 0.01;
    const horizSpeedBefore = Math.hypot(this.velocity.x, this.velocity.z);

    // 3. Evaluate Slide Transitions
    const wantsSlide = input.isSlidingHeld;
    if (this.isGrounded) {
      if (!this.isSliding && wantsSlide && horizSpeedBefore >= this.config.slideMinSpeedToStart) {
        this.enterSlide();
      } else if (
        this.isSliding &&
        (!wantsSlide || horizSpeedBefore < this.config.slideStopSpeed)
      ) {
        if (this.physics.canStandUp(this.position, this.config.playerHeightStand)) {
          this.exitSlide();
        }
      }
    } else if (this.isSliding && !wantsSlide) {
      if (this.physics.canStandUp(this.position, this.config.playerHeightStand)) {
        this.exitSlide();
      }
    }

    // Smoothly interpolate eye height
    const targetEye = this.isSliding
      ? this.config.cameraEyeHeightSlide
      : this.config.cameraEyeHeightStand;
    this.currentEyeHeight += (targetEye - this.currentEyeHeight) * Math.min(1, 14 * fixedDt);

    // 4. Check Wall Run State when Airborne
    if (!this.isGrounded) {
      this.updateWallRunState(fixedDt, input, hasWishInput);
    } else {
      if (this.wallRunSide !== 'none') {
        this.endWallRun();
      }
      this.hasLastWall = false;
    }

    // 5. Handle Jump / Coyote Jump / Jump Buffer / Wall Jump
    const canGroundJump = this.isGrounded || this.coyoteTimer > 0;
    if (input.jumpBuffered) {
      if (this.wallRunSide !== 'none') {
        // Execute Wall Jump
        computeWallJumpVelocity(
          this.velocity.x,
          this.velocity.z,
          this.wallNormal.x,
          this.wallNormal.z,
          this.yaw,
          this.config,
          _vel3D,
        );
        this.velocity.set(_vel3D.x, _vel3D.y, _vel3D.z);
        this.lastWallNormal.x = this.wallNormal.x;
        this.lastWallNormal.z = this.wallNormal.z;
        this.hasLastWall = true;
        this.wallJumpCooldownTimer = this.config.wallJumpCooldown;
        this.endWallRun();
        inputManager.consumeJumpBuffer();
        this.state = 'JUMPING';
        this.events.emit('PLAYER_JUMPED', { velocity: this.velocity.y, isWallJump: true });
      } else if (canGroundJump) {
        // Execute Ground / Coyote / Slide Jump
        if (this.isSliding && this.physics.canStandUp(this.position, this.config.playerHeightStand)) {
          this.exitSlide();
        }
        // Inherit moving platform velocity if jumping from one
        if (this.activeMovingPlatformId) {
          const platform = this.physics.getMovingPlatform(this.activeMovingPlatformId);
          if (platform) {
            this.velocity.x += platform.velocity.x * 0.65;
            this.velocity.z += platform.velocity.z * 0.65;
            this.velocity.y = Math.max(0, platform.velocity.y * 0.5);
          }
        }
        this.velocity.y = this.config.jumpVelocity;
        this.isGrounded = false;
        this.coyoteTimer = 0;
        this.activeMovingPlatformId = undefined;
        inputManager.consumeJumpBuffer();
        this.state = 'JUMPING';
        this.events.emit('PLAYER_JUMPED', { velocity: this.velocity.y, isWallJump: false });
      }
    }

    // 6. Horizontal Velocity Integration
    if (this.isGrounded) {
      if (this.isSliding) {
        computeSlideStep(
          this.velocity.x,
          this.velocity.z,
          this.groundNormal.x,
          this.groundNormal.y,
          this.groundNormal.z,
          _wishDir.x,
          _wishDir.z,
          this.config,
          fixedDt,
          _vel2D,
        );
        this.velocity.x = _vel2D.x;
        this.velocity.z = _vel2D.z;
      } else {
        // Apply friction only if not bunny-hopping on frame 0 with buffered jump
        applyGroundFriction(
          this.velocity.x,
          this.velocity.z,
          this.config.frictionGround,
          fixedDt,
          0.05,
          _vel2D,
        );

        let targetSpeed = this.config.speedRun;
        if (input.isSprinting && input.moveForward >= 0) {
          targetSpeed = this.config.speedSprint;
        } else if (input.isWalkingSlow) {
          targetSpeed = this.config.speedWalk;
        }

        accelerateHorizontal(
          _vel2D.x,
          _vel2D.z,
          _wishDir.x,
          _wishDir.z,
          targetSpeed,
          this.config.accelGround,
          fixedDt,
          _vel2D,
        );
        this.velocity.x = _vel2D.x;
        this.velocity.z = _vel2D.z;
      }
      this.velocity.y = Math.min(0, this.velocity.y);
    } else if (this.wallRunSide !== 'none') {
      // Wall running horizontal velocity: project along wall tangent and maintain target speed
      const intoWall = this.velocity.x * this.wallNormal.x + this.velocity.z * this.wallNormal.z;
      let tx = this.velocity.x - this.wallNormal.x * intoWall;
      let tz = this.velocity.z - this.wallNormal.z * intoWall;
      const tLen = Math.hypot(tx, tz);
      if (tLen > 1e-4) {
        const targetWallSpeed = Math.max(tLen, this.config.wallRunTargetSpeed);
        const newSpeed = tLen + (targetWallSpeed - tLen) * Math.min(1, 6 * fixedDt);
        tx = (tx / tLen) * newSpeed;
        tz = (tz / tLen) * newSpeed;
      }
      // Subtle nudge towards wall to maintain contact around gentle curves
      this.velocity.x = tx - this.wallNormal.x * 0.8;
      this.velocity.z = tz - this.wallNormal.z * 0.8;

      const gEff = computeEffectiveGravity(this.velocity.y, input.isJumpHeld, true, this.config);
      this.velocity.y = Math.max(-3.2, this.velocity.y - gEff * fixedDt);
    } else {
      // Airborne movement
      applyAirMovement(
        this.velocity.x,
        this.velocity.z,
        _wishDir.x,
        _wishDir.z,
        this.config,
        fixedDt,
        _vel2D,
      );
      this.velocity.x = _vel2D.x;
      this.velocity.z = _vel2D.z;

      const gEff = computeEffectiveGravity(this.velocity.y, input.isJumpHeld, false, this.config);
      this.velocity.y = Math.max(
        this.config.terminalFallSpeed,
        this.velocity.y - gEff * fixedDt,
      );
    }

    // 7. Move Character Capsule through Rapier Kinematic Character Controller
    const currentCapsuleHeight = this.isSliding
      ? this.config.playerHeightSlide
      : this.config.playerHeightStand;
    const desiredDelta = {
      x: this.velocity.x * fixedDt,
      y: this.velocity.y * fixedDt,
      z: this.velocity.z * fixedDt,
    };

    const fallSpeedBeforeMove = -this.velocity.y;
    const wasGrounded = this.isGrounded;

    const moveResult = this.physics.moveCharacter(
      this.position,
      currentCapsuleHeight,
      desiredDelta,
      wasGrounded && this.velocity.y <= 0,
      this.config.groundSnapDistance,
    );

    this.position.x += moveResult.appliedDelta.x;
    this.position.y += moveResult.appliedDelta.y;
    this.position.z += moveResult.appliedDelta.z;

    if (moveResult.hitCeiling && this.velocity.y > 0) {
      this.velocity.y = 0;
    }

    // Project horizontal velocity along any wall obstacles hit (smooth wall sliding)
    for (const wn of moveResult.wallNormals) {
      projectVelocityOnPlane(
        this.velocity.x,
        this.velocity.y,
        this.velocity.z,
        wn.x,
        0,
        wn.z,
        _vel3D,
      );
      this.velocity.x = _vel3D.x;
      this.velocity.z = _vel3D.z;
    }

    // 8. Ground Probe & Landing Detection
    const groundProbe = this.physics.probeGround(this.position, 0.24);
    const nowGrounded =
      (moveResult.grounded || groundProbe.grounded) && this.velocity.y <= 0.5;

    if (nowGrounded) {
      this.groundNormal.x = groundProbe.normalX;
      this.groundNormal.y = groundProbe.normalY;
      this.groundNormal.z = groundProbe.normalZ;
      this.currentSurface =
        moveResult.groundMetadata?.surfaceType ?? groundProbe.surfaceType;
      this.activeMovingPlatformId =
        moveResult.groundMetadata?.movingPlatformId ?? groundProbe.movingPlatformId;

      if (!wasGrounded) {
        this.velocity.y = 0;
        if (fallSpeedBeforeMove > 2.2) {
          this.events.emit('PLAYER_LANDED', {
            fallSpeed: fallSpeedBeforeMove,
            surfaceType: this.currentSurface,
          });
        }
      }
      this.isGrounded = true;
      this.coyoteTimer = this.config.coyoteTime;
    } else {
      if (wasGrounded) {
        this.coyoteTimer = this.config.coyoteTime;
      } else if (this.coyoteTimer > 0) {
        this.coyoteTimer = Math.max(0, this.coyoteTimer - fixedDt);
      }
      this.isGrounded = false;
      this.activeMovingPlatformId = undefined;
    }

    // 9. Update FSM State Label & Footstep Audio Cadence
    this.updateStateLabel(input);
    this.updateFootsteps(fixedDt);
  }

  public updateInterpolation(alpha: number): void {
    this.interpolatedPosition.lerpVectors(this.prevPosition, this.position, alpha);
  }

  public getInterpolatedEyeHeight(alpha: number): number {
    return this.prevEyeHeight + (this.currentEyeHeight - this.prevEyeHeight) * alpha;
  }

  public getHorizontalSpeed(): number {
    return Math.hypot(this.velocity.x, this.velocity.z);
  }

  private enterSlide(): void {
    this.isSliding = true;
    this.physics.setPlayerHeight(
      this.position,
      this.config.playerHeightSlide,
      this.config.playerRadius,
    );

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (this.slideBoostCooldownTimer <= 0 && speed > 0.5 && speed < this.config.speedSlideMax) {
      const boosted = Math.min(this.config.speedSlideMax, speed + this.config.slideBoostImpulse);
      const scale = boosted / speed;
      this.velocity.x *= scale;
      this.velocity.z *= scale;
      this.slideBoostCooldownTimer = 0.7;
    }

    this.events.emit('PLAYER_SLIDE_START', { speed: Math.hypot(this.velocity.x, this.velocity.z) });
  }

  private exitSlide(): void {
    if (!this.isSliding) return;
    this.isSliding = false;
    this.physics.setPlayerHeight(
      this.position,
      this.config.playerHeightStand,
      this.config.playerRadius,
    );
    this.events.emit('PLAYER_SLIDE_END', {});
  }

  private updateWallRunState(fixedDt: number, input: InputSnapshot, hasWishInput: boolean): void {
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);

    if (this.wallRunSide !== 'none') {
      this.wallRunTimer += fixedDt;
      const wallHit = this.physics.detectWalls(
        this.position,
        this.yaw,
        this.config.wallDetectDistance + 0.15,
      );

      if (
        !wallHit ||
        this.wallRunTimer >= this.config.wallRunMaxDuration ||
        horizSpeed < this.config.wallRunMinSpeed * 0.75 ||
        input.isSlidingHeld
      ) {
        this.endWallRun();
      } else {
        this.wallNormal.x = wallHit.normalX;
        this.wallNormal.z = wallHit.normalZ;
        this.wallRunSide = wallHit.side;
        this.currentSurface = wallHit.surfaceType;
      }
      return;
    }

    // Attempt to start a wall run
    if (
      this.wallJumpCooldownTimer > 0 ||
      horizSpeed < this.config.wallRunMinSpeed ||
      this.velocity.y < -14.0 ||
      !hasWishInput
    ) {
      return;
    }

    const wallHit = this.physics.detectWalls(
      this.position,
      this.yaw,
      this.config.wallDetectDistance,
    );
    if (!wallHit) return;

    // Prevent re-attaching to the exact same wall plane without touching ground or another wall
    if (this.hasLastWall) {
      const dotSameWall =
        wallHit.normalX * this.lastWallNormal.x + wallHit.normalZ * this.lastWallNormal.z;
      if (dotSameWall > 0.82) return;
    }

    this.wallRunSide = wallHit.side;
    this.wallNormal.x = wallHit.normalX;
    this.wallNormal.z = wallHit.normalZ;
    this.wallRunTimer = 0;
    this.currentSurface = wallHit.surfaceType;
    this.velocity.y = Math.max(this.velocity.y * 0.35, 0.8);

    if (this.isSliding) {
      this.exitSlide();
    }

    this.events.emit('PLAYER_WALLRUN_START', { side: wallHit.side });
  }

  private endWallRun(): void {
    if (this.wallRunSide === 'none') return;
    this.lastWallNormal.x = this.wallNormal.x;
    this.lastWallNormal.z = this.wallNormal.z;
    this.hasLastWall = true;
    this.wallRunSide = 'none';
    this.wallRunTimer = 0;
    this.events.emit('PLAYER_WALLRUN_END', {});
  }

  private updateStateLabel(input: InputSnapshot): void {
    if (!this.isGrounded) {
      if (this.wallRunSide !== 'none') {
        this.state = 'WALL_RUNNING';
      } else if (this.velocity.y > 0.2) {
        this.state = 'JUMPING';
      } else {
        this.state = 'FALLING';
      }
      return;
    }

    if (this.isSliding) {
      this.state = 'SLIDING';
      return;
    }

    const hSpeed = this.getHorizontalSpeed();
    if (hSpeed < 0.4) {
      this.state = 'IDLE';
    } else if (hSpeed <= this.config.speedWalk + 0.5 || input.isWalkingSlow) {
      this.state = 'WALKING';
    } else if (hSpeed > this.config.speedRun + 0.8 && input.isSprinting) {
      this.state = 'SPRINTING';
    } else {
      this.state = 'RUNNING';
    }
  }

  private updateFootsteps(fixedDt: number): void {
    const hSpeed = this.getHorizontalSpeed();
    const isMovingOnSurface =
      (this.isGrounded && !this.isSliding && hSpeed > 1.2) ||
      this.wallRunSide !== 'none';

    if (!isMovingOnSurface) {
      this.footstepTimer = 0.12;
      return;
    }

    this.footstepTimer -= fixedDt;
    if (this.footstepTimer <= 0) {
      const interval =
        this.wallRunSide !== 'none'
          ? 0.24
          : Math.max(0.24, Math.min(0.54, 3.1 / Math.max(2.5, hSpeed)));
      this.footstepTimer = interval;

      this.events.emit('PLAYER_FOOTSTEP', {
        speed: hSpeed,
        isSprinting: this.state === 'SPRINTING',
        isWallRunning: this.wallRunSide !== 'none',
        surfaceType: this.currentSurface,
      });
    }
  }
}
