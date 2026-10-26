export type GameEventMap = {
  PLAYER_JUMPED: { velocity: number; isWallJump: boolean };
  PLAYER_LANDED: { fallSpeed: number; surfaceType: 'concrete' | 'basalt' | 'sand' | 'metal' };
  PLAYER_SLIDE_START: { speed: number };
  PLAYER_SLIDE_END: Record<string, never>;
  PLAYER_WALLRUN_START: { side: 'left' | 'right' };
  PLAYER_WALLRUN_END: Record<string, never>;
  PLAYER_FOOTSTEP: {
    speed: number;
    isSprinting: boolean;
    isWallRunning: boolean;
    surfaceType: 'concrete' | 'basalt' | 'sand' | 'metal';
  };
  CHECKPOINT_ACTIVATED: { index: number; total: number; name: string };
  PLAYER_RESPAWNED: { checkpointIndex: number };
  PLAYER_LAUNCHED: { impulseX: number; impulseY: number; impulseZ: number };
  LEVEL_STARTED: { levelId: string; levelName: string; subtitle: string };
  LEVEL_COMPLETED: { levelId: string; elapsedSeconds: number; isNewBest: boolean };
};

type EventHandler<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void;

export class EventBus {
  private readonly listeners = new Map<keyof GameEventMap, Set<(payload: never) => void>>();

  on<K extends keyof GameEventMap>(event: K, handler: EventHandler<K>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as (payload: never) => void);
    return () => this.off(event, handler);
  }

  off<K extends keyof GameEventMap>(event: K, handler: EventHandler<K>): void {
    this.listeners.get(event)?.delete(handler as (payload: never) => void);
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      (handler as EventHandler<K>)(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
