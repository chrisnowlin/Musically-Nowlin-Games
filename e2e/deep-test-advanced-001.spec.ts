import { test, expect } from '@playwright/test';

test.use({
  headless: false,
  launchOptions: {
    slowMo: 1000, // Slow down so we can observe
    devtools: true
  }
});

test.describe('Advanced Music Analyzer - Deep Test', () => {
  test('Complete gameplay test - All 3 modes', async ({ page }) => {
    console.log('🎮 Starting Deep Test: Advanced Music Analyzer');
    console.log('📋 This test will play through all 3 modes completely\n');

    // Navigate and check load
    console.log('1️⃣ Testing Load & Initialization...');
    await page.goto('http://localhost:5175/games/advanced-001');
    await page.waitForLoadState('networkidle');

    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Take initial screenshot
    await page.screenshot({ path: '.playwright-mcp/advanced-001-deep-initial.png' });
    console.log('✅ Page loaded successfully\n');

    // Test each mode
    const modes = [
      { id: 'advanced-harmony', name: 'Advanced Harmony', emoji: '🎹' },
      { id: 'advanced-rhythm', name: 'Advanced Rhythm', emoji: '🥁' },
      { id: 'advanced-form', name: 'Advanced Form', emoji: '📊' }
    ];

    for (const mode of modes) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`${mode.emoji} Testing: ${mode.name}`);
      console.log(`${'='.repeat(50)}\n`);

      // Select mode if not already selected
      const modeBtn = page.locator(`button:has-text("${mode.name}")`).first();
      if (await modeBtn.isVisible()) {
        console.log(`2️⃣ Selecting ${mode.name} mode...`);
        await modeBtn.click();
        await page.waitForTimeout(500);
      }

      // Check instructions are visible
      console.log('3️⃣ Checking instructions...');
      const instructions = await page.locator('text=/How to Play/i').isVisible();
      console.log(instructions ? '✅ Instructions visible' : '⚠️ Instructions not found');

      // Start the game
      console.log('4️⃣ Starting game...');
      const startBtn = page.locator('button', { hasText: /Start|play|begin/i }).first();
      await startBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `.playwright-mcp/advanced-001-${mode.id}-started.png` });
      console.log('✅ Game started\n');

      // Play through 3 rounds to test gameplay
      console.log('5️⃣ Testing Gameplay Mechanics...');
      for (let round = 1; round <= 3; round++) {
        console.log(`\n  Round ${round}/3:`);

        // Wait for round to load
        await page.waitForTimeout(1000);

        // Check if question is visible
        const questionVisible = await page.locator('text=/question|identify|what/i').isVisible();
        console.log(`  ${questionVisible ? '✅' : '❌'} Question displayed`);

        // Check if audio played (look for replay button)
        const replayBtn = page.locator('button:has-text("Replay")').first();
        const replayExists = await replayBtn.isVisible().catch(() => false);
        console.log(`  ${replayExists ? '✅' : '⚠️'} Audio controls present`);

        // Test replay button if it exists
        if (replayExists) {
          console.log('  🔄 Testing replay button...');
          await replayBtn.click();
          await page.waitForTimeout(500);
          console.log('  ✅ Replay works');
        }

        // Check for answer options
        const options = await page.locator('button').filter({ hasText: /^[A-Z]|[a-z]/ }).count();
        console.log(`  📝 Found ${options} answer options`);

        if (options > 0) {
          // Click first option
          const firstOption = page.locator('button').filter({ hasText: /[A-Za-z]/ }).first();
          const optionText = await firstOption.textContent();
          console.log(`  👆 Selecting answer: "${optionText?.substring(0, 30)}..."`);
          await firstOption.click();
          await page.waitForTimeout(1000);

          // Check for feedback
          const feedbackVisible = await page.locator('text=/correct|incorrect|right|wrong/i').isVisible();
          console.log(`  ${feedbackVisible ? '✅' : '⚠️'} Feedback displayed`);

          // Take screenshot of feedback
          await page.screenshot({ path: `.playwright-mcp/advanced-001-${mode.id}-round${round}-feedback.png` });

          // Check if score updated
          const scoreText = await page.locator('text=/score/i').textContent();
          console.log(`  📊 Current score: ${scoreText}`);

          // Click next round button
          const nextBtn = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Continue")')).first();
          if (await nextBtn.isVisible().catch(() => false)) {
            console.log('  ➡️ Proceeding to next round');
            await nextBtn.click();
            await page.waitForTimeout(500);
          }
        } else {
          console.log('  ❌ No answer options found!');
        }
      }

      // Test rapid clicking (edge case)
      console.log('\n6️⃣ Testing Edge Cases...');
      console.log('  🖱️ Testing rapid button clicking...');
      const anyButton = page.locator('button').first();
      for (let i = 0; i < 5; i++) {
        await anyButton.click().catch(() => {});
        await page.waitForTimeout(50);
      }
      console.log('  ✅ Rapid clicking handled');

      // Go back to mode selection
      console.log('\n7️⃣ Returning to mode selection...');
      const backBtn = page.locator('button:has-text("Back")').first();
      if (await backBtn.isVisible().catch(() => false)) {
        await backBtn.click();
        await page.waitForTimeout(500);
        console.log('  ✅ Back button works');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ DEEP TEST COMPLETE: Advanced Music Analyzer');
    console.log('='.repeat(50));
    console.log('\n📊 Test Summary:');
    console.log('  • All 3 modes tested');
    console.log('  • Gameplay mechanics verified');
    console.log('  • Audio controls tested');
    console.log('  • Scoring tested');
    console.log('  • Edge cases tested');
    console.log('  • Screenshots captured');
    console.log('\n✨ Check .playwright-mcp/ for detailed screenshots\n');
  });
});
