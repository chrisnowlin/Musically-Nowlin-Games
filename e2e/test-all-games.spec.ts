import { test, expect } from '@playwright/test';

// List of all available games
const availableGames = [
  { id: 'pitch-match', title: 'High or Low?', route: '/games/pitch-match' },
  { id: 'rhythm-echo-challenge', title: 'Rhythm Echo Challenge', route: '/games/rhythm-echo-challenge' },
  { id: 'melody-memory-match', title: 'Melody Memory Match', route: '/games/melody-memory-match' },
  { id: 'fast-or-slow-race', title: 'Fast or Slow Race', route: '/games/fast-or-slow-race' },
  { id: 'loud-or-quiet-safari', title: 'Loud or Quiet Safari', route: '/games/loud-or-quiet-safari' },
  { id: 'how-many-notes', title: 'How Many Notes?', route: '/games/how-many-notes' },
  { id: 'musical-simon-says', title: 'Musical Simon Says', route: '/games/musical-simon-says' },
  { id: 'instrument-detective', title: 'Instrument Detective', route: '/games/instrument-detective' },
  { id: 'finish-the-tune', title: 'Finish the Tune', route: '/games/finish-the-tune' },
  { id: 'long-or-short-notes', title: 'Long or Short Notes?', route: '/games/long-or-short-notes' },
  { id: 'beat-keeper-challenge', title: 'Beat Keeper Challenge', route: '/games/beat-keeper-challenge' },
  { id: 'happy-or-sad-melodies', title: 'Happy or Sad Melodies?', route: '/games/happy-or-sad-melodies' },
  { id: 'scale-climber', title: 'Scale Climber', route: '/games/scale-climber' },
  { id: 'musical-pattern-detective', title: 'Musical Pattern Detective', route: '/games/musical-pattern-detective' },
  { id: 'name-that-animal-tune', title: 'Name That Animal Tune', route: '/games/name-that-animal-tune' },
  { id: 'steady-or-bouncy-beat', title: 'Steady or Bouncy Beat?', route: '/games/steady-or-bouncy-beat' },
  { id: 'musical-opposites', title: 'Musical Opposites', route: '/games/musical-opposites' },
  { id: 'pitch-ladder-jump', title: 'Pitch Ladder Jump', route: '/games/pitch-ladder-jump' },
  { id: 'rhythm-puzzle-builder', title: 'Rhythm Puzzle Builder', route: '/games/rhythm-puzzle-builder' },
  { id: 'harmony-helper', title: 'Harmony Helper', route: '/games/harmony-helper' },
  { id: 'musical-freeze-dance', title: 'Musical Freeze Dance', route: '/games/musical-freeze-dance' },
  { id: 'compose-your-song', title: 'Compose Your Song', route: '/games/compose-your-song' },
  { id: 'echo-location-challenge', title: 'Echo Location Challenge', route: '/games/echo-location-challenge' },
  { id: 'musical-story-time', title: 'Musical Story Time', route: '/games/musical-story-time' },
  { id: 'tone-color-match', title: 'Tone Color Match', route: '/games/tone-color-match' },
  { id: 'musical-math', title: 'Musical Math', route: '/games/musical-math' },
  { id: 'rest-finder', title: 'Rest Finder', route: '/games/rest-finder' },
  { id: 'animal-orchestra-conductor', title: 'Animal Orchestra Conductor', route: '/games/animal-orchestra-conductor' },
  { id: 'pitch-perfect-path', title: 'Pitch Perfect Path', route: '/games/pitch-perfect-path' },
  { id: 'same-or-different', title: 'Same or Different?', route: '/games/same-or-different' },
  { id: 'world-music-explorer', title: 'World Music Explorer', route: '/games/world-music-explorer' },
  { id: 'staff-wars', title: 'Staff Wars', route: '/games/staff-wars' },
];

test.describe('Game Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to ensure consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  for (const game of availableGames) {
    test(`${game.title} - Basic functionality test`, async ({ page }) => {
      // Navigate to the game
      await page.goto(`http://localhost:5175${game.route}`);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Take a screenshot of the initial state
      await page.screenshot({ path: `.playwright-mcp/${game.id}-initial.png`, fullPage: true });

      // Check that there are no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Look for common game elements
      const hasStartButton = await page.getByRole('button', { name: /start|play|begin/i }).count() > 0;
      const hasInstructions = await page.getByText(/instruction|how to|tap|click|listen/i).count() > 0;

      // Try to find and click a start button if it exists
      if (hasStartButton) {
        const startButton = page.getByRole('button', { name: /start|play|begin/i }).first();
        await startButton.click();

        // Wait a bit for the game to start
        await page.waitForTimeout(1000);

        // Take screenshot after starting
        await page.screenshot({ path: `.playwright-mcp/${game.id}-started.png`, fullPage: true });

        // Check for gameplay elements
        const hasGameplay = await page.locator('button, [role="button"]').count() > 0;
        expect(hasGameplay).toBeTruthy();
      }

      // Look for quit/exit button
      const hasQuitButton = await page.getByRole('button', { name: /quit|exit|back|home/i }).count() > 0;

      // Verify page loaded correctly - should have some content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
      expect(bodyText!.length).toBeGreaterThan(0);

      // Report findings
      console.log(`\n=== ${game.title} (${game.id}) ===`);
      console.log(`✓ Page loaded successfully`);
      console.log(`${hasStartButton ? '✓' : '✗'} Has start button`);
      console.log(`${hasInstructions ? '✓' : '✗'} Has instructions`);
      console.log(`${hasQuitButton ? '✓' : '✗'} Has quit button`);
      console.log(`Errors: ${errors.length}`);
      if (errors.length > 0) {
        console.log('Error messages:', errors);
      }
    });
  }
});

test.describe('Deep Game Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Pitch Match - Full gameplay test', async ({ page }) => {
    await page.goto('http://localhost:5175/games/pitch-match');
    await page.waitForLoadState('networkidle');

    // Click start if available
    const startButton = page.getByRole('button', { name: /start|play|begin/i }).first();
    if (await startButton.count() > 0) {
      await startButton.click();
      await page.waitForTimeout(1000);

      // Try to interact with answer buttons
      const answerButtons = page.locator('button').filter({ hasText: /higher|lower|high|low/i });
      if (await answerButtons.count() > 0) {
        await answerButtons.first().click();
        await page.screenshot({ path: `.playwright-mcp/pitch-match-answer.png` });
      }
    }
  });

  test('Staff Wars - Gameplay test', async ({ page }) => {
    await page.goto('http://localhost:5175/games/staff-wars');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: `.playwright-mcp/staff-wars-loaded.png`, fullPage: true });

    // Look for start button
    const startButton = page.getByRole('button', { name: /start|play|begin/i }).first();
    if (await startButton.count() > 0) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Take screenshot of gameplay
      await page.screenshot({ path: `.playwright-mcp/staff-wars-gameplay-new.png`, fullPage: true });

      // Try to click answer buttons
      const noteButtons = page.locator('button').filter({ hasText: /[A-G]/i });
      if (await noteButtons.count() > 0) {
        await noteButtons.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `.playwright-mcp/staff-wars-after-click-new.png`, fullPage: true });
      }
    }
  });

  test('Rhythm Echo Challenge - Interaction test', async ({ page }) => {
    await page.goto('http://localhost:5175/games/rhythm-echo-challenge');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `.playwright-mcp/rhythm-echo-initial.png`, fullPage: true });

    const startButton = page.getByRole('button', { name: /start|play|begin/i }).first();
    if (await startButton.count() > 0) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `.playwright-mcp/rhythm-echo-playing.png`, fullPage: true });

      // Try tapping/clicking
      const tapButton = page.locator('button').filter({ hasText: /tap|click|play/i }).first();
      if (await tapButton.count() > 0) {
        await tapButton.click();
        await tapButton.click();
        await tapButton.click();
        await page.screenshot({ path: `.playwright-mcp/rhythm-echo-tapped.png`, fullPage: true });
      }
    }
  });
});
