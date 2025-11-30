import { chromium } from 'playwright';

async function testGames() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const baseUrl = 'http://localhost:5173';

  const games = [
    { name: 'ToneColorMatchGame', path: '/games/tone-color-match' },
    { name: 'StaffRunnerGame', path: '/games/staff-runner' },
    { name: 'RhythmPuzzleBuilderGame', path: '/games/rhythm-puzzle-builder' },
    { name: 'RhythmEchoChallengeGame', path: '/games/rhythm-echo-challenge' },
  ];

  const issues: string[] = [];

  for (const game of games) {
    console.log(`\n🎮 Testing ${game.name}...`);
    try {
      await page.goto(`${baseUrl}${game.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(500);

      // Get page title/heading
      const title = await page.title();
      console.log(`  Title: ${title}`);

      // Check for buttons
      const buttons = await page.locator('button').count();
      console.log(`  Buttons: ${buttons}`);

      // Check for any visible errors
      const errorText = await page.locator('[role="alert"], .error').count();
      if (errorText > 0) {
        issues.push(`${game.name}: Found error elements`);
      }

      // Try clicking start button
      const startBtn = page.locator('button:has-text("Start")').first();
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(500);
        console.log(`  ✓ Start button clicked`);
      }

      console.log(`  ✓ ${game.name} OK`);
    } catch (error) {
      issues.push(`${game.name}: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`  ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await browser.close();

  console.log('\n📋 Summary:');
  if (issues.length === 0) {
    console.log('✓ All games working!');
  } else {
    console.log(`Issues found: ${issues.length}`);
    issues.forEach(i => console.log(`  - ${i}`));
  }
}

testGames().catch(console.error);

