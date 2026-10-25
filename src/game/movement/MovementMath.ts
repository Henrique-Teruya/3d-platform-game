import type { MovementConfig } from '../../config/movementConfig';

export interface Vec2XZ {
  x: number;
  z: number;
}

export interface Vec3XYZ {
  x: number;
  y: number;
  z: number;
}

/**
 * Computes normalized wish direction in world XZ from local input (forward, right) and camera yaw angle.
 * Follows Three.js camera convention where yaw=0 looks along -Z, and +X is right.
 */
export function computeWishDirection(
  moveForward: number,
  moveRight: number,
  yawRad: number,
  out: Vec2XZ = { x: 0, z: 0 },
): Vec2XZ {
  const len = Math.hypot(moveForward, moveRight);
  if (len < 1e-5) {
    out.x = 0;
    out.z = 0;
    return out;
  }
  const nf = moveForward / len;
  const nr = moveRight / len;

  // Forward vector for camera yaw in Three.js: (-sin(yaw), 0, -cos(yaw))
  // Right vector for camera yaw in Three.js: (cos(yaw), 0, -sin(yaw))
  const sinY = Math.sin(yawRad);
  const cosY = Math.cos(yawRad);

  const wx = -sinY * nf + cosY * nr;
  const wz = -cosY * nf - sinY * nr;
  const wLen = Math.hypot(wx, wz);

  if (wLen < 1e-5) {
    out.x = 0;
    out.z = 0;
  } else {
    out.x = wx / wLen;
    out.z = wz / wLen;
  }
  return out;
}

/**
 * Applies ground friction to horizontal velocity (vx, vz).
 */
export function applyGroundFriction(
  vx: number,
  vz: number,
  friction: number,
  dt: number,
  stopSpeed = 0.05,
  out: Vec2XZ = { x: 0, z: 0 },
): Vec2XZ {
  const speed = Math.hypot(vx, vz);
  if (speed <= stopSpeed) {
    out.x = 0;
    out.z = 0;
    return out;
  }

  const control = Math.max(speed, 2.0);
  const drop = control * friction * dt;
  const newSpeed = Math.max(0, speed - drop);
  const scale = newSpeed / speed;

  out.x = vx * scale;
  out.z = vz * scale;
  return out;
}

/**
 * Quake/Source-style directional projection acceleration.
 * Never reduces existing speed if projection already exceeds wishSpeed (preserving momentum).
 */
export function accelerateHorizontal(
  vx: number,
  vz: number,
  wishX: number,
  wishZ: number,
  wishSpeed: number,
  accel: number,
  dt: number,
  out: Vec2XZ = { x: 0, z: 0 },
): Vec2XZ {
  const wishMag = Math.hypot(wishX, wishZ);
  if (wishMag < 1e-5 || wishSpeed <= 0) {
    out.x = vx;
    out.z = vz;
    return out;
  }

  const nx = wishX / wishMag;
  const nz = wishZ / wishMag;

  const currentProj = vx * nx + vz * nz;
  const addSpeed = wishSpeed - currentProj;
  if (addSpeed <= 0) {
    out.x = vx;
    out.z = vz;
    return out;
  }

  const accelStep = Math.min(addSpeed, accel * wishSpeed * dt);
  out.x = vx + nx * accelStep;
  out.z = vz + nz * accelStep;
  return out;
}

/**
 * Air acceleration + responsive air steering that preserves horizontal speed magnitude.
 */
export function applyAirMovement(
  vx: number,
  vz: number,
  wishX: number,
  wishZ: number,
  config: MovementConfig,
  dt: number,
  out: Vec2XZ = { x: 0, z: 0 },
): Vec2XZ {
  // 1. Apply Quake/Source air strafe acceleration
  accelerateHorizontal(vx, vz, wishX, wishZ, config.airCapSpeed, config.accelAir, dt, out);

  // 2. Apply gentle air steering so the player can curve trajectories without losing speed
  const wishMag = Math.hypot(wishX, wishZ);
  const speed = Math.hypot(out.x, out.z);
  if (wishMag > 1e-4 && speed > 0.5 && config.airControlStrength > 0) {
    const dirX = out.x / speed;
    const dirZ = out.z / speed;
    const dot = dirX * wishX + dirZ * wishZ;

    // Only steer when wish direction is generally aligned or perpendicular (dot > -0.2)
    if (dot > -0.2) {
      const k = config.airControlStrength * dt * Math.max(0.25, dot * dot);
      const blendedX = dirX + wishX * k;
      const blendedZ = dirZ + wishZ * k;
      const blendedLen = Math.hypot(blendedX, blendedZ);
      if (blendedLen > 1e-5) {
        out.x = (blendedX / blendedLen) * speed;
        out.z = (blendedZ / blendedLen) * speed;
      }
    }
  }

  // If moving very slowly in air (standing jump), allow reaching basic walk speed
  if (wishMag > 1e-4 && speed < config.speedWalk * 0.85) {
    accelerateHorizontal(
      out.x,
      out.z,
      wishX,
      wishZ,
      config.speedWalk * 0.85,
      config.accelGround * 0.7,
      dt,
      out,
    );
  }

  return out;
}

/**
 * Computes slide velocity evolution on flat ground or slopes.
 */
export function computeSlideStep(
  vx: number,
  vz: number,
  normalX: number,
  normalY: number,
  normalZ: number,
  wishX: number,
  wishZ: number,
  config: MovementConfig,
  dt: number,
  out: Vec2XZ = { x: 0, z: 0 },
): Vec2XZ {
  // Apply low slide friction
  applyGroundFriction(vx, vz, config.frictionSlide, dt, 0.05, out);

  // Check slope angle
  const clampedNy = Math.max(-1, Math.min(1, normalY));
  const sinTheta = Math.sqrt(Math.max(0, 1 - clampedNy * clampedNy));

  if (sinTheta > 0.04) {
    // Downhill horizontal direction is proportional to (normalX, normalZ)
    const nHorizLen = Math.hypot(normalX, normalZ);
    if (nHorizLen > 1e-5) {
      const downX = normalX / nHorizLen;
      const downZ = normalZ / nHorizLen;
      const slopeAccel = config.gravityBase * sinTheta * 1.15;

      out.x += downX * slopeAccel * dt;
      out.z += downZ * slopeAccel * dt;
    }
  }

  // Subtle lateral steering while sliding
  const speed = Math.hypot(out.x, out.z);
  if (speed > 1.0 && Math.hypot(wishX, wishZ) > 0.1) {
    const steerFactor = 2.5 * dt;
    const blendedX = out.x + wishX * speed * steerFactor;
    const blendedZ = out.z + wishZ * speed * steerFactor;
    const newLen = Math.hypot(blendedX, blendedZ);
    if (newLen > 1e-5) {
      const clampedSpeed = Math.min(speed, config.speedSlideMax);
      out.x = (blendedX / newLen) * clampedSpeed;
      out.z = (blendedZ / newLen) * clampedSpeed;
      return out;
    }
  }

  // Hard cap at speedSlideMax
  if (speed > config.speedSlideMax) {
    const scale = config.speedSlideMax / speed;
    out.x *= scale;
    out.z *= scale;
  }

  return out;
}

/**
 * Computes effective vertical gravity based on current state (variable jump height, fall multiplier, wall run).
 */
export function computeEffectiveGravity(
  vy: number,
  isJumpHeld: boolean,
  isWallRunning: boolean,
  config: MovementConfig,
): number {
  if (isWallRunning) {
    return config.gravityBase * config.wallRunGravityMult;
  }
  if (vy > 0) {
    return isJumpHeld ? config.gravityBase : config.gravityBase * config.gravityCutMult;
  }
  return config.gravityBase * config.gravityFallMult;
}

/**
 * Checks whether a surface normal is walkable given maxWalkableSlopeDeg.
 */
export function isSlopeWalkable(normalY: number, maxWalkableSlopeDeg: number): boolean {
  const minNormalY = Math.cos((maxWalkableSlopeDeg * Math.PI) / 180);
  return normalY >= minNormalY;
}

/**
 * Projects a 3D velocity vector onto a plane defined by unit normal (nx, ny, nz) if moving into it.
 */
export function projectVelocityOnPlane(
  vx: number,
  vy: number,
  vz: number,
  nx: number,
  ny: number,
  nz: number,
  out: Vec3XYZ = { x: 0, y: 0, z: 0 },
): Vec3XYZ {
  const dot = vx * nx + vy * ny + vz * nz;
  if (dot < 0) {
    out.x = vx - nx * dot;
    out.y = vy - ny * dot;
    out.z = vz - nz * dot;
  } else {
    out.x = vx;
    out.y = vy;
    out.z = vz;
  }
  return out;
}

/**
 * Computes the 3D impulse velocity when performing a Wall Jump off a wall with normal (wnx, wnz).
 */
export function computeWallJumpVelocity(
  vx: number,
  vz: number,
  wallNormalX: number,
  wallNormalZ: number,
  yawRad: number,
  config: MovementConfig,
  out: Vec3XYZ = { x: 0, y: 0, z: 0 },
): Vec3XYZ {
  // Remove any velocity heading into the wall
  const intoWall = vx * wallNormalX + vz * wallNormalZ;
  let tangX = intoWall < 0 ? vx - wallNormalX * intoWall : vx;
  let tangZ = intoWall < 0 ? vz - wallNormalZ * intoWall : vz;

  // Camera forward horizontal vector
  const fwdX = -Math.sin(yawRad);
  const fwdZ = -Math.cos(yawRad);

  tangX += fwdX * config.wallJumpForwardBoost;
  tangZ += fwdZ * config.wallJumpForwardBoost;

  out.x = tangX + wallNormalX * config.wallJumpRepulseVelocity;
  out.z = tangZ + wallNormalZ * config.wallJumpRepulseVelocity;
  out.y = config.wallJumpUpVelocity;
  return out;
}
