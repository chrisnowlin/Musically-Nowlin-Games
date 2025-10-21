import { test, expect } from '@playwright/test';

test('check for 404 errors on GitHub Pages', async ({ page }) => {
  const errors: string[] = [];
  const failed404s: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('response', response => {
    if (response.status() === 404) {
      failed404s.push(`404: ${response.url()}`);
    }
  });

  await page.goto('https://chrisnowlin.github.io/Musically-Nowlin-Games/');
  await page.waitForTimeout(3000);

  console.log('=== 404 ERRORS ===');
  failed404s.forEach(err => console.log(err));

  console.log('\n=== CONSOLE ERRORS ===');
  errors.forEach(err => console.log(err));

  console.log('\n=== PAGE TITLE ===');
  console.log(await page.title());

  console.log('\n=== BODY TEXT (first 500 chars) ===');
  const bodyText = await page.locator('body').innerText();
  console.log(bodyText.substring(0, 500));
});
