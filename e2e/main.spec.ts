import { test, expect } from '@playwright/test';

test.describe('Main UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display storyboard title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Another Story Map Tool/);
  });

  test('should switch to markdown editor and show content', async ({ page }) => {
    await page.getByRole('tab', { name: 'Markdown' }).click();
    await expect(page.getByText('Markdown editor')).toBeVisible();
    // テキストエリアに初期値が入っている
    await expect(page.locator('textarea')).toHaveValue(/Another Story Map Tool/);
  });

  test('should show error on invalid markdown', async ({ page }) => {
    await page.getByRole('tab', { name: 'Markdown' }).click();
    const textarea = page.locator('textarea');
    await textarea.fill('### detail without story');
    // エラー表示
    await expect(page.getByRole('alert')).toContainText('Markdown is invalid');
    await expect(page.getByRole('tab', { name: 'Storyboard' })).toBeDisabled();
  });
});
