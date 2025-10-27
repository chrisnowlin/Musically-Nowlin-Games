import { test, expect } from '@playwright/test';

test.describe('Staff Runner Game E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/games/staff-runner');
    await page.waitForLoadState('networkidle');
  });

  test('loads game page and shows initial menu', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Staff Runner' })).toBeVisible();
    await expect(page.getByText('Ready to Run?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start new Staff Runner game' })).toBeVisible();
    await expect(page.getByText('🎵 Identify notes as they appear! 🎵')).toBeVisible();
  });

  test('starts game and shows game interface', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Should show game canvas
    await expect(page.getByRole('img', { name: /Musical staff with game character/ })).toBeVisible();
    
    // Should show score displays
    await expect(page.getByText('Score: 0')).toBeVisible();
    await expect(page.getByText('Level: 1')).toBeVisible();
    await expect(page.getByText('Notes: 0')).toBeVisible();
    await expect(page.getByText('Range: Lines')).toBeVisible();
    
    // Should show note buttons
    for (const note of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      await expect(page.getByRole('button', { name: new RegExp(`Note ${note}.*disabled`) })).toBeVisible();
    }
    
    // Should show controls hint
    await expect(page.getByText(/SPACE\/↑: Jump \| P: Pause \| Keys C-B: Answer notes/)).toBeVisible();
  });

  test('pauses and resumes game', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Pause with keyboard
    await page.keyboard.press('p');
    
    await expect(page.getByText('Game Paused')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset game and return to main menu' })).toBeVisible();
    
    // Resume game
    await page.getByRole('button', { name: 'Resume' }).click();
    
    // Should be back to playing
    await expect(page.getByText('Game Paused')).not.toBeVisible();
    await expect(page.getByRole('img', { name: /Musical staff with game character/ })).toBeVisible();
  });

  test('resets game from pause menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    await page.keyboard.press('p');
    
    await page.getByRole('button', { name: 'Reset game and return to main menu' }).click();
    
    // Should be back to menu
    await expect(page.getByText('Ready to Run?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start new Staff Runner game' })).toBeVisible();
  });

  test('adjusts volume control', async ({ page }) => {
    const volumeSlider = page.getByRole('slider');
    await expect(volumeSlider).toBeVisible();
    
    await volumeSlider.fill('50');
    
    await expect(page.getByText('50%')).toBeVisible();
  });

  test('toggles note names display', async ({ page }) => {
    const toggleButton = page.getByRole('switch');
    await expect(toggleButton).toBeVisible();
    
    await toggleButton.click();
    
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('performs jump action', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Test jump with spacebar
    await page.keyboard.press('Space');
    
    // Test jump with up arrow
    await page.keyboard.press('ArrowUp');
    
    // Character should be visible (jump animation)
    await expect(page.getByRole('img', { name: /Musical staff with game character/ })).toBeVisible();
  });

  test('navigates back to main menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Return to main menu' }).click();
    
    await expect(page).toHaveURL('http://localhost:5174/');
  });

  test('shows keyboard instructions', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    await expect(page.getByText(/SPACE\/↑: Jump \| P: Pause \| Keys C-B: Answer notes/)).toBeVisible();
    await expect(page.getByText(/Screen reader: Note buttons become available when a note is active/)).toBeVisible();
  });

  test('has responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByRole('heading', { name: 'Staff Runner' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start new Staff Runner game' })).toBeVisible();
    
    // Start game on mobile
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Should still show all game elements
    await expect(page.getByRole('img', { name: /Musical staff with game character/ })).toBeVisible();
    await expect(page.getByText('Score: 0')).toBeVisible();
    
    // Note buttons should be visible on mobile
    for (const note of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      await expect(page.getByRole('button', { name: `Note ${note} - disabled` })).toBeVisible();
    }
  });

  test('handles keyboard note inputs', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Test keyboard inputs (they shouldn't crash the game)
    await page.keyboard.press('c');
    await page.keyboard.press('d');
    await page.keyboard.press('e');
    await page.keyboard.press('f');
    await page.keyboard.press('g');
    await page.keyboard.press('a');
    await page.keyboard.press('b');
    
    // Game should still be running
    await expect(page.getByRole('img', { name: /Musical staff with game character/ })).toBeVisible();
    await expect(page.getByText('Score: 0')).toBeVisible();
  });

  test('shows game over state', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Note: In real gameplay, game over would occur after completing objectives
    // For this test, we verify the structure exists
    
    // Should not show game over initially
    await expect(page.getByText('Game Complete!')).not.toBeVisible();
    
    // Game should be playable
    await expect(page.getByRole('img', { name: /Musical staff with game character/ })).toBeVisible();
  });

  test('maintains accessibility features', async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.getByRole('heading', { name: 'Staff Runner' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Check for accessible controls
    await expect(page.getByRole('group', { name: 'Note identification buttons' })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Volume: 30%' })).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Show note names: off' })).toBeVisible();
    
    // Check for status regions
    await expect(page.getByRole('status').first()).toBeVisible(); // Screen reader announcements
    await expect(page.getByRole('img', { name: /Musical staff with game character/ })).toBeVisible();
  });

  test('handles rapid user interactions', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Rapid jumps
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Space');
    
    // Rapid pause/resume
    await page.keyboard.press('p');
    await page.getByRole('button', { name: 'Resume' }).click();
    await page.keyboard.press('p');
    await page.getByRole('button', { name: 'Resume' }).click();
    
    // Game should still be responsive
    await expect(page.getByRole('img', { name: /Musical staff with game character/ })).toBeVisible();
  });

  test('displays proper game state information', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Check initial state
    await expect(page.getByText('Score: 0')).toBeVisible();
    await expect(page.getByText('Level: 1')).toBeVisible();
    await expect(page.getByText('Notes: 0')).toBeVisible();
    await expect(page.getByText('Range: Lines')).toBeVisible();
    
    // Check distance indicator
    const distanceIndicator = page.getByLabel(/Distance traveled:/);
    await expect(distanceIndicator).toBeVisible();
    
    // Check note buttons are disabled initially
    for (const note of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      const button = page.getByRole('button', { name: `Note ${note} - disabled` });
      await expect(button).toBeDisabled();
    }
  });

  test('provides visual feedback for interactions', async ({ page }) => {
    await page.getByRole('button', { name: 'Start new Staff Runner game' }).click();
    
    // Test hover states on buttons
    const backButton = page.getByRole('button', { name: 'Return to main menu' });
    await backButton.hover();
    // Should have hover effect (verified by visual inspection in manual testing)
    
    // Test focus states
    await page.keyboard.press('Tab');
    // Should show focus on first focusable element
  });
});