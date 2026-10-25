import { describe, expect, it, beforeAll } from 'vitest';
import { DEFAULT_MOVEMENT_CONFIG } from '../../src/config/movementConfig';
import {
  accelerateHorizontal,
  applyAirMovement,
  applyGroundFriction,
  computeEffectiveGravity,
  computeSlideStep,
  computeWallJumpVelocity,
  computeWishDirection,
} from '../../src/game/movement/MovementMath';
import { ensureRapierInitialized, PhysicsWorld } from '../../src/game/physics/PhysicsWorld';
import { EventBus } from '../../src/game/core/EventBus';
import { PlayerController } from '../../src/game/movement/PlayerController';
import { InputManager, type InputSnapshot } from '../../src/game/input/InputManager';

function makeInput(overrides?: Partial<InputSnapshot>): InputSnapshot {
  return {
    moveForward: 0,
    moveRight: 0,
    isSprinting: false,
    isWalkingSlow: false,
    isSlidingHeld: false,
    isJumpHeld: false,
    jumpBuffered: false,
    resetRequested: false,
    pauseRequested: false,
    lookDeltaX: 0,
    lookDeltaY: 0,
    ...overrides,
  };
}

describe('MovementMath — Pure Physics Formulas', () => {
  it('computes forward wish direction along -Z when yaw=0', () => {
    const dir = computeWishDirection(1, 0, 0);
    expect(dir.x).toBeCloseTo(0, 4);
    expect(dir.z).toBeCloseTo(-1, 4);
  });

  it('computes right wish direction along +X when yaw=0', () => {
    const dir = computeWishDirection(0, 1, 0);
    expect(dir.x).toBeCloseTo(1, 4);
    expect(dir.z).toBeCloseTo(0, 4);
  });

  it('applies ground friction and stops cleanly at low speeds', () => {
    const after = applyGroundFriction(7.5, 0, 8.0, 1 / 60);
    expect(after.x).toBeLessThan(7.5);
    expect(after.x).toBeGreaterThan(6.0);

    const stopped = applyGroundFriction(0.03, 0, 8.0, 1 / 60);
    expect(stopped.x).toBe(0);
    expect(stopped.z).toBe(0);
  });

  it('accelerates progressively toward wishSpeed and preserves excess momentum', () => {
    const step1 = accelerateHorizontal(0, 0, 0, -1, 11.0, 12.0, 1 / 60);
    expect(step1.z).toBeLessThan(0);
    expect(Math.abs(step1.z)).toBeGreaterThan(1.0);

    // Momentum preservation: if moving at 16 m/s (from a slide jump), accelerating with wishSpeed=11 does NOT clamp speed down
    const preserved = accelerateHorizontal(0, -16.0, 0, -1, 11.0, 12.0, 1 / 60);
    expect(preserved.z).toBeCloseTo(-16.0, 4);
  });

  it('gains speed during perpendicular air strafing (Bunny Hop math)', () => {
    const baseSpeed = 10.0;
    // Moving along -Z, strafing right (+X)
    const after = applyAirMovement(0, -baseSpeed, 1, 0, DEFAULT_MOVEMENT_CONFIG, 1 / 60);
    const newSpeed = Math.hypot(after.x, after.z);
    expect(newSpeed).toBeGreaterThan(baseSpeed);
  });

  it('accelerates downhill during slide on a 30-degree slope and respects max slide cap', () => {
    const theta = (30 * Math.PI) / 180;
    // Slope descending toward -Z: normal is (0, cos(30), -sin(30))
    const nx = 0;
    const ny = Math.cos(theta);
    const nz = -Math.sin(theta);

    let vx = 0;
    let vz = -8.0;
    for (let i = 0; i < 120; i++) {
      const next = computeSlideStep(vx, vz, nx, ny, nz, 0, -1, DEFAULT_MOVEMENT_CONFIG, 1 / 60);
      vx = next.x;
      vz = next.z;
    }
    const finalSpeed = Math.hypot(vx, vz);
    expect(finalSpeed).toBeGreaterThan(14.0);
    expect(finalSpeed).toBeLessThanOrEqual(DEFAULT_MOVEMENT_CONFIG.speedSlideMax + 0.001);
  });

  it('computes variable jump gravity correctly', () => {
    const gHold = computeEffectiveGravity(5.0, true, false, DEFAULT_MOVEMENT_CONFIG);
    const gCut = computeEffectiveGravity(5.0, false, false, DEFAULT_MOVEMENT_CONFIG);
    const gFall = computeEffectiveGravity(-2.0, false, false, DEFAULT_MOVEMENT_CONFIG);
    const gWall = computeEffectiveGravity(-1.0, false, true, DEFAULT_MOVEMENT_CONFIG);

    expect(gCut).toBeGreaterThan(gHold);
    expect(gFall).toBeGreaterThan(gHold);
    expect(gWall).toBeLessThan(gHold * 0.5);
  });

  it('computes wall jump repulsion and upward impulse', () => {
    // Wall normal pointing +X
    const wj = computeWallJumpVelocity(0, -9.0, 1, 0, 0, DEFAULT_MOVEMENT_CONFIG);
    expect(wj.x).toBeGreaterThanOrEqual(DEFAULT_MOVEMENT_CONFIG.wallJumpRepulseVelocity - 0.1);
    expect(wj.y).toBeCloseTo(DEFAULT_MOVEMENT_CONFIG.wallJumpUpVelocity, 3);
    expect(wj.z).toBeLessThan(-9.0);
  });
});

describe('PlayerController & Rapier3D Integration', () => {
  beforeAll(async () => {
    await ensureRapierInitialized();
  });

  it('accelerates to sprint speed on flat ground and reaches expected jump height', () => {
    const physics = new PhysicsWorld();
    const events = new EventBus();
    const controller = new PlayerController(physics, events, { ...DEFAULT_MOVEMENT_CONFIG });
    const dummyInputManager = {
      consumeJumpBuffer: () => {},
    } as unknown as InputManager;

    // Create a large flat floor from z=10 to z=-100 (top surface at y=0)
    physics.addStaticBox('floor', { x: 0, y: -1, z: -45 }, { x: 20, y: 2, z: 120 });
    physics.step(1 / 60);

    controller.spawnAt(0, 0, 0, 0);

    // Sprint forward for 1.5 seconds (90 ticks)
    for (let i = 0; i < 90; i++) {
      physics.step(1 / 60);
      controller.fixedUpdate(
        1 / 60,
        makeInput({ moveForward: 1, isSprinting: true }),
        dummyInputManager,
      );
    }

    expect(controller.isGrounded).toBe(true);
    expect(controller.state).toBe('SPRINTING');
    expect(controller.getHorizontalSpeed()).toBeGreaterThan(10.5);

    // Now trigger a full jump and measure peak height and horizontal distance
    const zBeforeJump = controller.position.z;
    let maxHeight = 0;

    physics.step(1 / 60);
    controller.fixedUpdate(
      1 / 60,
      makeInput({ moveForward: 1, isSprinting: true, isJumpHeld: true, jumpBuffered: true }),
      dummyInputManager,
    );

    for (let i = 0; i < 60; i++) {
      physics.step(1 / 60);
      controller.fixedUpdate(
        1 / 60,
        makeInput({ moveForward: 1, isSprinting: true, isJumpHeld: true }),
        dummyInputManager,
      );
      if (controller.position.y > maxHeight) {
        maxHeight = controller.position.y;
      }
      if (i > 5 && controller.isGrounded) break;
    }

    const jumpDist = Math.abs(controller.position.z - zBeforeJump);
    expect(maxHeight).toBeGreaterThan(1.45);
    expect(maxHeight).toBeLessThan(1.95);
    expect(jumpDist).toBeGreaterThan(7.5);

    physics.dispose();
  });

  it('grants Coyote Time jump after walking off a platform ledge', () => {
    const physics = new PhysicsWorld();
    const events = new EventBus();
    const controller = new PlayerController(physics, events, { ...DEFAULT_MOVEMENT_CONFIG });
    const dummyInputManager = {
      consumeJumpBuffer: () => {},
    } as unknown as InputManager;

    // Platform ends at z = 0
    physics.addStaticBox('ledge', { x: 0, y: -1, z: 4 }, { x: 10, y: 2, z: 8 });
    physics.step(1 / 60);

    controller.spawnAt(0, 0, 1.0, 0);

    // Run off the edge past z = 0
    for (let i = 0; i < 20; i++) {
      physics.step(1 / 60);
      controller.fixedUpdate(1 / 60, makeInput({ moveForward: 1 }), dummyInputManager);
      if (!controller.isGrounded) break;
    }

    expect(controller.isGrounded).toBe(false);

    // Step 2 frames in air (33ms < 130ms coyote window) and press Jump
    physics.step(1 / 60);
    controller.fixedUpdate(1 / 60, makeInput({ moveForward: 1 }), dummyInputManager);

    physics.step(1 / 60);
    controller.fixedUpdate(
      1 / 60,
      makeInput({ moveForward: 1, isJumpHeld: true, jumpBuffered: true }),
      dummyInputManager,
    );

    expect(controller.velocity.y).toBeCloseTo(
      DEFAULT_MOVEMENT_CONFIG.jumpVelocity - DEFAULT_MOVEMENT_CONFIG.gravityBase * (1 / 60),
      2,
    );
    expect(controller.state).toBe('JUMPING');

    physics.dispose();
  });

  it('attaches to a vertical wall for Wall Run and executes Wall Jump repulsion', () => {
    const physics = new PhysicsWorld();
    const events = new EventBus();
    const controller = new PlayerController(physics, events, { ...DEFAULT_MOVEMENT_CONFIG });
    const dummyInputManager = {
      consumeJumpBuffer: () => {},
    } as unknown as InputManager;

    // Create a vertical wall on the right side (x = 0.95, extending along Z)
    physics.addStaticBox(
      'right-wall',
      { x: 1.0, y: 4, z: -10 },
      { x: 1.0, y: 10, z: 30 },
      undefined,
      { surfaceType: 'basalt', isWallRunnable: true },
    );
    physics.step(1 / 60);

    // Spawn player in the air right next to the wall (x = 0, y = 3, z = 0) with forward speed
    controller.spawnAt(0.0, 3.0, 0.0, 0);
    controller.isGrounded = false;
    controller.velocity.set(0, -1.0, -9.5);

    // Step 5 frames holding forward next to the right wall
    for (let i = 0; i < 5; i++) {
      physics.step(1 / 60);
      controller.fixedUpdate(
        1 / 60,
        makeInput({ moveForward: 1, isSprinting: true }),
        dummyInputManager,
      );
    }

    expect(controller.wallRunSide).toBe('right');
    expect(controller.state).toBe('WALL_RUNNING');

    // Now trigger Wall Jump
    physics.step(1 / 60);
    controller.fixedUpdate(
      1 / 60,
      makeInput({ moveForward: 1, isSprinting: true, isJumpHeld: true, jumpBuffered: true }),
      dummyInputManager,
    );

    expect(controller.wallRunSide).toBe('none');
    expect(controller.state).toBe('JUMPING');
    // Wall is on the right (+X), so wall normal points -X; repulsion pushes player toward -X
    expect(controller.velocity.x).toBeLessThan(-5.0);
    expect(controller.velocity.y).toBeGreaterThan(7.0);

    physics.dispose();
  });
});
