import GUI from 'lil-gui';
import type { MovementConfig } from '../../config/movementConfig';

export class DebugGui {
  private gui: GUI | null = null;

  constructor(config: MovementConfig) {
    const isDebugUrl = new URLSearchParams(window.location.search).has('debug');
    if (!isDebugUrl) return;

    this.gui = new GUI({ title: 'FLOAT — Movement Tuning (Dev)' });
    const speedFolder = this.gui.addFolder('Speeds & Accel');
    speedFolder.add(config, 'speedWalk', 2, 7, 0.1);
    speedFolder.add(config, 'speedRun', 5, 11, 0.1);
    speedFolder.add(config, 'speedSprint', 8, 16, 0.1);
    speedFolder.add(config, 'speedSlideMax', 12, 25, 0.5);
    speedFolder.add(config, 'accelGround', 5, 25, 0.5);
    speedFolder.add(config, 'frictionGround', 2, 15, 0.5);
    speedFolder.add(config, 'accelAir', 10, 60, 1);

    const jumpFolder = this.gui.addFolder('Jump & Gravity');
    jumpFolder.add(config, 'jumpVelocity', 6, 12, 0.1);
    jumpFolder.add(config, 'gravityBase', 14, 32, 0.5);
    jumpFolder.add(config, 'coyoteTime', 0.05, 0.25, 0.01);
    jumpFolder.add(config, 'jumpBufferTime', 0.05, 0.25, 0.01);

    const wallFolder = this.gui.addFolder('Wall Parkour');
    wallFolder.add(config, 'wallRunMaxDuration', 0.8, 3.0, 0.1);
    wallFolder.add(config, 'wallRunGravityMult', 0.1, 0.6, 0.02);
    wallFolder.add(config, 'wallJumpRepulseVelocity', 4, 12, 0.2);
    wallFolder.add(config, 'wallJumpUpVelocity', 5, 12, 0.2);
  }

  public setHidden(hidden: boolean): void {
    if (!this.gui) return;
    if (hidden) this.gui.hide();
    else this.gui.show();
  }

  public dispose(): void {
    this.gui?.destroy();
    this.gui = null;
  }
}
