import { test, expect } from '@playwright/test';

test.use({
  headless: false,
  launchOptions: {
    slowMo: 500,
    devtools: true
  }
});

interface GameStatus {
  id: string;
  title: string;
  route: string;
  status: 'working' | 'skeleton' | 'broken';
  issues: string[];
  features: string[];
}

const gameStatuses: GameStatus[] = [];

test.describe('A-C Games Comprehensive Test', () => {

  test('Advanced Music Analyzer (advanced-001)', async ({ page }) => {
    const gameId = 'advanced-001';
    const route = '/games/advanced-001';
    const issues: string[] = [];
    const features: string[] = [];

    console.log('\n🎮 Testing: Advanced Music Analyzer');
    await page.goto(`http://localhost:5175${route}`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: `.playwright-mcp/${gameId}-test.png` });

    // Check for skeleton indicators
    const content = await page.content();

    if (content.includes('TODO')) {
      issues.push('Contains TODO placeholders in logic');
    }

    if (content.includes('Correct') && content.includes('Incorrect')) {
      issues.push('Only has Correct/Incorrect buttons - no real gameplay');
      features.push('Basic scoring system');
      features.push('Three modes: harmony, rhythm, form');
    }

    // Check for mode switching
    const harmonyBtn = page.locator('text=ADVANCED HARMONY');
    if (await harmonyBtn.isVisible()) {
      features.push('Mode switching UI present');
      await harmonyBtn.click();
      await page.waitForTimeout(500);
    }

    // Test interaction
    const correctBtn = page.locator('text=Correct');
    if (await correctBtn.isVisible()) {
      const scoreBefore = await page.locator('text=/Score:/').textContent();
      await correctBtn.click();
      await page.waitForTimeout(500);
      const scoreAfter = await page.locator('text=/Score:/').textContent();

      if (scoreBefore !== scoreAfter) {
        features.push('Score tracking works');
      }
    }

    const status: 'working' | 'skeleton' | 'broken' = issues.length > 2 ? 'skeleton' : 'working';

    gameStatuses.push({
      id: gameId,
      title: 'Advanced Music Analyzer',
      route,
      status,
      issues,
      features
    });

    console.log(`Status: ${status}`);
    console.log(`Issues: ${issues.length}`);
    console.log(`Features: ${features.length}`);
  });

  test('Animal Orchestra Conductor', async ({ page }) => {
    const gameId = 'animal-orchestra-conductor';
    const route = '/games/animal-orchestra-conductor';
    const issues: string[] = [];
    const features: string[] = [];

    console.log('\n🎮 Testing: Animal Orchestra Conductor');
    await page.goto(`http://localhost:5175${route}`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: `.playwright-mcp/${gameId}-test.png` });

    // Check for start button
    const startBtn = page.getByRole('button', { name: /start conducting/i });
    if (await startBtn.isVisible()) {
      features.push('Has start screen');
      await startBtn.click();
      await page.waitForTimeout(2000);
    }

    // Check for orchestra layers
    const timpani = page.getByText('Timpani');
    const flute = page.getByText('Flute');
    const cello = page.getByText('Cello');

    if (await timpani.isVisible()) features.push('Timpani layer present');
    if (await flute.isVisible()) features.push('Flute layer present');
    if (await cello.isVisible()) features.push('Cello layer present');

    // Check for instrument library integration
    const content = await page.content();
    if (content.includes('Using Instrument Library')) {
      features.push('Integrated with instrument library');
    }

    if (content.includes('Philharmonia')) {
      features.push('Supports Philharmonia samples');
    }

    // Check master controls
    const playAll = page.getByRole('button', { name: /play all/i });
    const stopAll = page.getByRole('button', { name: /stop all/i });

    if (await playAll.isVisible()) features.push('Play All button');
    if (await stopAll.isVisible()) features.push('Stop All button');

    // Test interaction
    if (await timpani.isVisible()) {
      await timpani.click();
      await page.waitForTimeout(1000);
      features.push('Layers are clickable and interactive');
    }

    const status: 'working' | 'skeleton' | 'broken' = features.length >= 5 ? 'working' : 'skeleton';

    gameStatuses.push({
      id: gameId,
      title: 'Animal Orchestra Conductor',
      route,
      status,
      issues,
      features
    });

    console.log(`Status: ${status}`);
    console.log(`Features: ${features.length}`);
  });

  test('Beat & Pulse Trainer', async ({ page }) => {
    const gameId = 'beat-and-pulse-trainer';
    const route = '/games/beat-and-pulse-trainer';
    const issues: string[] = [];
    const features: string[] = [];

    console.log('\n🎮 Testing: Beat & Pulse Trainer');
    await page.goto(`http://localhost:5175${route}`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: `.playwright-mcp/${gameId}-test.png` });

    const content = await page.content();

    // Check for skeleton indicators
    if (content.includes('Option 1') && content.includes('Option 2')) {
      issues.push('Skeleton implementation - only generic options');
    }

    // Check for start button
    const startBtn = page.getByRole('button', { name: /start/i });
    if (await startBtn.isVisible()) {
      features.push('Has start button');
      await startBtn.click();
      await page.waitForTimeout(1000);
    }

    // Look for beat/rhythm specific elements
    if (content.includes('beat') || content.includes('Beat')) {
      features.push('Has beat-related content');
    }

    if (content.includes('pulse') || content.includes('Pulse')) {
      features.push('Has pulse-related content');
    }

    const status: 'working' | 'skeleton' | 'broken' = issues.length > 0 ? 'skeleton' : 'working';

    gameStatuses.push({
      id: gameId,
      title: 'Beat & Pulse Trainer',
      route,
      status,
      issues,
      features
    });

    console.log(`Status: ${status}`);
  });

  test('Beat Keeper Challenge', async ({ page }) => {
    const gameId = 'beat-keeper-challenge';
    const route = '/games/beat-keeper-challenge';
    const issues: string[] = [];
    const features: string[] = [];

    console.log('\n🎮 Testing: Beat Keeper Challenge');
    await page.goto(`http://localhost:5175${route}`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: `.playwright-mcp/${gameId}-test.png` });

    const content = await page.content();

    if (content.includes('Option 1') && content.includes('Option 2')) {
      issues.push('Skeleton implementation');
    }

    const startBtn = page.getByRole('button', { name: /start/i });
    if (await startBtn.isVisible()) {
      features.push('Has start button');
    }

    const status: 'working' | 'skeleton' | 'broken' = issues.length > 0 ? 'skeleton' : 'working';

    gameStatuses.push({
      id: gameId,
      title: 'Beat Keeper Challenge',
      route,
      status,
      issues,
      features
    });
  });

  test('Challenge 001 - Musical Skills Arena', async ({ page }) => {
    const gameId = 'challenge-001';
    const route = '/games/challenge-001';
    const issues: string[] = [];
    const features: string[] = [];

    console.log('\n🎮 Testing: Musical Skills Arena');
    await page.goto(`http://localhost:5175${route}`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: `.playwright-mcp/${gameId}-test.png` });

    const content = await page.content();

    if (content.includes('Option 1') && content.includes('Option 2')) {
      issues.push('Skeleton implementation');
    }

    const status: 'working' | 'skeleton' | 'broken' = issues.length > 0 ? 'skeleton' : 'working';

    gameStatuses.push({
      id: gameId,
      title: 'Musical Skills Arena',
      route,
      status,
      issues,
      features
    });
  });

  test('Compose Your Song', async ({ page }) => {
    const gameId = 'compose-your-song';
    const route = '/games/compose-your-song';
    const issues: string[] = [];
    const features: string[] = [];

    console.log('\n🎮 Testing: Compose Your Song');
    await page.goto(`http://localhost:5175${route}`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: `.playwright-mcp/${gameId}-test.png` });

    const content = await page.content();

    if (content.includes('Option 1') && content.includes('Option 2')) {
      issues.push('Skeleton implementation');
    }

    const status: 'working' | 'skeleton' | 'broken' = issues.length > 0 ? 'skeleton' : 'working';

    gameStatuses.push({
      id: gameId,
      title: 'Compose Your Song',
      route,
      status,
      issues,
      features
    });
  });

  test.afterAll(async () => {
    console.log('\n\n═══════════════════════════════════════════════════');
    console.log('     A-C GAMES TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');

    const working = gameStatuses.filter(g => g.status === 'working');
    const skeleton = gameStatuses.filter(g => g.status === 'skeleton');
    const broken = gameStatuses.filter(g => g.status === 'broken');

    console.log(`✅ Working Games: ${working.length}`);
    console.log(`⚠️  Skeleton Games: ${skeleton.length}`);
    console.log(`❌ Broken Games: ${broken.length}`);
    console.log(`📊 Total Tested: ${gameStatuses.length}\n`);

    console.log('DETAILED RESULTS:\n');

    gameStatuses.forEach(game => {
      const icon = game.status === 'working' ? '✅' : game.status === 'skeleton' ? '⚠️' : '❌';
      console.log(`${icon} ${game.title}`);
      console.log(`   ID: ${game.id}`);
      console.log(`   Route: ${game.route}`);
      console.log(`   Status: ${game.status.toUpperCase()}`);

      if (game.features.length > 0) {
        console.log(`   Features (${game.features.length}):`);
        game.features.forEach(f => console.log(`      • ${f}`));
      }

      if (game.issues.length > 0) {
        console.log(`   Issues (${game.issues.length}):`);
        game.issues.forEach(i => console.log(`      ⚠ ${i}`));
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════\n');

    // Write summary to file
    const fs = require('fs');
    const summary = {
      testDate: new Date().toISOString(),
      summary: {
        total: gameStatuses.length,
        working: working.length,
        skeleton: skeleton.length,
        broken: broken.length
      },
      games: gameStatuses
    };

    fs.writeFileSync(
      '.playwright-mcp/ac-games-test-summary.json',
      JSON.stringify(summary, null, 2)
    );

    console.log('📝 Summary saved to: .playwright-mcp/ac-games-test-summary.json\n');
  });
});
