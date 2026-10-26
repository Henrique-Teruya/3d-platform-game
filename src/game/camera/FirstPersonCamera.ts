import * as THREE from 'three';
import type { MovementConfig } from '../../config/movementConfig';
import type { UserSettings } from '../../stores/gameStore';
import type { PlayerController } from '../movement/PlayerController';

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

export class FirstPersonCamera {
  public readonly camera: THREE.PerspectiveCamera;
  private currentFov = 85;
  private currentRollRad = 0;
  private landingDipOffset = 0;
  private landingDipVelocity = 0;
  private landingPitchOffset = 0;
  private headBobPhase = 0;
  private trauma = 0;
  private elapsed = 0;

  constructor(fov = 85, aspect = 16 / 9) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 900);
    this.currentFov = fov;
  }

  public onLandingImpact(fallSpeed: number, config: MovementConfig, shakeScale: number): void {
    const normalized = Math.min(1, Math.max(0, (fallSpeed - 2.5) / 22.0));
    this.landingDipVelocity = -normalized * 2.8;
    this.landingDipOffset = Math.max(
      -config.landingImpactMaxDip,
      this.landingDipOffset - normalized * config.landingImpactMaxDip * 0.75,
    );
    this.landingPitchOffset = -normalized * 0.042;
    this.trauma = Math.min(0.45, this.trauma + normalized * 0.25 * shakeScale);
  }

  public onLaunchPadImpulse(): void {
    this.landingDipVelocity = -1.4;
    this.trauma = Math.min(0.5, this.trauma + 0.3);
  }

  public update(
    renderDelta: number,
    alpha: number,
    player: PlayerController,
    config: MovementConfig,
    settings: UserSettings,
    reducedMotion: boolean,
  ): void {
    this.elapsed += renderDelta;
    const pos = player.interpolatedPosition;
    const eyeHeight = player.getInterpolatedEyeHeight(alpha);
    const hSpeed = player.getHorizontalSpeed();

    // 1. Spring-damper recovery for landing dip
    const springK = 140;
    const damping = 18;
    const accelDip = -springK * this.landingDipOffset - damping * this.landingDipVelocity;
    this.landingDipVelocity += accelDip * renderDelta;
    this.landingDipOffset += this.landingDipVelocity * renderDelta;
    if (Math.abs(this.landingDipOffset) < 0.0005 && Math.abs(this.landingDipVelocity) < 0.005) {
      this.landingDipOffset = 0;
      this.landingDipVelocity = 0;
    }

    this.landingPitchOffset *= Math.exp(-config.landingImpactRecoverySpeed * renderDelta);

    // 2. Optional subtle head bob
    let bobOffsetY = 0;
    let bobOffsetX = 0;
    if (settings.headBob && !reducedMotion && player.isGrounded && !player.isSliding && hSpeed > 1.5) {
      const speedRatio = Math.min(1.5, hSpeed / config.speedRun);
      this.headBobPhase += renderDelta * config.headBobFrequency * speedRatio;
      bobOffsetY = Math.sin(this.headBobPhase * 2) * config.headBobAmplitude * speedRatio;
      bobOffsetX = Math.cos(this.headBobPhase) * config.headBobAmplitude * 0.5 * speedRatio;
    } else {
      this.headBobPhase = 0;
    }

    // 3. Camera Roll (Wall Run tilt + subtle strafe lean)
    let targetRollDeg = 0;
    if (settings.cameraTilt && !reducedMotion) {
      if (player.wallRunSide === 'right') {
        targetRollDeg = config.cameraWallRollDeg;
      } else if (player.wallRunSide === 'left') {
        targetRollDeg = -config.cameraWallRollDeg;
      } else {
        // Compute lateral velocity component relative to camera right vector
        const rightX = Math.cos(player.yaw);
        const rightZ = -Math.sin(player.yaw);
        const lateralSpeed = player.velocity.x * rightX + player.velocity.z * rightZ;
        const strafeNormalized = Math.max(-1, Math.min(1, lateralSpeed / config.speedSprint));
        targetRollDeg = -strafeNormalized * config.cameraStrafeRollDeg;
      }
    }
    const targetRollRad = (targetRollDeg * Math.PI) / 180;
    this.currentRollRad += (targetRollRad - this.currentRollRad) * Math.min(1, 11 * renderDelta);

    // 4. Subtle Trauma Shake (if enabled)
    let shakePitch = 0;
    let shakeRoll = 0;
    if (this.trauma > 0 && settings.cameraShake > 0 && !reducedMotion) {
      this.trauma = Math.max(0, this.trauma - 1.8 * renderDelta);
      const shake = this.trauma * this.trauma * settings.cameraShake;
      shakePitch = Math.sin(this.elapsed * 38) * 0.015 * shake;
      shakeRoll = Math.cos(this.elapsed * 31) * 0.02 * shake;
    } else {
      this.trauma = 0;
    }

    // 5. Dynamic Speed FOV
    const baseFov = settings.fov;
    let targetFov = baseFov;
    if (settings.dynamicFov && !reducedMotion) {
      const speedFactor = Math.max(
        0,
        Math.min(1, (hSpeed - config.speedWalk) / (config.speedSlideMax - config.speedWalk)),
      );
      targetFov = baseFov + speedFactor * config.maxFovBoost;
    }
    if (Math.abs(targetFov - this.currentFov) > 0.02) {
      this.currentFov += (targetFov - this.currentFov) * Math.min(1, 9 * renderDelta);
      this.camera.fov = this.currentFov;
      this.camera.updateProjectionMatrix();
    }

    // 6. Apply Position & Rotation to Three.js PerspectiveCamera
    const rightX = Math.cos(player.yaw);
    const rightZ = -Math.sin(player.yaw);

    this.camera.position.set(
      pos.x + rightX * bobOffsetX,
      pos.y + eyeHeight + this.landingDipOffset + bobOffsetY,
      pos.z + rightZ * bobOffsetX,
    );

    _euler.set(
      player.pitch + this.landingPitchOffset + shakePitch,
      player.yaw,
      this.currentRollRad + shakeRoll,
      'YXZ',
    );
    this.camera.quaternion.setFromEuler(_euler);
  }
}
