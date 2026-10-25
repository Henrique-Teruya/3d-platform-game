import { expect, test } from '@playwright/test';

type BotSnapshot = {
  frame: number;
  score: number;
  complete: boolean;
  x: number;
  y: number;
  z: number;
  state: string;
};

// Scripted parkour input sequence for Level 01 — The Awakening
const INPUT_SCRIPT: Array<{ keys: string[]; ms: number }> = [
  { keys: ['KeyW', 'ShiftLeft'], ms: 1200 }, // Sprint through Courtyard -> activates CP 0
  { keys: ['KeyW', 'ShiftLeft', 'Space'], ms: 400 }, // Jump onto p2
  { keys: ['KeyW', 'ShiftLeft'], ms: 850 },
  { keys: ['KeyW', 'ShiftLeft', 'Space'], ms: 400 }, // Jump onto p3 -> activates CP 1
  { keys: ['KeyW', 'ShiftLeft'], ms: 700 },
  { keys: ['KeyW', 'ShiftLeft', 'Space'], ms: 400 }, // Jump onto p4 (Slide Gallery)
  { keys: ['KeyW', 'ShiftLeft', 'ControlLeft'], ms: 1300 }, // Slide under low gate -> activates CP 2
];

test('bot playtest: scripted parkour input drives progress without errors', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop-chrome',
    'The bot uses keyboard input; mobile touch input is exercised by visual.spec.ts.',
  );
  test.setTimeout(90_000);

  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const acknowledgement = await page.evaluate(async () => {
    const hooks = window.__THREE_GAME_TEST_HOOKS__;
    if (!hooks || typeof hooks.seed !== 'function' || typeof hooks.setState !== 'function') {
      throw new Error('Bot playtests require seed and setState test hooks');
    }
    hooks.seed(12345);
    const applied = await hooks.setState('active-play');
    if (!applied || applied.state !== 'active-play') {
      throw new Error('setState must acknowledge active-play');
    }
    return applied;
  });
  expect(acknowledgement.state).toBe('active-play');

  const sample = (): Promise<BotSnapshot | null> =>
    page.evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      if (!d) return null;
      return {
        frame: d.frame,
        score: d.score,
        complete: d.complete,
        x: d.player.position.x,
        y: d.player.position.y,
        z: d.player.position.z,
        state: d.movementState,
      };
    });

  const before = await sample();
  expect(before).not.toBeNull();

  const snapshots: BotSnapshot[] = [before as BotSnapshot];
  let softlockWindows = 0;
  let distance = 0;
  let stepOfFirstScore = -1;

  for (const [index, step] of INPUT_SCRIPT.entries()) {
    for (const key of step.keys) await page.keyboard.down(key);
    await page.waitForTimeout(step.ms);
    for (const key of step.keys) await page.keyboard.up(key);

    const snap = await sample();
    const prev = snapshots[snapshots.length - 1];
    if (snap) {
      const moved = Math.hypot(snap.x - prev.x, snap.z - prev.z);
      distance += moved;
      const progressed = snap.score > prev.score || (snap.complete && !prev.complete);
      if (progressed && stepOfFirstScore === -1) stepOfFirstScore = index;
      if (snap.frame > prev.frame && moved < 0.2 && !progressed) softlockWindows += 1;
      snapshots.push(snap);
    }
  }

  const after = snapshots[snapshots.length - 1];
  const report = {
    steps: INPUT_SCRIPT.length,
    framesAdvanced: after.frame - (before as BotSnapshot).frame,
    scoreBefore: (before as BotSnapshot).score,
    scoreAfter: after.score,
    complete: after.complete,
    distanceTravelled: Number(distance.toFixed(2)),
    stepOfFirstScore,
    softlockWindows,
    consoleErrors,
    pageErrors,
  };
  await testInfo.attach('bot-playtest-report', {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json',
  });
  console.log(`bot playtest: ${JSON.stringify(report)}`);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(report.framesAdvanced).toBeGreaterThan(80);
  expect(report.distanceTravelled).toBeGreaterThan(15);
  expect(report.softlockWindows).toBeLessThanOrEqual(2);
  expect(report.scoreAfter).toBeGreaterThan(report.scoreBefore);
});
