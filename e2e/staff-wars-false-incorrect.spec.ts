import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const LOG_PATH = '/Users/cnowlin/Developer/Musically-Nowlin-Games/.cursor/debug.log';

type NdjsonLog = {
  sessionId?: string;
  runId?: string;
  hypothesisId?: string;
  location?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
};

function safeReadLogLines(): string[] {
  try {
    if (!fs.existsSync(LOG_PATH)) return [];
    const raw = fs.readFileSync(LOG_PATH, 'utf8');
    return raw.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function parseNdjson(lines: string[]): NdjsonLog[] {
  const out: NdjsonLog[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line));
    } catch {
      // ignore malformed line
    }
  }
  return out;
}

async function waitForNextMatchingLog(
  cursor: { idx: number },
  predicate: (log: NdjsonLog) => boolean,
  timeoutMs: number
): Promise<NdjsonLog> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const lines = safeReadLogLines();
    if (cursor.idx < lines.length) {
      const slice = lines.slice(cursor.idx);
      const parsed = parseNdjson(slice);
      for (let i = 0; i < parsed.length; i++) {
        const log = parsed[i];
        if (predicate(log)) {
          cursor.idx += i + 1;
          return log;
        }
      }
      // Move cursor to end if nothing matched in the new batch
      cursor.idx = lines.length;
    }
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error(`Timed out waiting for matching log after ${timeoutMs}ms`);
}

test.describe('Staff Wars intermittent false incorrect', () => {
  test('presses correct keys immediately after spawn to detect ref/race issues', async ({ page }) => {
    test.setTimeout(3 * 60 * 1000);

    await page.goto('/games/staff-wars');

    // Setup screen loaded
    await expect(page.getByText('Staff Wars')).toBeVisible();

    // Start game
    await page.getByRole('button', { name: 'Start Mission' }).click();

    // Gameplay HUD loaded
    await expect(page.getByText('Score')).toBeVisible();

    // Ensure page has focus for keyboard events
    await page.click('body');

    const cursor = { idx: 0 };

    // Phase 1: warm up by answering quickly to increase level (faster note travel).
    // Phase 2: answer very late (near danger zone) to stress timeout/answer races.
    const warmupCorrect = 25;
    const nearTimeoutTrials = 10;
    const delaysMs = [0, 5, 15, 30, 60]; // sample human-like reaction times (including "too fast")
    let lastSeenLevel = 1;

    for (let n = 0; n < warmupCorrect; n++) {
      const spawn = await waitForNextMatchingLog(
        cursor,
        (l) => l.message === 'Spawn note' && l.location === 'GameplayScreen.tsx:spawnNote',
        30_000
      );

      const newNote = String(spawn.data?.newNote ?? '');
      const expectedLetter = newNote.charAt(0).toUpperCase();
      expect(['A', 'B', 'C', 'D', 'E', 'F', 'G']).toContain(expectedLetter);

      const delay = delaysMs[Math.floor(Math.random() * delaysMs.length)];
      if (delay) await page.waitForTimeout(delay);
      await page.keyboard.press(expectedLetter);

      const answer = await waitForNextMatchingLog(
        cursor,
        (l) => l.message === 'Handle answer' && l.location === 'GameplayScreen.tsx:handleNoteAnswer',
        5_000
      );

      const data = answer.data ?? {};
      const input = String(data.input ?? '');
      const currentNote = String(data.currentNote ?? '');
      const currentNoteLetter = String(data.currentNoteLetter ?? '');
      const isCorrect = Boolean(data.isCorrect);
      const levelProp = Number(data.levelProp ?? 1);
      if (!Number.isNaN(levelProp)) lastSeenLevel = levelProp;

      // If we pressed the spawned note letter and it's still counted incorrect, we found the bug condition.
      if (input === expectedLetter && !isCorrect) {
        throw new Error(
          `False incorrect detected: spawned=${newNote} expected=${expectedLetter} input=${input} currentNote=${currentNote} currentNoteLetter=${currentNoteLetter}`
        );
      }
    }

    // Phase 2: try to reproduce a timeout/answer race by pressing as the note approaches the danger zone.
    // We watch the noisy noteStateRefEffect logs to find when noteX gets close, then press the correct key.
    const dangerZoneX = 150;
    const pressWhenXBelow = 170; // a small cushion; still "late" but ideally before the actual timeout boundary

    for (let t = 0; t < nearTimeoutTrials; t++) {
      const spawn = await waitForNextMatchingLog(
        cursor,
        (l) => l.message === 'Spawn note' && l.location === 'GameplayScreen.tsx:spawnNote',
        30_000
      );
      const newNote = String(spawn.data?.newNote ?? '');
      const expectedLetter = newNote.charAt(0).toUpperCase();
      expect(['A', 'B', 'C', 'D', 'E', 'F', 'G']).toContain(expectedLetter);

      // Wait until the moving note reaches "late" X position.
      await waitForNextMatchingLog(
        cursor,
        (l) => {
          if (l.message !== 'noteStateRef updated' || l.location !== 'GameplayScreen.tsx:noteStateRefEffect') return false;
          const phase = String(l.data?.phase ?? '');
          const note = String(l.data?.note ?? '');
          const noteX = Number(l.data?.noteX ?? NaN);
          return phase === 'note_active' && note === newNote && Number.isFinite(noteX) && noteX <= pressWhenXBelow && noteX > dangerZoneX;
        },
        60_000
      );

      await page.keyboard.press(expectedLetter);

      // After pressing, if a timeout trigger happens for this note, that's evidence of a race.
      // We'll watch for either an answer or a timeout trigger shortly after.
      const next = await waitForNextMatchingLog(
        cursor,
        (l) => {
          if (l.location === 'GameplayScreen.tsx:handleNoteAnswer' && l.message === 'Handle answer') return true;
          if (l.location === 'GameplayScreen.tsx:animate-timeout' && l.message === 'Timeout trigger (note crossed danger zone)') return true;
          return false;
        },
        5_000
      );

      if (next.location === 'GameplayScreen.tsx:animate-timeout') {
        const prevNote = String(next.data?.prevNote ?? '');
        if (prevNote === newNote) {
          throw new Error(
            `Timeout triggered for note we attempted to answer late: note=${newNote} expected=${expectedLetter} lastSeenLevel=${lastSeenLevel}`
          );
        }
      }
    }
  });
});

  test('uses button clicks instead of keyboard to detect visual/ref race', async ({ page }) => {
    test.setTimeout(3 * 60 * 1000);

    await page.goto('/games/staff-wars');
    await expect(page.getByText('Staff Wars')).toBeVisible();
    await page.getByRole('button', { name: 'Start Mission' }).click();
    await expect(page.getByText('Score')).toBeVisible();

    const cursor = { idx: 0 };
    const totalTrials = 40;

    for (let n = 0; n < totalTrials; n++) {
      const spawn = await waitForNextMatchingLog(
        cursor,
        (l) => l.message === 'Spawn note' && l.location === 'GameplayScreen.tsx:spawnNote',
        30_000
      );

      const newNote = String(spawn.data?.newNote ?? '');
      const expectedLetter = newNote.charAt(0).toUpperCase();
      expect(['A', 'B', 'C', 'D', 'E', 'F', 'G']).toContain(expectedLetter);

      // Use random delay (some very fast to catch race)
      const delay = [0, 2, 5, 10, 20][Math.floor(Math.random() * 5)];
      if (delay) await page.waitForTimeout(delay);

      // Click the note button instead of using keyboard
      const button = page.locator(`button:has-text("${expectedLetter}")`).first();
      await button.click({ force: true }); // force: true bypasses visibility/disabled checks briefly

      // Look for button click log + answer log
      const clickLog = await waitForNextMatchingLog(
        cursor,
        (l) => l.message === 'Button click note input' && l.location === 'GameplayScreen.tsx:buttonClick',
        5_000
      ).catch(() => null);

      const answer = await waitForNextMatchingLog(
        cursor,
        (l) => l.message === 'Handle answer' && l.location === 'GameplayScreen.tsx:handleNoteAnswer',
        5_000
      );

      const data = answer.data ?? {};
      const input = String(data.input ?? '');
      const currentNote = String(data.currentNote ?? '');
      const currentNoteLetter = String(data.currentNoteLetter ?? '');
      const isCorrect = Boolean(data.isCorrect);

      // Detect if we pressed correct letter but got marked incorrect
      if (input === expectedLetter && !isCorrect) {
        const clickData = clickLog?.data ?? {};
        throw new Error(
          `False incorrect via button click: spawned=${newNote} expected=${expectedLetter} input=${input} ` +
          `currentNote=${currentNote} currentNoteLetter=${currentNoteLetter} ` +
          `clickRefNote=${clickData.refNote} clickStateNote=${clickData.stateNote}`
        );
      }
    }
  });

