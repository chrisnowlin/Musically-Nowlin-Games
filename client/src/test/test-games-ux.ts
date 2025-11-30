import { chromium } from 'playwright';

async function testGamesUX() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = 'http://localhost:5173';
  const games = [
    { name: 'ToneColorMatchGame', path: '/games/tone-color-match-001' },
    { name: 'StaffRunnerGame', path: '/games/staff-runner' },
    { name: 'RhythmPuzzleBuilderGame', path: '/games/rhythm-puzzle-builder-001' },
    { name: 'ComposeYourSongGame', path: '/games/compose-your-song-001' },
    { name: 'RhythmEchoChallengeGame', path: '/games/rhythm-echo-challenge-001' },
  ];

  const issues: string[] = [];

  for (const game of games) {
    console.log(`\n🎮 Testing ${game.name}...`);
    try {
      await page.goto(`${baseUrl}${game.path}`, { waitUntil: 'networkidle', timeout: 10000 });
      
      // Check for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Wait for game to load
      await page.waitForTimeout(2000);

      // Check if game title/heading exists
      const heading = await page.locator('h1, h2, [role="heading"]').first();
      if (!heading) {
        issues.push(`${game.name}: No heading found`);
      }

      // Check for buttons
      const buttons = await page.locator('button').count();
      console.log(`  ✓ Found ${buttons} buttons`);

      // Try to interact with first button
      const firstButton = page.locator('button').first();
      if (await firstButton.isVisible()) {
        await firstButton.click();
        await page.waitForTimeout(500);
        console.log(`  ✓ Button click successful`);
      }

      // Check for any visible errors
      const errorElements = await page.locator('[role="alert"], .error, .error-message').count();
      if (errorElements > 0) {
        issues.push(`${game.name}: Found ${errorElements} error elements`);
      }

      if (errors.length > 0) {
        issues.push(`${game.name}: Console errors - ${errors.join(', ')}`);
      }

      console.log(`  ✓ ${game.name} loaded successfully`);
    } catch (error) {
      issues.push(`${game.name}: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`  ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await browser.close();

  console.log('\n📋 Summary:');
  if (issues.length === 0) {
    console.log('✓ All games loaded successfully!');
  } else {
    console.log(`Found ${issues.length} issues:`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  return issues;
}

testGamesUX().catch(console.error);

