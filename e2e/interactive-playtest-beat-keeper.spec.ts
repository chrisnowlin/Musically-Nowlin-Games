import { test, expect } from '@playwright/test';

test.use({
  headless: false,  // Show the browser
  launchOptions: {
    slowMo: 1500,    // Slow down actions so we can observe
    devtools: true,  // Open DevTools automatically
    args: ['--auto-open-devtools-for-tabs']
  }
});

test.describe('Beat Keeper Challenge - Interactive Play-Test', () => {
  test('Manual interactive gameplay session with DevTools monitoring', async ({ page }) => {
    console.log('\n🎮 INTERACTIVE PLAY-TEST: Beat Keeper Challenge');
    console.log('📋 Opening game with DevTools for manual interaction\n');

    // Setup console monitoring
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        errors.push(text);
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.log(`⚠️ Console Warning: ${msg.text()}`);
      } else {
        console.log(`📝 Console: ${msg.text()}`);
      }
    });

    // Navigate to game
    console.log('1️⃣ Loading Beat Keeper Challenge...');
    await page.goto('http://localhost:5175/games/beat-keeper-challenge');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded\n');

    // Take initial screenshot
    await page.screenshot({ path: `.playwright-mcp/beat-keeper-initial.png`, fullPage: true });
    console.log('📸 Screenshot: beat-keeper-initial.png\n');

    // Check page title and basic elements
    console.log('2️⃣ Checking page elements...');
    const title = await page.title();
    console.log(`   Page title: "${title}"`);

    const gameTitle = await page.locator('h1, h2, [class*="title"]').first().textContent().catch(() => 'Not found');
    console.log(`   Game title: "${gameTitle}"`);

    // Look for instructions
    const hasInstructions = await page.locator('text=/[Ii]nstruction|[Hh]ow to|[Hh]elp/i').isVisible().catch(() => false);
    console.log(`   Instructions: ${hasInstructions ? '✅ Visible' : '⚠️ Not immediately visible'}`);

    // Look for start button
    const startButton = page.locator('button:has-text(/Start|Play|Begin/i)').first();
    const hasStartButton = await startButton.isVisible().catch(() => false);
    console.log(`   Start button: ${hasStartButton ? '✅ Visible' : '⚠️ Not immediately visible'}\n`);

    // PAUSE FOR MANUAL INSPECTION
    console.log('⏸️  PAUSING for 10 seconds - INSPECT DEVTOOLS NOW!');
    console.log('   → Check Console tab for errors');
    console.log('   → Check Network tab for failed requests');
    console.log('   → Check Elements tab for DOM structure\n');
    await page.waitForTimeout(10000);

    // Try to start the game if button exists
    if (hasStartButton) {
      console.log('3️⃣ Clicking Start button...');
      await startButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `.playwright-mcp/beat-keeper-started.png`, fullPage: true });
      console.log('📸 Screenshot: beat-keeper-started.png\n');
    } else {
      console.log('3️⃣ No start button found, checking if game auto-started...\n');
    }

    // Check for gameplay elements
    console.log('4️⃣ Checking gameplay elements...');
    const gameplayElements = {
      score: await page.locator('text=/[Ss]core/').isVisible().catch(() => false),
      timer: await page.locator('text=/[Tt]ime|[Cc]lock/').isVisible().catch(() => false),
      beat: await page.locator('text=/[Bb]eat|[Rr]hythm/').isVisible().catch(() => false),
      buttons: await page.locator('button').count(),
    };

    console.log(`   Score display: ${gameplayElements.score ? '✅' : '⚠️'}`);
    console.log(`   Timer: ${gameplayElements.timer ? '✅' : '⚠️'}`);
    console.log(`   Beat indicator: ${gameplayElements.beat ? '✅' : '⚠️'}`);
    console.log(`   Interactive buttons: ${gameplayElements.buttons} found\n`);

    // PAUSE FOR INTERACTIVE PLAY
    console.log('🎮 INTERACTIVE PLAY SESSION');
    console.log('   → You have 30 seconds to play the game');
    console.log('   → Click buttons, test features, observe behavior');
    console.log('   → Watch DevTools Console for any errors\n');
    await page.waitForTimeout(30000);

    // Take final screenshot
    await page.screenshot({ path: `.playwright-mcp/beat-keeper-final.png`, fullPage: true });
    console.log('📸 Screenshot: beat-keeper-final.png\n');

    // Report console errors
    console.log('═'.repeat(60));
    console.log('📊 CONSOLE MONITORING RESULTS');
    console.log('═'.repeat(60));
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Errors found: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\n❌ ERRORS DETECTED:');
      errors.forEach(err => console.log(`   ${err}`));
    } else {
      console.log('\n✅ No console errors detected!');
    }

    console.log('\n✨ Interactive play-test session complete!');
    console.log('   Review screenshots in .playwright-mcp/\n');

    // Keep browser open for additional manual testing
    console.log('⏸️  Browser will stay open for 60 more seconds for manual testing...');
    await page.waitForTimeout(60000);
  });
});
