import { test, expect } from '@playwright/test';

test.describe('Main UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display storyboard title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Another Story Map Tool/);
  });

  test('should switch to markdown editor and show content', async ({ page }) => {
    // Markdownエディタアイコンをクリック
    // toolbarの2番目のdiv内のsvg（Keyboardアイコン）をクリック
    await page.locator('div[role="toolbar"] > div').nth(1).locator('svg').click();
    await expect(page.getByText('Markdown Editor')).toBeVisible();
    // テキストエリアに初期値が入っている
    await expect(page.locator('textarea')).toContainText('Another Story Map Tool');
  });

  test('should show error on invalid markdown', async ({ page }) => {
    // toolbarの2番目のdiv内のsvg（Keyboardアイコン）をクリック
    await page.locator('div[role="toolbar"] > div').nth(1).locator('svg').click();
    const textarea = page.locator('textarea');
    await textarea.fill('### detail without story');
    // エラー表示
    await expect(page.getByText('❌ Markdown is invalid')).toBeVisible();
    // StoryBoardアイコンがdisabled風になる
  // toolbarの1番目のdiv内のsvg（Noteアイコン）がdisabled風か確認
  await expect(page.locator('div[role="toolbar"] > div').first().locator('svg')).toHaveClass(/cursor-not-allowed/);
  });
});
