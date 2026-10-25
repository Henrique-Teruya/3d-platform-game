import * as THREE from 'three';
import type { EventBus } from '../core/EventBus';
import type { LevelDefinition } from '../levels/LevelTypes';
import type { PlayerController } from '../movement/PlayerController';
import type { BrutalistBuilder } from '../world/BrutalistBuilder';

export class CheckpointSystem {
  public activeCheckpointIndex = -1;
  private spawnPosition = new THREE.Vector3();
  private spawnYawRad = 0;
  private levelCompleted = false;

  constructor(
    private readonly events: EventBus,
    private readonly builder: BrutalistBuilder,
  ) {}

  public initForLevel(level: LevelDefinition): void {
    this.activeCheckpointIndex = -1;
    this.levelCompleted = false;
    this.spawnPosition.set(level.spawnPoint[0], level.spawnPoint[1], level.spawnPoint[2]);
    this.spawnYawRad = (level.spawnYawDeg * Math.PI) / 180;
  }

  public getSpawnState(): { position: THREE.Vector3; yawRad: number } {
    return {
      position: this.spawnPosition,
      yawRad: this.spawnYawRad,
    };
  }

  public teleportToCheckpoint(level: LevelDefinition, index: number, player: PlayerController): void {
    const cp = level.checkpoints[index];
    if (!cp) return;
    this.activeCheckpointIndex = index;
    this.spawnPosition.set(cp.position[0], cp.position[1], cp.position[2]);
    this.spawnYawRad = ((cp.spawnYawDeg ?? 0) * Math.PI) / 180;
    this.builder.setCheckpointActivated(index);
    player.spawnAt(this.spawnPosition.x, this.spawnPosition.y, this.spawnPosition.z, this.spawnYawRad);
  }

  public update(
    level: LevelDefinition,
    player: PlayerController,
    elapsedSeconds: number,
  ): { triggeredRespawn: boolean; triggeredComplete: boolean } {
    const pos = player.position;

    // 1. Check Void Kill Plane
    if (pos.y < level.voidKillY) {
      this.respawnAtActiveCheckpoint(player);
      return { triggeredRespawn: true, triggeredComplete: false };
    }

    // 2. Check Checkpoints
    for (let i = 0; i < level.checkpoints.length; i++) {
      if (i <= this.activeCheckpointIndex) continue;
      const cp = level.checkpoints[i];
      const radius = cp.radius ?? 3.8;
      const dx = pos.x - cp.position[0];
      const dy = pos.y - cp.position[1];
      const dz = pos.z - cp.position[2];

      if (dx * dx + dz * dz <= radius * radius && Math.abs(dy) <= 4.5) {
        this.activeCheckpointIndex = i;
        this.spawnPosition.set(cp.position[0], cp.position[1], cp.position[2]);
        this.spawnYawRad = ((cp.spawnYawDeg ?? 0) * Math.PI) / 180;
        this.builder.setCheckpointActivated(i);
        this.events.emit('CHECKPOINT_ACTIVATED', {
          index: i + 1,
          total: level.checkpoints.length,
          name: cp.name,
        });
      }
    }

    // 3. Check Finish Portal
    if (!this.levelCompleted) {
      const fp = level.finishPortal;
      const dx = pos.x - fp.position[0];
      const dy = pos.y - fp.position[1];
      const dz = pos.z - fp.position[2];
      if (dx * dx + dz * dz <= fp.radius * fp.radius && Math.abs(dy) <= 5.5) {
        this.levelCompleted = true;
        this.events.emit('LEVEL_COMPLETED', {
          levelId: level.id,
          elapsedSeconds,
          isNewBest: false,
        });
        return { triggeredRespawn: false, triggeredComplete: true };
      }
    }

    return { triggeredRespawn: false, triggeredComplete: false };
  }

  public respawnAtActiveCheckpoint(player: PlayerController): void {
    player.spawnAt(
      this.spawnPosition.x,
      this.spawnPosition.y + 0.1,
      this.spawnPosition.z,
      this.spawnYawRad,
    );
    this.events.emit('PLAYER_RESPAWNED', { checkpointIndex: this.activeCheckpointIndex });
  }
}
