export class FixedTimestepClock {
  public readonly fixedDt: number;
  public readonly maxFrameDelta: number;
  private accumulator = 0;
  public elapsed = 0;

  constructor(fixedDt = 1 / 60, maxFrameDelta = 0.1) {
    this.fixedDt = fixedDt;
    this.maxFrameDelta = maxFrameDelta;
  }

  public reset(): void {
    this.accumulator = 0;
    this.elapsed = 0;
  }

  /**
   * Advances the fixed timestep accumulator and invokes `stepFn` for each fixed step.
   * Returns the interpolation alpha in [0, 1) for smooth rendering between physics steps.
   */
  public tick(frameDeltaSeconds: number, stepFn: (fixedDt: number) => void): number {
    const clampedDelta = Math.min(Math.max(frameDeltaSeconds, 0), this.maxFrameDelta);
    this.accumulator += clampedDelta;
    this.elapsed += clampedDelta;

    let steps = 0;
    const maxSteps = 8;
    while (this.accumulator >= this.fixedDt && steps < maxSteps) {
      stepFn(this.fixedDt);
      this.accumulator -= this.fixedDt;
      steps += 1;
    }

    if (steps >= maxSteps) {
      this.accumulator = 0;
    }

    return this.accumulator / this.fixedDt;
  }
}
