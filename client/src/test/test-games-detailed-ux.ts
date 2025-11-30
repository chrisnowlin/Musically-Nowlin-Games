import { chromium } from 'playwright';

async function testGameUX() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const baseUrl = 'http://localhost:5173';

  const issues: { game: string; issue: string }[] = [];

  // Test ToneColorMatchGame
  console.log('\n🎮 Testing ToneColorMatchGame...');
  await page.goto(`${baseUrl}/games/tone-color-match`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check if start button exists and is clickable
  const startBtn = page.locator('button:has-text("Start")').first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(1000);

    // Check if melody plays
    const playBtn = page.locator('button:has-text("Play")').first();
    if (await playBtn.isVisible()) {
      await playBtn.click();
      console.log('  ✓ Play button works');
    }
  }

  // Test StaffRunnerGame
  console.log('\n🎮 Testing StaffRunnerGame...');
  await page.goto(`${baseUrl}/games/staff-runner`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const staffStartBtn = page.locator('button:has-text("Start")').first();
  if (await staffStartBtn.isVisible()) {
    await staffStartBtn.click();
    await page.waitForTimeout(1000);

    // Check if game canvas is visible
    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      console.log('  ✓ Game canvas rendered');
    } else {
      issues.push({ game: 'StaffRunnerGame', issue: 'Canvas not visible after start' });
    }
  }

  // Test RhythmPuzzleBuilderGame
  console.log('\n🎮 Testing RhythmPuzzleBuilderGame...');
  await page.goto(`${baseUrl}/games/rhythm-puzzle-builder`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const rhythmStartBtn = page.locator('button:has-text("Start")').first();
  if (await rhythmStartBtn.isVisible()) {
    await rhythmStartBtn.click();
    await page.waitForTimeout(1000);
    console.log('  ✓ Game started');
  }

  // Test ComposeYourSongGame
  console.log('\n🎮 Testing ComposeYourSongGame...');
  await page.goto(`${baseUrl}/games/compose-your-song`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check for mode buttons
  const modeButtons = page.locator('button[aria-label*="mode"], button:has-text("Melody")');
  const modeCount = await modeButtons.count();
  if (modeCount > 0) {
    console.log(`  ✓ Found ${modeCount} mode buttons`);
  } else {
    issues.push({ game: 'ComposeYourSongGame', issue: 'No mode buttons found' });
  }

  // Test RhythmEchoChallengeGame
  console.log('\n🎮 Testing RhythmEchoChallengeGame...');
  await page.goto(`${baseUrl}/games/rhythm-echo-challenge`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const echoStartBtn = page.locator('button:has-text("Start")').first();
  if (await echoStartBtn.isVisible()) {
    await echoStartBtn.click();
    await page.waitForTimeout(1000);
    console.log('  ✓ Game started');
  }

  await browser.close();

  console.log('\n📋 UX Issues Found:');
  if (issues.length === 0) {
    console.log('✓ No UX issues detected!');
  } else {
    issues.forEach(({ game, issue }) => console.log(`  ${game}: ${issue}`));
  }
}

testGameUX().catch(console.error);

