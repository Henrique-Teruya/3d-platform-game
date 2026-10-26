import { beforeAll, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { DEFAULT_MOVEMENT_CONFIG } from '../../src/config/movementConfig';
import { CheckpointSystem } from '../../src/game/checkpoints/CheckpointSystem';
import { EventBus } from '../../src/game/core/EventBus';
import type { InputManager, InputSnapshot } from '../../src/game/input/InputManager';
import { LEVELS, getLevelById, getNextLevelId } from '../../src/game/levels/LevelRegistry';
import type { LevelDefinition } from '../../src/game/levels/LevelTypes';
import { PlayerController } from '../../src/game/movement/PlayerController';
import { ensureRapierInitialized, PhysicsWorld } from '../../src/game/physics/PhysicsWorld';
import type { BrutalistBuilder } from '../../src/game/world/BrutalistBuilder';

function registerLevelCollidersOnly(level: LevelDefinition, physics: PhysicsWorld): void {
  physics.clearLevelColliders();
  for (const plat of level.platforms) {
    const [tx, ty, tz] = plat.topPosition;
    const [sx, sy, sz] = plat.size;
    physics.addStaticBox(
      plat.id,
      { x: tx, y: ty - sy * 0.5, z: tz },
      { x: sx, y: sy, z: sz },
      undefined,
      {
        surfaceType: plat.surfaceType ?? 'concrete',
        isWallRunnable: plat.isWallRunnable ?? false,
      },
    );
  }
  for (const ramp of level.ramps) {
    const [cx, cy, cz] = ramp.center;
    const [sx, sy, sz] = ramp.size;
    const pitchRad = (ramp.pitchDeg * Math.PI) / 180;
    const yawRad = ((ramp.yawDeg ?? 0) * Math.PI) / 180;
    physics.addStaticBox(
      ramp.id,
      { x: cx, y: cy, z: cz },
      { x: sx, y: sy, z: sz },
      { x: pitchRad, y: yawRad, z: 0 },
      { surfaceType: 'basalt', isWallRunnable: false },
    );
  }
  for (const wp of level.wallPanels) {
    const [cx, cy, cz] = wp.center;
    const [sx, sy, sz] = wp.size;
    const yawRad = ((wp.yawDeg ?? 0) * Math.PI) / 180;
    physics.addStaticBox(
      wp.id,
      { x: cx, y: cy, z: cz },
      { x: sx, y: sy, z: sz },
      { x: 0, y: yawRad, z: 0 },
      { surfaceType: 'basalt', isWallRunnable: true },
    );
  }
  for (const arch of level.arches) {
    const [bx, by, bz] = arch.basePosition;
    const halfSpan = arch.openingWidth * 0.5 + arch.pillarWidth * 0.5;
    const totalPillarH = arch.openingHeight + arch.lintelHeight;
    const pillarCenterY = by + totalPillarH * 0.5;
    const lintelCenterY = by + arch.openingHeight + arch.lintelHeight * 0.5;
    const totalWidth = arch.openingWidth + arch.pillarWidth * 2;
    physics.addStaticBox(
      `${arch.id}-left`,
      { x: bx - halfSpan, y: pillarCenterY, z: bz },
      { x: arch.pillarWidth, y: totalPillarH, z: arch.depth },
    );
    physics.addStaticBox(
      `${arch.id}-right`,
      { x: bx + halfSpan, y: pillarCenterY, z: bz },
      { x: arch.pillarWidth, y: totalPillarH, z: arch.depth },
    );
    physics.addStaticBox(
      `${arch.id}-lintel`,
      { x: bx, y: lintelCenterY, z: bz },
      { x: totalWidth, y: arch.lintelHeight, z: arch.depth },
    );
  }
  for (const mp of level.movingPlatforms) {
    const [sx, sy, sz] = mp.size;
    physics.addMovingPlatform(
      mp.id,
      new THREE.Vector3(mp.startTopPos[0], mp.startTopPos[1] - sy * 0.5, mp.startTopPos[2]),
      new THREE.Vector3(mp.endTopPos[0], mp.endTopPos[1] - sy * 0.5, mp.endTopPos[2]),
      { x: sx, y: sy, z: sz },
      mp.speed,
      mp.phaseOffset ?? 0,
    );
  }
  if (level.launchPads) {
    for (const lp of level.launchPads) {
      const [px, py, pz] = lp.position;
      const [sx, sy, sz] = lp.size ?? [3.6, 0.45, 3.6];
      physics.addStaticBox(
        `launchpad-${lp.id}`,
        { x: px, y: py - sy * 0.5, z: pz },
        { x: sx, y: sy, z: sz },
        undefined,
        { surfaceType: 'metal', isWallRunnable: false },
      );
    }
  }
}

describe('Level Design, Checkpoints & Physical Playability Verification', () => {
  beforeAll(async () => {
    await ensureRapierInitialized();
  });

  it('validates structural metadata and checkpoints for all 9 levels', () => {
    expect(LEVELS.length).toBe(9);
    for (const lvl of LEVELS) {
      expect(lvl.platforms.length).toBeGreaterThanOrEqual(4);
      expect(lvl.checkpoints.length).toBeGreaterThanOrEqual(3);
      expect(lvl.spawnPoint[1]).toBeGreaterThan(lvl.voidKillY);
      expect(lvl.finishPortal.radius).toBeGreaterThan(2.0);
    }
  });

  it('launches player into high parabolic arc when triggered by a launch pad', () => {
    const physics = new PhysicsWorld(-DEFAULT_MOVEMENT_CONFIG.gravityBase);
    const events = new EventBus();
    const player = new PlayerController(physics, events, DEFAULT_MOVEMENT_CONFIG);
    player.spawnAt(0, 0, 0);

    let launchedEventFired = false;
    events.on('PLAYER_LAUNCHED', () => {
      launchedEventFired = true;
    });

    player.applyLaunch(0, 22.0, -35.0);
    expect(player.velocity.y).toBe(22.0);
    expect(player.velocity.z).toBe(-35.0);
    expect(player.isGrounded).toBe(false);
    expect(launchedEventFired).toBe(true);
  });

  it('loops Level 09 back into Level 09 for infinite traversal', () => {
    const next = getNextLevelId('level-09');
    expect(next).toBe('level-09');
  });

  it('activates checkpoints, respawns safely from Void fall, and completes Level 01 via real physics', () => {
    const level = getLevelById('level-01');
    const physics = new PhysicsWorld();
    const events = new EventBus();
    const dummyBuilder = {
      setCheckpointActivated: () => {},
    } as unknown as BrutalistBuilder;
    const checkpoints = new CheckpointSystem(events, dummyBuilder);
    const player = new PlayerController(physics, events, { ...DEFAULT_MOVEMENT_CONFIG });
    const dummyInputManager = {
      consumeJumpBuffer: () => {},
    } as unknown as InputManager;

    registerLevelCollidersOnly(level, physics);
    checkpoints.initForLevel(level);
    player.spawnAt(level.spawnPoint[0], level.spawnPoint[1], level.spawnPoint[2], 0);
    physics.step(1 / 60);

    // Run forward for 1.5s to reach Checkpoint 0 at z = -5
    for (let i = 0; i < 90; i++) {
      physics.step(1 / 60);
      const snap: InputSnapshot = {
        moveForward: 1,
        moveRight: 0,
        isSprinting: true,
        isWalkingSlow: false,
        isSlidingHeld: false,
        isJumpHeld: false,
        jumpBuffered: false,
        resetRequested: false,
        pauseRequested: false,
        lookDeltaX: 0,
        lookDeltaY: 0,
      };
      player.fixedUpdate(1 / 60, snap, dummyInputManager);
      checkpoints.update(level, player, i / 60);
    }

    expect(checkpoints.activeCheckpointIndex).toBeGreaterThanOrEqual(0);

    // Simulate falling into Void (y < voidKillY) and verify instant respawn at Checkpoint 0
    player.position.y = level.voidKillY - 5;
    const voidRes = checkpoints.update(level, player, 2.0);
    expect(voidRes.triggeredRespawn).toBe(true);
    expect(player.position.z).toBeCloseTo(level.checkpoints[0].position[2], 1);
    expect(player.velocity.length()).toBe(0);

    // Now simulate an automated runner traversing Level 01 from start to Finish Portal
    player.spawnAt(level.spawnPoint[0], level.spawnPoint[1], level.spawnPoint[2], 0);
    checkpoints.initForLevel(level);

    let completed = false;
    for (let tick = 0; tick < 60 * 25; tick++) {
      const dt = 1 / 60;
      physics.updateMovingPlatforms(tick * dt, dt);
      physics.step(dt);

      const z = player.position.z;
      // Slide when passing under the slide gate around z in [-51, -57] or on the slide ramp [-69, -81]
      const shouldSlide = (z < -50 && z > -58) || (z < -69 && z > -80);
      // Jump near platform edges: z near -11.5, -24.5, -39, -94.5
      const nearJumpEdge =
        (z < -10.8 && z > -12.3) ||
        (z < -23.8 && z > -25.3) ||
        (z < -38.2 && z > -39.8) ||
        (z < -93.8 && z > -95.5);

      const snap: InputSnapshot = {
        moveForward: 1,
        moveRight: 0,
        isSprinting: true,
        isWalkingSlow: false,
        isSlidingHeld: shouldSlide,
        isJumpHeld: nearJumpEdge || !player.isGrounded,
        jumpBuffered: nearJumpEdge && player.isGrounded,
        resetRequested: false,
        pauseRequested: false,
        lookDeltaX: 0,
        lookDeltaY: 0,
      };

      player.fixedUpdate(dt, snap, dummyInputManager);
      const status = checkpoints.update(level, player, tick * dt);
      if (status.triggeredComplete) {
        completed = true;
        break;
      }
    }

    expect(checkpoints.activeCheckpointIndex).toBe(level.checkpoints.length - 1);
    expect(completed).toBe(true);

    physics.dispose();
  });

  it('completes Level 02 (The Monoliths) and Level 03 (The Ascension) via real physics simulation', () => {
    for (const levelId of ['level-02', 'level-03']) {
      const level = getLevelById(levelId);
      const physics = new PhysicsWorld();
      const events = new EventBus();
      const dummyBuilder = {
        setCheckpointActivated: () => {},
      } as unknown as BrutalistBuilder;
      const checkpoints = new CheckpointSystem(events, dummyBuilder);
      const player = new PlayerController(physics, events, { ...DEFAULT_MOVEMENT_CONFIG });
      const dummyInputManager = {
        consumeJumpBuffer: () => {},
      } as unknown as InputManager;

      registerLevelCollidersOnly(level, physics);
      checkpoints.initForLevel(level);
      player.spawnAt(level.spawnPoint[0], level.spawnPoint[1], level.spawnPoint[2], 0);
      physics.step(1 / 60);

      let completed = false;
      for (let tick = 0; tick < 60 * 32; tick++) {
        const dt = 1 / 60;
        physics.updateMovingPlatforms(tick * dt, dt);
        physics.step(dt);

        // If the bot ever falls off, respawn at active checkpoint and continue
        const z = player.position.z;

        // Slide under gates and down chutes
        const shouldSlide =
          levelId === 'level-02'
            ? (z < -30.5 && z > -35.5) || (z < -39 && z > -53)
            : (z < -47.5 && z > -52.5) || (z < -55 && z > -67);

        // Steer slightly left around the safe mid pad on level-02 (-63 to -74), then back to x=0
        let targetX = 0;
        if (levelId === 'level-02' && z < -62 && z > -74) {
          targetX = -3.2;
        }
        const dx = targetX - player.position.x;
        const moveRight = Math.max(-1, Math.min(1, dx * 0.8));

        // Probe ahead 1.1m to detect ledges automatically and jump at the optimal moment
        const probeAhead = physics.probeGround(
          { x: player.position.x, y: player.position.y, z: player.position.z - 1.2 },
          0.6,
        );
        const shouldJump = player.isGrounded && !probeAhead.grounded && !shouldSlide;

        const snap: InputSnapshot = {
          moveForward: 1,
          moveRight,
          isSprinting: true,
          isWalkingSlow: false,
          isSlidingHeld: shouldSlide,
          isJumpHeld: shouldJump || !player.isGrounded,
          jumpBuffered: shouldJump,
          resetRequested: false,
          pauseRequested: false,
          lookDeltaX: 0,
          lookDeltaY: 0,
        };

        player.fixedUpdate(dt, snap, dummyInputManager);
        const status = checkpoints.update(level, player, tick * dt);
        if (status.triggeredComplete) {
          completed = true;
          break;
        }
      }

      expect(checkpoints.activeCheckpointIndex, `${levelId} checkpoints`).toBe(
        level.checkpoints.length - 1,
      );
      expect(completed, `${levelId} completion`).toBe(true);
      physics.dispose();
    }
  });
});
