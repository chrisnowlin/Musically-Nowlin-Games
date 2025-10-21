import { test, expect } from '@playwright/test';

test.describe('Interactive Playtest: Dynamics Master (dynamics-001)', () => {
  test('should allow manual inspection of Dynamics Master game', async ({ page }) => {
    // Navigate to game
    await page.goto('http://localhost:5175/games/dynamics-001');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({
      path: '.playwright-mcp/dynamics-001-initial.png',
      fullPage: true
    });

    console.log('\n========================================');
    console.log('INTERACTIVE PLAYTEST: Dynamics Master');
    console.log('========================================\n');

    // Get page title and heading
    const title = await page.title();
    const heading = await page.locator('h1, h2').first().textContent();

    console.log('Page Title:', title);
    console.log('Game Heading:', heading);
    console.log('\n--- Visual Elements ---');

    // Check for mode buttons
    const modeButtons = await page.locator('button').allTextContents();
    console.log('Buttons visible:', modeButtons.length);
    console.log('Button texts:', modeButtons.slice(0, 10)); // First 10 buttons

    // Check for instructions/challenge text
    const paragraphs = await page.locator('p').allTextContents();
    console.log('\nText content (first 5 paragraphs):');
    paragraphs.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.substring(0, 100)}${p.length > 100 ? '...' : ''}`);
    });

    // Check for skeleton indicators
    const bodyText = await page.locator('body').textContent();
    const hasGenericText = bodyText?.toLowerCase().includes('practice and master this skill');
    const hasLowercaseMode = /\b[a-z]+-[a-z]+ mode\b/.test(bodyText || '');

    console.log('\n--- Skeleton Detection ---');
    console.log('Has generic "practice and master" text:', hasGenericText);
    console.log('Has lowercase mode description:', hasLowercaseMode);

    // Check console for errors
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(`ERROR: ${msg.text()}`);
      }
    });

    // Try clicking first mode button if available
    const firstButton = page.locator('button').first();
    if (await firstButton.isVisible()) {
      await firstButton.click();
      await page.waitForTimeout(1000);

      // Take screenshot after click
      await page.screenshot({
        path: '.playwright-mcp/dynamics-001-started.png',
        fullPage: true
      });

      console.log('\nClicked first button, screenshot saved');
    }

    console.log('\n--- Assessment ---');
    if (hasGenericText || hasLowercaseMode) {
      console.log('⚠️  SKELETON IMPLEMENTATION DETECTED');
      console.log('This game appears to be a skeleton and needs full implementation');
    } else {
      console.log('✅ Appears to be a production-ready implementation');
    }

    console.log('\n--- Console Errors ---');
    if (consoleMessages.length > 0) {
      consoleMessages.forEach(msg => console.log(msg));
    } else {
      console.log('No console errors detected');
    }

    // Keep browser open for manual inspection
    console.log('\n📋 Browser will remain open for 60 seconds for manual inspection...');
    console.log('Use Chrome DevTools to inspect the game state and implementation');
    await page.waitForTimeout(60000);

    console.log('\n========================================\n');
  });
});
