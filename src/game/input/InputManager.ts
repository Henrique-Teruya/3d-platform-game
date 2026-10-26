export interface InputSnapshot {
  moveForward: number; // -1 (back) to +1 (forward)
  moveRight: number;   // -1 (left) to +1 (right)
  isSprinting: boolean;
  isWalkingSlow: boolean;
  isSlidingHeld: boolean;
  isJumpHeld: boolean;
  jumpBuffered: boolean;
  resetRequested: boolean;
  pauseRequested: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
}

export class InputManager {
  private readonly keysDown = new Set<string>();
  private jumpHeld = false;
  private jumpBufferTimer = 0;
  private resetRequested = false;
  private pauseRequested = false;
  private lookDeltaX = 0;
  private lookDeltaY = 0;
  private pointerLocked = false;

  // Touch inputs for mobile support
  private touchMoveX = 0;
  private touchMoveY = 0;
  private touchSprint = false;
  private touchSlide = false;
  private touchJumpHeld = false;

  private readonly targetElement: HTMLElement;
  private readonly onPointerLockChangeBound: () => void;
  private readonly onKeyDownBound: (e: KeyboardEvent) => void;
  private readonly onKeyUpBound: (e: KeyboardEvent) => void;
  private readonly onMouseMoveBound: (e: MouseEvent) => void;
  private readonly onBlurBound: () => void;

  public onPointerLockStatusChange?: (locked: boolean) => void;
  public onPauseToggle?: () => void;
  public onQuickRestart?: () => void;

  constructor(targetElement: HTMLElement) {
    this.targetElement = targetElement;
    this.onPointerLockChangeBound = () => this.handlePointerLockChange();
    this.onKeyDownBound = (e) => this.handleKeyDown(e);
    this.onKeyUpBound = (e) => this.handleKeyUp(e);
    this.onMouseMoveBound = (e) => this.handleMouseMove(e);
    this.onBlurBound = () => {
      if (document.hidden) {
        this.clearAllInputs();
      }
    };

    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    window.addEventListener('mousemove', this.onMouseMoveBound);
    window.addEventListener('blur', this.onBlurBound);
    document.addEventListener('pointerlockchange', this.onPointerLockChangeBound);
  }

  public requestPointerLock(): void {
    try {
      if (document.pointerLockElement !== this.targetElement && this.targetElement.requestPointerLock) {
        const promise = this.targetElement.requestPointerLock() as unknown as Promise<void> | undefined;
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => {
            // Browser rejected pointer lock (e.g., automated headless test without gesture)
          });
        }
      }
    } catch {
      // Ignore pointer lock errors in headless test runners
    }
  }

  public exitPointerLock(): void {
    try {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } catch {
      // Ignore
    }
  }

  public isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  public setTouchMove(x: number, y: number): void {
    this.touchMoveX = Math.max(-1, Math.min(1, x));
    this.touchMoveY = Math.max(-1, Math.min(1, y));
    const magSq = this.touchMoveX * this.touchMoveX + this.touchMoveY * this.touchMoveY;
    this.touchSprint = magSq > 0.03;
  }

  public setTouchSprint(active: boolean): void {
    this.touchSprint = active;
  }

  public setTouchSlide(active: boolean): void {
    this.touchSlide = active;
  }

  public triggerTouchJump(held: boolean, bufferDuration = 0.12): void {
    if (held && !this.touchJumpHeld) {
      this.jumpBufferTimer = bufferDuration;
    }
    this.touchJumpHeld = held;
  }

  public addTouchLook(dx: number, dy: number): void {
    this.lookDeltaX += dx;
    this.lookDeltaY += dy;
  }

  public bufferJump(duration = 0.12): void {
    this.jumpBufferTimer = Math.max(this.jumpBufferTimer, duration);
  }

  public consumeJumpBuffer(): void {
    this.jumpBufferTimer = 0;
  }

  public consumeLookDelta(): { dx: number; dy: number } {
    const dx = this.lookDeltaX;
    const dy = this.lookDeltaY;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    return { dx, dy };
  }

  public sampleFixedStep(fixedDt: number, jumpBufferWindow: number): InputSnapshot {
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - fixedDt);
    }

    let forward = 0;
    let right = 0;

    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) forward += 1;
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) forward -= 1;
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) right += 1;
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) right -= 1;

    if (Math.abs(this.touchMoveY) > 0.05 || Math.abs(this.touchMoveX) > 0.05) {
      forward = -this.touchMoveY;
      right = this.touchMoveX;
    }

    const isSprinting =
      this.keysDown.has('ShiftLeft') ||
      this.keysDown.has('ShiftRight') ||
      this.touchSprint;

    const isWalkingSlow =
      this.keysDown.has('AltLeft') ||
      this.keysDown.has('AltRight');

    const isSlidingHeld =
      this.keysDown.has('ControlLeft') ||
      this.keysDown.has('ControlRight') ||
      this.keysDown.has('KeyC') ||
      this.touchSlide;

    const isJumpHeld = this.jumpHeld || this.touchJumpHeld || this.keysDown.has('Space');

    const resetRequested = this.resetRequested;
    this.resetRequested = false;

    const pauseRequested = this.pauseRequested;
    this.pauseRequested = false;

    return {
      moveForward: forward,
      moveRight: right,
      isSprinting,
      isWalkingSlow,
      isSlidingHeld,
      isJumpHeld,
      jumpBuffered: this.jumpBufferTimer > 0 && this.jumpBufferTimer <= jumpBufferWindow + 0.05,
      resetRequested,
      pauseRequested,
      lookDeltaX: this.lookDeltaX,
      lookDeltaY: this.lookDeltaY,
    };
  }

  public clearAllInputs(): void {
    this.keysDown.clear();
    this.jumpHeld = false;
    this.touchJumpHeld = false;
    this.touchMoveX = 0;
    this.touchMoveY = 0;
    this.touchSprint = false;
    this.touchSlide = false;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    window.removeEventListener('blur', this.onBlurBound);
    document.removeEventListener('pointerlockchange', this.onPointerLockChangeBound);
  }

  private handlePointerLockChange(): void {
    this.pointerLocked = document.pointerLockElement === this.targetElement;
    this.onPointerLockStatusChange?.(this.pointerLocked);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (!e.repeat) {
        this.pauseRequested = true;
        this.onPauseToggle?.();
      }
      return;
    }

    if (e.code === 'KeyR' && !e.repeat) {
      this.resetRequested = true;
      this.onQuickRestart?.();
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (!this.jumpHeld) {
        this.jumpBufferTimer = 0.13;
      }
      this.jumpHeld = true;
    }

    this.keysDown.add(e.code);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      this.jumpHeld = false;
    }
    this.keysDown.delete(e.code);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.pointerLocked) return;
    this.lookDeltaX += e.movementX || 0;
    this.lookDeltaY += e.movementY || 0;
  }
}
