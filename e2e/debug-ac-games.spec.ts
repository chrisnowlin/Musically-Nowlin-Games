import { test, expect } from '@playwright/test';

test.use({
  headless: false,
  launchOptions: {
    slowMo: 1000, // Slow down actions by 1 second
    devtools: true // Open DevTools automatically
  }
});

test.describe('A-C Games Interactive Debug Session', () => {

  test('Animal Orchestra Conductor - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Animal Orchestra Conductor');
    console.log('Expected: Start/stop parts to layer percussion, melody, and harmony');

    await page.goto('http://localhost:5175/games/animal-orchestra-conductor');
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial state
    await page.screenshot({ path: '.playwright-mcp/animal-orchestra-conductor-initial.png' });

    // Check for start button
    const startButton = page.getByRole('button', { name: /start conducting/i });
    await expect(startButton).toBeVisible();
    console.log('✅ Start button found');

    // Click start
    await startButton.click();
    await page.waitForTimeout(2000);

    // Take screenshot after starting
    await page.screenshot({ path: '.playwright-mcp/animal-orchestra-conductor-started.png' });

    console.log('\n✅ VERIFYING IMPLEMENTATION:');

    // Check for orchestra layers
    const percussion = page.getByText('Percussion');
    const melody = page.getByText('Melody');
    const harmony = page.getByText('Harmony');

    if (await percussion.isVisible()) {
      console.log('✅ Percussion layer found');
    } else {
      console.log('❌ Percussion layer NOT found');
    }

    if (await melody.isVisible()) {
      console.log('✅ Melody layer found');
    } else {
      console.log('❌ Melody layer NOT found');
    }

    if (await harmony.isVisible()) {
      console.log('✅ Harmony layer found');
    } else {
      console.log('❌ Harmony layer NOT found');
    }

    // Check for master controls
    const playAll = page.getByRole('button', { name: /play all/i });
    const stopAll = page.getByRole('button', { name: /stop all/i });

    if (await playAll.isVisible()) {
      console.log('✅ Play All button found');
    } else {
      console.log('❌ Play All button NOT found');
    }

    if (await stopAll.isVisible()) {
      console.log('✅ Stop All button found');
    } else {
      console.log('❌ Stop All button NOT found');
    }

    // Check for animals
    const content = await page.content();
    if (content.includes('🐘')) {
      console.log('✅ Elephant emoji found');
    }
    if (content.includes('🐦')) {
      console.log('✅ Bird emoji found');
    }
    if (content.includes('🐻')) {
      console.log('✅ Bear emoji found');
    }

    console.log('\n🎵 Testing interaction...');

    // Click on percussion layer
    await percussion.click();
    await page.waitForTimeout(2000);
    console.log('✅ Clicked percussion layer');

    await page.screenshot({ path: '.playwright-mcp/animal-orchestra-conductor-percussion.png' });

    // Click on melody layer
    await melody.click();
    await page.waitForTimeout(2000);
    console.log('✅ Clicked melody layer');

    await page.screenshot({ path: '.playwright-mcp/animal-orchestra-conductor-layered.png' });

    // Pause for manual inspection
    console.log('\n⏸️  Paused for manual testing. Check the browser!');
    console.log('Try clicking the animals and master controls.');
    await page.pause();
  });

  test('Advanced Music Analyzer (advanced-001) - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Advanced Music Analyzer');

    await page.goto('http://localhost:5175/games/advanced-001');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/advanced-001-initial.png' });

    // Check for start button
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/advanced-001-started.png' });
    }

    console.log('\n📊 Analyzing page elements...');
    const pageContent = await page.content();

    // Check for placeholder indicators
    if (pageContent.includes('Option 1') && pageContent.includes('Option 2')) {
      console.log('❌ Game appears to be a placeholder implementation');
    }

    await page.pause();
  });

  test('Beat & Pulse Trainer - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Beat & Pulse Trainer');
    console.log('Expected: Keep steady beat, tap along, internalize pulse, practice subdivisions');

    await page.goto('http://localhost:5175/games/beat-and-pulse-trainer');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/beat-pulse-trainer-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/beat-pulse-trainer-started.png' });
    }

    // Look for metronome or beat controls
    const metronome = page.locator('text=/metronome/i');
    const tapButton = page.locator('text=/tap/i');

    if (await metronome.count() > 0) {
      console.log('✅ Metronome found');
    } else {
      console.log('❌ No metronome found');
    }

    if (await tapButton.count() > 0) {
      console.log('✅ Tap button found');
    } else {
      console.log('❌ No tap button found');
    }

    await page.pause();
  });

  test('Beat Keeper Challenge - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Beat Keeper Challenge');
    console.log('Expected: Tap along with steady beat for timing accuracy');

    await page.goto('http://localhost:5175/games/beat-keeper-challenge');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/beat-keeper-challenge-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/beat-keeper-challenge-started.png' });
    }

    await page.pause();
  });

  test('Challenge 001 - Musical Skills Arena - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Musical Skills Arena');

    await page.goto('http://localhost:5175/games/challenge-001');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/challenge-001-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/challenge-001-started.png' });
    }

    await page.pause();
  });

  test('Compose Your Song - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Compose Your Song');
    console.log('Expected: Arrange animal notes to create and play your own melody');

    await page.goto('http://localhost:5175/games/compose-your-song');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/compose-your-song-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/compose-your-song-started.png' });
    }

    await page.pause();
  });

  test('Compose 001 - Composition Studio - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Composition Studio');

    await page.goto('http://localhost:5175/games/compose-001');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/compose-001-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/compose-001-started.png' });
    }

    await page.pause();
  });

  test('Compose 002 - Orchestration Studio - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Orchestration & Style Studio');

    await page.goto('http://localhost:5175/games/compose-002');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/compose-002-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/compose-002-started.png' });
    }

    await page.pause();
  });

  test('Cross 001 - Music & Math Explorer - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Music & Math Explorer');

    await page.goto('http://localhost:5175/games/cross-001');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/cross-001-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/cross-001-started.png' });
    }

    await page.pause();
  });

  test('Cross 002 - Music & Language Lab - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Music & Language Lab');

    await page.goto('http://localhost:5175/games/cross-002');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/cross-002-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/cross-002-started.png' });
    }

    await page.pause();
  });

  test('Cross 003 - Music & Movement Studio - Interactive Debug', async ({ page }) => {
    console.log('\n🎮 Testing: Music & Movement Studio');

    await page.goto('http://localhost:5175/games/cross-003');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '.playwright-mcp/cross-003-initial.png' });

    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/cross-003-started.png' });
    }

    await page.pause();
  });
});
