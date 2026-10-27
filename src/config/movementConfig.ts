export interface MovementConfig {
  // Timestep & Dimensions
  fixedDeltaTime: number;
  playerHeightStand: number;
  cameraEyeHeightStand: number;
  playerHeightSlide: number;
  cameraEyeHeightSlide: number;
  playerRadius: number;

  // Ground Movement Speeds (m/s)
  speedWalk: number;
  speedRun: number;
  speedSprint: number;
  speedSlideMax: number;
  slideMinSpeedToStart: number;
  slideStopSpeed: number;
  slideBoostImpulse: number;

  // Acceleration & Friction
  accelGround: number;
  frictionGround: number;
  frictionSlide: number;
  accelAir: number;
  airCapSpeed: number;
  airControlStrength: number;

  // Jumping & Gravity
  jumpVelocity: number;
  gravityBase: number;
  gravityFallMult: number;
  gravityCutMult: number;
  terminalFallSpeed: number;
  coyoteTime: number;
  jumpBufferTime: number;

  // Slopes & Ground Detection
  maxWalkableSlopeDeg: number;
  groundSnapDistance: number;
  stepOffsetHeight: number;

  // Stomp & Propulsor
  stompDownwardVelocity: number;
  stompLaunchPadMultiplier: number;
  stompLaunchPadForwardMult: number;

  // Wall Parkour
  wallRunMinSpeed: number;
  wallRunMaxDuration: number;
  wallRunGravityMult: number;
  wallRunTargetSpeed: number;
  wallDetectDistance: number;
  wallJumpRepulseVelocity: number;
  wallJumpUpVelocity: number;
  wallJumpForwardBoost: number;
  wallJumpCooldown: number;

  // Camera & Feel
  baseFov: number;
  maxFovBoost: number;
  cameraWallRollDeg: number;
  cameraStrafeRollDeg: number;
  landingImpactMaxDip: number;
  landingImpactRecoverySpeed: number;
  headBobAmplitude: number;
  headBobFrequency: number;
}

export const DEFAULT_MOVEMENT_CONFIG: MovementConfig = {
  fixedDeltaTime: 1 / 60,
  playerHeightStand: 1.8,
  cameraEyeHeightStand: 1.68,
  playerHeightSlide: 0.9,
  cameraEyeHeightSlide: 0.82,
  playerRadius: 0.4,

  speedWalk: 4.0,
  speedRun: 7.8,
  speedSprint: 11.2,
  speedSlideMax: 18.5,
  slideMinSpeedToStart: 5.5,
  slideStopSpeed: 3.2,
  slideBoostImpulse: 1.8,

  accelGround: 12.5,
  frictionGround: 8.0,
  frictionSlide: 0.75,
  accelAir: 38.0,
  airCapSpeed: 2.8,
  airControlStrength: 6.5,

  jumpVelocity: 8.6,
  gravityBase: 22.0,
  gravityFallMult: 1.38,
  gravityCutMult: 2.15,
  terminalFallSpeed: -45.0,
  coyoteTime: 0.16,
  jumpBufferTime: 0.14,

  maxWalkableSlopeDeg: 46.0,
  groundSnapDistance: 0.45,
  stepOffsetHeight: 0.35,

  stompDownwardVelocity: -26.0,
  stompLaunchPadMultiplier: 1.65,
  stompLaunchPadForwardMult: 1.18,

  wallRunMinSpeed: 5.8,
  wallRunMaxDuration: 1.55,
  wallRunGravityMult: 0.24,
  wallRunTargetSpeed: 11.5,
  wallDetectDistance: 0.72,
  wallJumpRepulseVelocity: 7.2,
  wallJumpUpVelocity: 8.2,
  wallJumpForwardBoost: 2.4,
  wallJumpCooldown: 0.18,

  baseFov: 85,
  maxFovBoost: 12,
  cameraWallRollDeg: 10.0,
  cameraStrafeRollDeg: 2.8,
  landingImpactMaxDip: 0.22,
  landingImpactRecoverySpeed: 12.0,
  headBobAmplitude: 0.022,
  headBobFrequency: 9.5,
};

export function createMovementConfig(overrides?: Partial<MovementConfig>): MovementConfig {
  return {
    ...DEFAULT_MOVEMENT_CONFIG,
    ...overrides,
  };
}
