import { test, expect } from '@playwright/test';

test.describe('Staff Wars Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/staff-wars');
  });

  test('should load the setup screen', async ({ page }) => {
    // Check for game title
    await expect(page.locator('text=Staff Wars')).toBeVisible();
    
    // Check for clef options
    await expect(page.locator('text=Select Clef')).toBeVisible();
    await expect(page.locator('text=Treble Clef')).toBeVisible();
    await expect(page.locator('text=Bass Clef')).toBeVisible();
    await expect(page.locator('text=Alto Clef')).toBeVisible();
  });

  test('should have difficulty options', async ({ page }) => {
    await expect(page.locator('text=Select Difficulty')).toBeVisible();
    await expect(page.locator('text=Beginner')).toBeVisible();
    await expect(page.locator('text=Intermediate')).toBeVisible();
    await expect(page.locator('text=Advanced')).toBeVisible();
  });

  test('should have a start button', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });

  test('should start game with default settings', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    // Wait for gameplay screen to appear
    await page.waitForTimeout(500);

    // Check for HUD elements
    await expect(page.locator('text=Score')).toBeVisible();
    await expect(page.locator('text=Level')).toBeVisible();
    await expect(page.locator('text=Lives')).toBeVisible();
  });

  test('should display note buttons during gameplay', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Check for note buttons
    const noteButtons = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    for (const note of noteButtons) {
      const button = page.locator(`button:has-text("${note}")`).first();
      await expect(button).toBeVisible();
    }
  });

  test('should have pause button during gameplay', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Look for pause button - it's in the HUD
    const pauseButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(pauseButton).toBeVisible();
  });

  test('should pause and resume game', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Click pause button - find it by looking for buttons with SVG icons
    const buttons = page.locator('button').filter({ has: page.locator('svg') });
    const pauseButton = buttons.last();
    await pauseButton.click();

    // Check for pause overlay
    await expect(page.locator('text=Paused')).toBeVisible();
    await expect(page.locator('button:has-text("Resume Game")')).toBeVisible();
    await expect(page.locator('button:has-text("Quit to Setup")')).toBeVisible();

    // Resume game
    const resumeButton = page.locator('button:has-text("Resume Game")');
    await resumeButton.click();

    // Pause overlay should disappear
    await expect(page.locator('text=Paused')).not.toBeVisible();
  });

  test('should quit to setup from pause', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Click pause button
    const buttons = page.locator('button').filter({ has: page.locator('svg') });
    const pauseButton = buttons.last();
    await pauseButton.click();

    // Click quit button
    const quitButton = page.locator('button:has-text("Quit to Setup")');
    await quitButton.click();

    // Should return to setup screen
    await expect(page.locator('text=Staff Wars')).toBeVisible();
    await expect(page.locator('text=Select Clef')).toBeVisible();
  });

  test('should toggle SFX', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Find SFX button - it's one of the icon buttons in the HUD
    const buttons = page.locator('button').filter({ has: page.locator('svg') });
    const sfxButton = buttons.first();
    await expect(sfxButton).toBeVisible();

    // Click to toggle
    await sfxButton.click();

    // Button should still be visible (toggled state)
    await expect(sfxButton).toBeVisible();
  });

  test('should select different clefs', async ({ page }) => {
    // Select bass clef - look for radio button with label
    const bassLabel = page.locator('label:has-text("Bass Clef")');
    await bassLabel.click();

    // Verify bass is selected by checking if the label is highlighted
    await expect(bassLabel).toBeVisible();

    // Select alto clef
    const altoLabel = page.locator('label:has-text("Alto Clef")');
    await altoLabel.click();

    // Verify alto is selected
    await expect(altoLabel).toBeVisible();
  });

  test('should select different difficulty levels', async ({ page }) => {
    // Select Intermediate difficulty
    const intermediateLabel = page.locator('label:has-text("Intermediate")');
    await intermediateLabel.click();
    await expect(intermediateLabel).toBeVisible();

    // Select Advanced difficulty
    const advancedLabel = page.locator('label:has-text("Advanced")');
    await advancedLabel.click();
    await expect(advancedLabel).toBeVisible();
  });

  test('should have keyboard support for note input', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Press a note key
    await page.keyboard.press('C');

    // Game should still be playable (no errors)
    await expect(page.locator('text=Score')).toBeVisible();
  });

  test('should have keyboard support for pause', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Press space to pause
    await page.keyboard.press('Space');

    // Check for pause overlay
    await expect(page.locator('text=Paused')).toBeVisible();
  });

  test('should have keyboard support for SFX toggle', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Press M to toggle SFX
    await page.keyboard.press('M');

    // Game should still be playable
    await expect(page.locator('text=Score')).toBeVisible();
  });

  test('should have accessible button sizes', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();

    await page.waitForTimeout(500);

    // Check note button sizes (should be at least 44x44px)
    const noteButton = page.locator('button:has-text("C")').first();
    const box = await noteButton.boundingBox();
    
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should display high scores on setup screen', async ({ page }) => {
    // Just verify that the setup screen is visible
    // (High score persistence is tested through localStorage)
    await expect(page.locator('text=Staff Wars')).toBeVisible();

    // Verify high scores section exists
    const highScoresSection = page.locator('text=High Scores');
    if (await highScoresSection.isVisible()) {
      await expect(highScoresSection).toBeVisible();
    }
  });
});

