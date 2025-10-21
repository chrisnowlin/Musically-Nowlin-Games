import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.use({
  headless: false,
  launchOptions: {
    slowMo: 300,
    devtools: false
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

// D-Z Games comprehensive list
const dzGames = [
  { id: 'dynamics-001', title: 'Dynamics Explorer', route: '/games/dynamics-001' },
  { id: 'dynamics-002', title: 'Dynamics Trainer', route: '/games/dynamics-002' },
  { id: 'dynamics-003', title: 'Dynamics Master', route: '/games/dynamics-003' },
  { id: 'echo-location-challenge', title: 'Echo Location Challenge', route: '/games/echo-location-challenge' },
  { id: 'fast-or-slow-race', title: 'Fast or Slow Race', route: '/games/fast-or-slow-race' },
  { id: 'finish-the-tune', title: 'Finish the Tune', route: '/games/finish-the-tune' },
  { id: 'happy-or-sad-melodies', title: 'Happy or Sad Melodies', route: '/games/happy-or-sad-melodies' },
  { id: 'harmony-001', title: 'Harmony Explorer', route: '/games/harmony-001' },
  { id: 'harmony-002', title: 'Harmony Trainer', route: '/games/harmony-002' },
  { id: 'harmony-003', title: 'Harmony Master', route: '/games/harmony-003' },
  { id: 'harmony-004', title: 'Harmony Analyzer', route: '/games/harmony-004' },
  { id: 'harmony-helper', title: 'Harmony Helper', route: '/games/harmony-helper' },
  { id: 'how-many-notes', title: 'How Many Notes', route: '/games/how-many-notes' },
  { id: 'instrument-detective', title: 'Instrument Detective', route: '/games/instrument-detective' },
  { id: 'listen-001', title: 'Listen Explorer', route: '/games/listen-001' },
  { id: 'listen-002', title: 'Listen Trainer', route: '/games/listen-002' },
  { id: 'listen-003', title: 'Listen Master', route: '/games/listen-003' },
  { id: 'listen-004', title: 'Listen Analyzer', route: '/games/listen-004' },
  { id: 'long-or-short-notes', title: 'Long or Short Notes', route: '/games/long-or-short-notes' },
  { id: 'loud-or-quiet-safari', title: 'Loud or Quiet Safari', route: '/games/loud-or-quiet-safari' },
  { id: 'melody-memory-match', title: 'Melody Memory Match', route: '/games/melody-memory-match' },
  { id: 'musical-freeze-dance', title: 'Musical Freeze Dance', route: '/games/musical-freeze-dance' },
  { id: 'musical-math', title: 'Musical Math', route: '/games/musical-math' },
  { id: 'musical-opposites', title: 'Musical Opposites', route: '/games/musical-opposites' },
  { id: 'musical-pattern-detective', title: 'Musical Pattern Detective', route: '/games/musical-pattern-detective' },
  { id: 'musical-simon-says', title: 'Musical Simon Says', route: '/games/musical-simon-says' },
  { id: 'musical-story-time', title: 'Musical Story Time', route: '/games/musical-story-time' },
  { id: 'name-that-animal-tune', title: 'Name That Animal Tune', route: '/games/name-that-animal-tune' },
  { id: 'pitch-001', title: 'Pitch Explorer', route: '/games/pitch-001' },
  { id: 'pitch-002', title: 'Interval Trainer', route: '/games/pitch-002' },
  { id: 'pitch-003', title: 'Melody Master', route: '/games/pitch-003' },
  { id: 'pitch-004', title: 'Phrase Analyzer', route: '/games/pitch-004' },
  { id: 'pitch-005', title: 'Scale & Mode Master', route: '/games/pitch-005' },
  { id: 'pitch-006', title: 'Contour Master', route: '/games/pitch-006' },
  { id: 'pitch-ladder-jump', title: 'Pitch Ladder Jump', route: '/games/pitch-ladder-jump' },
  { id: 'pitch-match', title: 'High or Low (Pitch Match)', route: '/games/pitch-match' },
  { id: 'pitch-perfect-path', title: 'Pitch Perfect Path', route: '/games/pitch-perfect-path' },
  { id: 'rest-finder', title: 'Rest Finder', route: '/games/rest-finder' },
  { id: 'rhythm-003', title: 'Meter Master', route: '/games/rhythm-003' },
  { id: 'rhythm-004', title: 'Rhythm Notation Master', route: '/games/rhythm-004' },
  { id: 'rhythm-005', title: 'Rhythm Ensemble', route: '/games/rhythm-005' },
  { id: 'rhythm-echo-challenge', title: 'Rhythm Echo Challenge', route: '/games/rhythm-echo-challenge' },
  { id: 'rhythm-master', title: 'Rhythm Master', route: '/games/rhythm-master' },
  { id: 'rhythm-puzzle-builder', title: 'Rhythm Puzzle Builder', route: '/games/rhythm-puzzle-builder' },
  { id: 'same-or-different', title: 'Same or Different', route: '/games/same-or-different' },
  { id: 'scale-climber', title: 'Scale Climber', route: '/games/scale-climber' },
  { id: 'staff-wars', title: 'Staff Wars', route: '/games/staff-wars' },
  { id: 'steady-or-bouncy-beat', title: 'Steady or Bouncy Beat', route: '/games/steady-or-bouncy-beat' },
  { id: 'tempo-and-pulse-master', title: 'Tempo & Pulse Master', route: '/games/tempo-and-pulse-master' },
  { id: 'tempo-conducting-studio', title: 'Tempo Conducting Studio', route: '/games/tempo-conducting-studio' },
  { id: 'theory-001', title: 'Theory Explorer', route: '/games/theory-001' },
  { id: 'theory-002', title: 'Theory Trainer', route: '/games/theory-002' },
  { id: 'theory-003', title: 'Theory Master', route: '/games/theory-003' },
  { id: 'theory-004', title: 'Theory Analyzer', route: '/games/theory-004' },
  { id: 'timbre-001', title: 'Timbre Explorer', route: '/games/timbre-001' },
  { id: 'timbre-002', title: 'Timbre Trainer', route: '/games/timbre-002' },
  { id: 'timbre-003', title: 'Timbre Master', route: '/games/timbre-003' },
  { id: 'tone-color-match', title: 'Tone Color Match', route: '/games/tone-color-match' },
  { id: 'world-music-explorer', title: 'World Music Explorer', route: '/games/world-music-explorer' },
];

test.describe('D-Z Games Comprehensive Test', () => {
  for (const game of dzGames) {
    test(`${game.title} (${game.id})`, async ({ page }) => {
      const issues: string[] = [];
      const features: string[] = [];

      console.log(`\\n🎮 Testing: ${game.title}`);

      try {
        await page.goto(`http://localhost:5175${game.route}`, { timeout: 10000 });
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch (error) {
        issues.push('Page failed to load or timeout');
        gameStatuses.push({
          id: game.id,
          title: game.title,
          route: game.route,
          status: 'broken',
          issues,
          features
        });
        console.log(`❌ Status: broken - failed to load`);
        return;
      }

      // Take screenshot
      await page.screenshot({ path: `.playwright-mcp/${game.id}-test.png` });

      // Check for skeleton indicators
      const content = await page.content();

      if (content.includes('Option 1') && content.includes('Option 2')) {
        issues.push('Skeleton implementation - generic options');
      }

      if (content.includes('TODO')) {
        issues.push('Contains TODO placeholders');
      }

      // Check for start/play button
      const startBtn = page.getByRole('button', { name: /start|play|begin/i }).first();
      if (await startBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        features.push('Has start button');
      }

      // Check for score tracking
      if (content.includes('Score') || content.includes('score')) {
        features.push('Has score tracking');
      }

      // Check for round/level tracking
      if (content.includes('Round') || content.includes('Level')) {
        features.push('Has round/level system');
      }

      // Check for audio controls
      const replayBtn = page.locator('button').filter({ hasText: /replay|play again|listen/i }).first();
      if (await replayBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        features.push('Has replay/audio controls');
      }

      // Determine status
      let status: 'working' | 'skeleton' | 'broken' = 'working';
      if (issues.length > 0) {
        status = 'skeleton';
      }
      if (issues.some(i => i.includes('failed to load'))) {
        status = 'broken';
      }

      gameStatuses.push({
        id: game.id,
        title: game.title,
        route: game.route,
        status,
        issues,
        features
      });

      console.log(`Status: ${status}`);
      console.log(`Issues: ${issues.length}`);
      console.log(`Features: ${features.length}`);
    });
  }

  test.afterAll(async () => {
    console.log('\\n\\n═══════════════════════════════════════════════════');
    console.log('     D-Z GAMES TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════\\n');

    const working = gameStatuses.filter(g => g.status === 'working');
    const skeleton = gameStatuses.filter(g => g.status === 'skeleton');
    const broken = gameStatuses.filter(g => g.status === 'broken');

    console.log(`✅ Working Games: ${working.length}`);
    console.log(`⚠️  Skeleton Games: ${skeleton.length}`);
    console.log(`❌ Broken Games: ${broken.length}`);
    console.log(`📊 Total Tested: ${gameStatuses.length}\\n`);

    console.log('DETAILED RESULTS:\\n');

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

    console.log('═══════════════════════════════════════════════════\\n');

    // Write summary to file
    const summary = {
      testDate: new Date().toISOString(),
      summary: {
        total: gameStatuses.length,
        working: working.length,
        skeleton: skeleton.length,
        broken: broken.length
      },
      games: gameStatuses,
      skeletonGames: skeleton.map(g => ({ id: g.id, title: g.title, route: g.route, issues: g.issues })),
      brokenGames: broken.map(g => ({ id: g.id, title: g.title, route: g.route, issues: g.issues }))
    };

    fs.writeFileSync(
      '.playwright-mcp/dz-games-test-summary.json',
      JSON.stringify(summary, null, 2)
    );

    console.log('📝 Summary saved to: .playwright-mcp/dz-games-test-summary.json\\n');

    // Print skeleton games for easy reference
    if (skeleton.length > 0) {
      console.log('\\n🔧 SKELETON GAMES THAT NEED IMPLEMENTATION:\\n');
      skeleton.forEach(game => {
        console.log(`   ${game.title} (${game.id})`);
        console.log(`   Route: ${game.route}`);
        game.issues.forEach(i => console.log(`      - ${i}`));
        console.log('');
      });
    }
  });
});
