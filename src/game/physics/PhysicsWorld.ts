import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export type SurfaceMaterialType = 'concrete' | 'basalt' | 'sand' | 'metal';

export interface ColliderMetadata {
  id: string;
  surfaceType: SurfaceMaterialType;
  isWallRunnable: boolean;
  movingPlatformId?: string;
}

export interface MovingPlatformRuntime {
  id: string;
  body: RAPIER.RigidBody;
  colliderHandle: number;
  mesh?: THREE.Object3D;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  speed: number;
  phaseOffset: number;
  currentPos: THREE.Vector3;
  previousPos: THREE.Vector3;
  frameDelta: THREE.Vector3;
  velocity: THREE.Vector3;
}

export interface GroundHitInfo {
  grounded: boolean;
  normalX: number;
  normalY: number;
  normalZ: number;
  distance: number;
  surfaceType: SurfaceMaterialType;
  movingPlatformId?: string;
}

export interface WallHitInfo {
  hit: boolean;
  side: 'left' | 'right';
  normalX: number;
  normalY: number;
  normalZ: number;
  distance: number;
  surfaceType: SurfaceMaterialType;
}

export interface MoveStepResult {
  appliedDelta: { x: number; y: number; z: number };
  grounded: boolean;
  hitCeiling: boolean;
  wallNormals: Array<{ x: number; y: number; z: number }>;
  groundMetadata?: ColliderMetadata;
}

let rapierInitialized = false;

export async function ensureRapierInitialized(): Promise<void> {
  if (!rapierInitialized) {
    await RAPIER.init();
    rapierInitialized = true;
  }
}

export class PhysicsWorld {
  public readonly world: RAPIER.World;
  public readonly characterController: RAPIER.KinematicCharacterController;
  private playerBody: RAPIER.RigidBody | null = null;
  private playerCollider: RAPIER.Collider | null = null;
  private currentCapsuleHalfHeight = 0.5;
  private currentCapsuleRadius = 0.4;

  private readonly colliderMeta = new Map<number, ColliderMetadata>();
  private readonly movingPlatforms = new Map<string, MovingPlatformRuntime>();

  constructor(gravityY = -22.0) {
    this.world = new RAPIER.World({ x: 0, y: gravityY, z: 0 });
    this.characterController = this.world.createCharacterController(0.02);
    this.characterController.setUp({ x: 0, y: 1, z: 0 });
    this.characterController.setSlideEnabled(true);
    this.characterController.enableAutostep(0.36, 0.22, true);
    this.characterController.setMaxSlopeClimbAngle((46 * Math.PI) / 180);
    this.characterController.setMinSlopeSlideAngle((47 * Math.PI) / 180);
    this.characterController.enableSnapToGround(0.22);
  }

  public createPlayerCapsule(
    position: { x: number; y: number; z: number },
    totalHeight: number,
    radius: number,
  ): void {
    if (this.playerBody) {
      this.world.removeRigidBody(this.playerBody);
    }

    const halfHeight = Math.max(0.05, (totalHeight - radius * 2) * 0.5);
    this.currentCapsuleHalfHeight = halfHeight;
    this.currentCapsuleRadius = radius;

    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      position.x,
      position.y + totalHeight * 0.5,
      position.z,
    );
    this.playerBody = this.world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius).setFriction(0.0);
    this.playerCollider = this.world.createCollider(colliderDesc, this.playerBody);
  }

  public setPlayerHeight(
    footPosition: { x: number; y: number; z: number },
    totalHeight: number,
    radius: number,
  ): void {
    if (!this.playerBody || !this.playerCollider) return;
    const halfHeight = Math.max(0.05, (totalHeight - radius * 2) * 0.5);
    if (Math.abs(halfHeight - this.currentCapsuleHalfHeight) < 0.005) return;

    this.world.removeCollider(this.playerCollider, false);
    this.currentCapsuleHalfHeight = halfHeight;
    this.currentCapsuleRadius = radius;

    const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius).setFriction(0.0);
    this.playerCollider = this.world.createCollider(colliderDesc, this.playerBody);
    this.setPlayerFootPosition(footPosition.x, footPosition.y, footPosition.z, totalHeight);
  }

  public setPlayerFootPosition(x: number, y: number, z: number, totalHeight: number): void {
    if (!this.playerBody) return;
    const centerY = y + totalHeight * 0.5;
    this.playerBody.setTranslation({ x, y: centerY, z }, true);
    this.playerBody.setNextKinematicTranslation({ x, y: centerY, z });
    this.world.propagateModifiedBodyPositionsToColliders();
    this.world.updateSceneQueries();
  }

  public canStandUp(
    footPosition: { x: number; y: number; z: number },
    standHeight: number,
  ): boolean {
    const startY = footPosition.y + 0.5;
    const checkDist = standHeight - 0.45;
    const ray = new RAPIER.Ray(
      { x: footPosition.x, y: startY, z: footPosition.z },
      { x: 0, y: 1, z: 0 },
    );
    const hit = this.world.castRay(
      ray,
      checkDist,
      true,
      undefined,
      undefined,
      this.playerCollider ?? undefined,
      this.playerBody ?? undefined,
    );
    return hit === null;
  }

  public addStaticBox(
    id: string,
    center: { x: number; y: number; z: number },
    size: { x: number; y: number; z: number },
    rotationEulerRad?: { x: number; y: number; z: number },
    meta?: Partial<ColliderMetadata>,
  ): number {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
    if (rotationEulerRad) {
      const q = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotationEulerRad.x, rotationEulerRad.y, rotationEulerRad.z, 'XYZ'),
      );
      bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    }
    const body = this.world.createRigidBody(bodyDesc);
    const colDesc = RAPIER.ColliderDesc.cuboid(size.x * 0.5, size.y * 0.5, size.z * 0.5);
    const collider = this.world.createCollider(colDesc, body);

    this.colliderMeta.set(collider.handle, {
      id,
      surfaceType: meta?.surfaceType ?? 'concrete',
      isWallRunnable: meta?.isWallRunnable ?? true,
    });
    return collider.handle;
  }

  public addStaticCylinder(
    id: string,
    center: { x: number; y: number; z: number },
    radius: number,
    height: number,
    meta?: Partial<ColliderMetadata>,
  ): number {
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
    const body = this.world.createRigidBody(bodyDesc);
    const colDesc = RAPIER.ColliderDesc.cylinder(height * 0.5, radius);
    const collider = this.world.createCollider(colDesc, body);

    this.colliderMeta.set(collider.handle, {
      id,
      surfaceType: meta?.surfaceType ?? 'concrete',
      isWallRunnable: meta?.isWallRunnable ?? true,
    });
    return collider.handle;
  }

  public addMovingPlatform(
    id: string,
    startPos: THREE.Vector3,
    endPos: THREE.Vector3,
    size: { x: number; y: number; z: number },
    speed: number,
    phaseOffset = 0,
    mesh?: THREE.Object3D,
    surfaceType: SurfaceMaterialType = 'metal',
  ): MovingPlatformRuntime {
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(
      startPos.x,
      startPos.y,
      startPos.z,
    );
    const body = this.world.createRigidBody(bodyDesc);
    const colDesc = RAPIER.ColliderDesc.cuboid(size.x * 0.5, size.y * 0.5, size.z * 0.5);
    const collider = this.world.createCollider(colDesc, body);

    this.colliderMeta.set(collider.handle, {
      id,
      surfaceType,
      isWallRunnable: false,
      movingPlatformId: id,
    });

    const runtime: MovingPlatformRuntime = {
      id,
      body,
      colliderHandle: collider.handle,
      mesh,
      startPos: startPos.clone(),
      endPos: endPos.clone(),
      speed,
      phaseOffset,
      currentPos: startPos.clone(),
      previousPos: startPos.clone(),
      frameDelta: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
    };
    this.movingPlatforms.set(id, runtime);
    return runtime;
  }

  public updateMovingPlatforms(elapsed: number, fixedDt: number): void {
    for (const platform of this.movingPlatforms.values()) {
      platform.previousPos.copy(platform.currentPos);
      const t = 0.5 - 0.5 * Math.cos(elapsed * platform.speed + platform.phaseOffset);
      platform.currentPos.lerpVectors(platform.startPos, platform.endPos, t);
      platform.frameDelta.subVectors(platform.currentPos, platform.previousPos);
      if (fixedDt > 1e-5) {
        platform.velocity.copy(platform.frameDelta).divideScalar(fixedDt);
      }
      platform.body.setNextKinematicTranslation({
        x: platform.currentPos.x,
        y: platform.currentPos.y,
        z: platform.currentPos.z,
      });
      if (platform.mesh) {
        platform.mesh.position.copy(platform.currentPos);
      }
    }
  }

  public getMovingPlatform(id: string): MovingPlatformRuntime | undefined {
    return this.movingPlatforms.get(id);
  }

  public step(fixedDt: number): void {
    this.world.timestep = fixedDt;
    this.world.step();
    this.world.updateSceneQueries();
  }

  public moveCharacter(
    footPosition: { x: number; y: number; z: number },
    totalHeight: number,
    desiredDelta: { x: number; y: number; z: number },
    enableGroundSnap: boolean,
    snapDistance: number,
  ): MoveStepResult {
    if (!this.playerBody || !this.playerCollider) {
      return {
        appliedDelta: desiredDelta,
        grounded: false,
        hitCeiling: false,
        wallNormals: [],
      };
    }

    if (enableGroundSnap) {
      this.characterController.enableSnapToGround(snapDistance);
    } else {
      this.characterController.disableSnapToGround();
    }

    const playerHandle = this.playerCollider.handle;
    this.characterController.computeColliderMovement(
      this.playerCollider,
      desiredDelta,
      undefined,
      undefined,
      (col) => col.handle !== playerHandle,
    );

    const moved = this.characterController.computedMovement();
    const grounded = this.characterController.computedGrounded();

    const newFootX = footPosition.x + moved.x;
    const newFootY = footPosition.y + moved.y;
    const newFootZ = footPosition.z + moved.z;
    const centerY = newFootY + totalHeight * 0.5;

    this.playerBody.setTranslation({ x: newFootX, y: centerY, z: newFootZ }, true);
    this.playerBody.setNextKinematicTranslation({ x: newFootX, y: centerY, z: newFootZ });
    this.world.propagateModifiedBodyPositionsToColliders();
    this.world.updateSceneQueries();

    let hitCeiling = false;
    let groundMetadata: ColliderMetadata | undefined;
    const wallNormals: Array<{ x: number; y: number; z: number }> = [];

    const numCols = this.characterController.numComputedCollisions();
    for (let i = 0; i < numCols; i++) {
      const col = this.characterController.computedCollision(i);
      if (!col) continue;
      const n = col.normal1;
      if (n.y < -0.55) {
        hitCeiling = true;
      } else if (Math.abs(n.y) < 0.45) {
        wallNormals.push({ x: n.x, y: n.y, z: n.z });
      } else if (n.y >= 0.45 && col.collider) {
        groundMetadata = this.colliderMeta.get(col.collider.handle);
      }
    }

    return {
      appliedDelta: { x: moved.x, y: moved.y, z: moved.z },
      grounded,
      hitCeiling,
      wallNormals,
      groundMetadata,
    };
  }

  public probeGround(footPosition: { x: number; y: number; z: number }, maxDist = 0.35): GroundHitInfo {
    const offsets = [
      [0, 0],
      [this.currentCapsuleRadius * 0.65, 0],
      [-this.currentCapsuleRadius * 0.65, 0],
      [0, this.currentCapsuleRadius * 0.65],
      [0, -this.currentCapsuleRadius * 0.65],
    ];

    const rayOriginY = footPosition.y + 0.25;
    const rayMaxToi = 0.25 + maxDist;

    let bestHit: RAPIER.RayColliderIntersection | null = null;

    for (const [ox, oz] of offsets) {
      const ray = new RAPIER.Ray(
        { x: footPosition.x + ox, y: rayOriginY, z: footPosition.z + oz },
        { x: 0, y: -1, z: 0 },
      );
      const hit = this.world.castRayAndGetNormal(
        ray,
        rayMaxToi,
        true,
        undefined,
        undefined,
        this.playerCollider ?? undefined,
        this.playerBody ?? undefined,
      );
      if (hit && hit.normal.y > 0.5) {
        if (!bestHit || hit.timeOfImpact < bestHit.timeOfImpact) {
          bestHit = hit;
        }
      }
    }

    if (!bestHit) {
      return {
        grounded: false,
        normalX: 0,
        normalY: 1,
        normalZ: 0,
        distance: Infinity,
        surfaceType: 'concrete',
      };
    }

    const meta = this.colliderMeta.get(bestHit.collider.handle);
    const dist = Math.max(0, bestHit.timeOfImpact - 0.25);

    return {
      grounded: dist <= maxDist,
      normalX: bestHit.normal.x,
      normalY: bestHit.normal.y,
      normalZ: bestHit.normal.z,
      distance: dist,
      surfaceType: meta?.surfaceType ?? 'concrete',
      movingPlatformId: meta?.movingPlatformId,
    };
  }

  public detectWalls(
    footPosition: { x: number; y: number; z: number },
    yawRad: number,
    detectDistance: number,
  ): WallHitInfo | null {
    const chestY = footPosition.y + 1.0;
    // Right vector for camera yaw: (cos(yaw), 0, -sin(yaw))
    const rightX = Math.cos(yawRad);
    const rightZ = -Math.sin(yawRad);

    const checkSide = (dirX: number, dirZ: number, side: 'left' | 'right'): WallHitInfo | null => {
      const ray = new RAPIER.Ray(
        { x: footPosition.x, y: chestY, z: footPosition.z },
        { x: dirX, y: 0, z: dirZ },
      );
      const hit = this.world.castRayAndGetNormal(
        ray,
        detectDistance,
        true,
        undefined,
        undefined,
        this.playerCollider ?? undefined,
        this.playerBody ?? undefined,
      );
      if (!hit) return null;
      const meta = this.colliderMeta.get(hit.collider.handle);
      if (meta && !meta.isWallRunnable) return null;

      // Must be a vertical or near-vertical wall
      if (Math.abs(hit.normal.y) > 0.25) return null;

      const nHoriz = Math.hypot(hit.normal.x, hit.normal.z);
      if (nHoriz < 1e-4) return null;

      return {
        hit: true,
        side,
        normalX: hit.normal.x / nHoriz,
        normalY: 0,
        normalZ: hit.normal.z / nHoriz,
        distance: hit.timeOfImpact,
        surfaceType: meta?.surfaceType ?? 'concrete',
      };
    };

    const rightHit = checkSide(rightX, rightZ, 'right');
    const leftHit = checkSide(-rightX, -rightZ, 'left');

    if (rightHit && leftHit) {
      return rightHit.distance <= leftHit.distance ? rightHit : leftHit;
    }
    return rightHit ?? leftHit;
  }

  public clearLevelColliders(): void {
    const handlesToRemove: number[] = [];
    this.world.bodies.forEach((body) => {
      if (this.playerBody && body.handle === this.playerBody.handle) return;
      handlesToRemove.push(body.handle);
    });
    for (const h of handlesToRemove) {
      const b = this.world.getRigidBody(h);
      if (b) this.world.removeRigidBody(b);
    }
    this.colliderMeta.clear();
    this.movingPlatforms.clear();
    this.world.updateSceneQueries();
  }

  public getColliderCount(): number {
    return this.colliderMeta.size;
  }

  public getMovingPlatformCount(): number {
    return this.movingPlatforms.size;
  }

  public dispose(): void {
    this.world.free();
  }
}
