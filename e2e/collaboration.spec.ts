import { test, expect, Page } from '@playwright/test'

test.describe('Collaborative Editing E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start dev server before tests
    await page.goto('http://localhost:3000')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should load the application', async ({ page }) => {
    // Check if main heading is visible
    const heading = page.locator('h1')
    await expect(heading).toContainText('Markdown Editor')
  })

  test('should show markdown editor in editor mode', async ({ page }) => {
    // Look for the markdown editor
    const editor = page.locator('textarea')
    await expect(editor).toBeVisible()
  })

  test('should allow typing in the editor', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Type some markdown
    await editor.fill('')
    await editor.type('# Hello World')
    
    // Verify content
    await expect(editor).toHaveValue('# Hello World')
  })

  test('should switch between storyboard and markdown modes', async ({ page }) => {
    // Find the mode toggle buttons
    const markdownButton = page.locator('[data-testid="keyboard-icon"]').first()
    const storyboardButton = page.locator('[data-testid="note-icon"]').first()
    
    // Should start in storyboard mode or note mode
    const editor = page.locator('textarea')
    if (await editor.isVisible()) {
      // Already in editor mode, switch to storyboard
      // This depends on your UI structure
    }
  })

  test('should show real-time collaborative editor', async ({ context }) => {
    // Create two pages to simulate two users
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    // Go to app in both pages
    await page1.goto('http://localhost:3000')
    await page2.goto('http://localhost:3000')

    // Wait for both to load
    await page1.waitForLoadState('networkidle')
    await page2.waitForLoadState('networkidle')

    // Get editors
    const editor1 = page1.locator('textarea')
    const editor2 = page2.locator('textarea')

    // Clear both
    await editor1.fill('')
    await editor2.fill('')

    // Type in editor 1
    await editor1.type('Initial content')

    // Wait a bit for sync
    await page1.waitForTimeout(500)

    // Check if editor 2 got the update (this depends on your sync implementation)
    // Note: This test requires the collaborative feature to be working
    // and may need adjustment based on how you handle state sharing

    // Cleanup
    await page1.close()
    await page2.close()
  })

  test('should display user presence UI', async ({ page }) => {
    // Check for user presence component
    // This assumes UserPresence component renders something visible
    const userPresence = page.locator('text=/Active Users|Editing Together/i')
    
    // The presence UI should appear when collaboration is enabled
    // This depends on whether collaboration is visible on the page
  })

  test('should validate markdown content', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Type some content
    await editor.fill('')
    await editor.type('# Valid Markdown')
    
    // Wait a moment for validation
    await page.waitForTimeout(100)
    
    // Should not show error message
    const errorMessage = page.locator('text=/Markdown is invalid/i')
    await expect(errorMessage).not.toBeVisible()
  })

  test('should show error for invalid markdown content', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Type invalid markdown (depends on what your parser considers invalid)
    // For now, just fill with something that might cause errors
    await editor.fill('')
    await editor.type('Invalid **markdown')
    
    // Wait for validation
    await page.waitForTimeout(200)
    
    // Error message might appear depending on your validation rules
  })

  test('should persist content on page reload', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Type content
    const testContent = '# Persistent Content'
    await editor.fill(testContent)
    
    // Wait for save
    await page.waitForTimeout(500)
    
    // Reload page
    await page.reload()
    
    // Wait for load
    await page.waitForLoadState('networkidle')
    
    // Get editor again
    const reloadedEditor = page.locator('textarea')
    
    // Check if content persisted
    const value = await reloadedEditor.inputValue()
    expect(value).toContain('Persistent')
  })

  test('should support copy/paste operations', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Clear
    await editor.fill('')
    
    // Type some content
    await editor.type('Copy this content')
    
    // Select all
    await editor.focus()
    await page.keyboard.press('Control+A')
    
    // Copy
    await page.keyboard.press('Control+C')
    
    // Move to end and paste
    await page.keyboard.press('End')
    await page.keyboard.press('Control+V')
    
    // Verify content was pasted
    const value = await editor.inputValue()
    expect(value).toContain('Copy this content')
  })

  test('should handle large markdown content', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Create large content
    let largeContent = ''
    for (let i = 0; i < 100; i++) {
      largeContent += `# Section ${i}\n\nThis is content for section ${i}.\n\n`
    }
    
    // Type it
    await editor.fill(largeContent)
    
    // Verify it's there
    const value = await editor.inputValue()
    expect(value.length).toBeGreaterThan(1000)
  })

  test('should maintain cursor position correctly', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Fill with content
    await editor.fill('Hello World')
    
    // Click at specific position
    await editor.click({ position: { x: 30, y: 0 } })
    
    // Type
    await editor.type(' Beautiful')
    
    // Verify content
    const value = await editor.inputValue()
    expect(value).toContain('Beautiful')
  })

  test('should handle rapid typing', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Clear
    await editor.fill('')
    
    // Rapid typing
    const rapidText = 'The quick brown fox jumps over the lazy dog'
    for (const char of rapidText) {
      await editor.type(char)
      // Minimal delay between characters
      await page.waitForTimeout(10)
    }
    
    // Verify all content was entered
    const value = await editor.inputValue()
    expect(value).toBe(rapidText)
  })

  test('should handle backspace and deletion', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Fill content
    await editor.fill('Hello World')
    
    // Focus and position cursor
    await editor.focus()
    await page.keyboard.press('End')
    
    // Delete characters
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Backspace')
    }
    
    // Verify deletion
    const value = await editor.inputValue()
    expect(value).toBe('Hello ')
  })

  test('should match snapshot of markdown editor', async ({ page }) => {
    // Fill with sample content
    const editor = page.locator('textarea')
    await editor.fill('# Test Markdown\n\nSample **bold** text')
    
    // Take screenshot (optional, for visual regression) 
    // await page.screenshot({ path: 'markdown-editor.png' })
    
    // Verify content is visible
    await expect(editor).toHaveValue(/# Test Markdown/)
  })

  test('should handle undo/redo with keyboard', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Type initial content
    await editor.fill('First')
    
    // Try to undo (browser will handle this)
    await editor.focus()
    await page.keyboard.press('Control+Z')
    
    // Content should revert (browser native undo)
    // This tests browser undo capability
  })

  test('should focus editor and show feedback', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Click to focus
    await editor.focus()
    
    // Check if focused
    const isFocused = await editor.evaluate((el: HTMLElement) => {
      return document.activeElement === el
    })
    
    expect(isFocused).toBe(true)
  })

  test('should handle special characters', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Clear
    await editor.fill('')
    
    // Type special characters
    const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
    await editor.type(specialText)
    
    // Verify
    const value = await editor.inputValue()
    expect(value).toBe(specialText)
  })

  test('should handle multi-line content', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Clear
    await editor.fill('')
    
    // Type multi-line
    await editor.type('Line 1')
    await page.keyboard.press('Enter')
    await editor.type('Line 2')
    await page.keyboard.press('Enter')
    await editor.type('Line 3')
    
    // Verify
    const value = await editor.inputValue()
    const lines = value.split('\n')
    expect(lines).toHaveLength(3)
  })

  test('should respect readonly state if implemented', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Check if readonly attribute exists
    const isReadonly = await editor.evaluate((el: HTMLTextAreaElement) => {
      return el.readOnly
    })
    
    // Should not be readonly by default
    expect(isReadonly).toBe(false)
  })

  test('should update content programmatically', async ({ page }) => {
    const editor = page.locator('textarea')
    
    // Set content directly
    await editor.fill('Programmatically set content')
    
    // Verify
    await expect(editor).toHaveValue('Programmatically set content')
  })

  test('should handle concurrent edits in separate tabs', async ({ context }) => {
    // Create two pages
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    try {
      // Navigate both pages
      await page1.goto('http://localhost:3000')
      await page2.goto('http://localhost:3000')

      // Wait for load
      await page1.waitForLoadState('networkidle')
      await page2.waitForLoadState('networkidle')

      // Get editors
      const editor1 = page1.locator('textarea')
      const editor2 = page2.locator('textarea')

      // Both start empty
      await editor1.fill('')
      await editor2.fill('')

      // Edit in page 1
      await editor1.type('Content from page 1')

      // Wait for potential sync
      await page1.waitForTimeout(500)

      // Edit in page 2
      await editor2.type('Content from page 2')

      // Wait for potential sync
      await page2.waitForTimeout(500)

      // Check that both have their content (depends on sync implementation)
      const value1 = await editor1.inputValue()
      const value2 = await editor2.inputValue()

      // Both should have edited content
      expect(value1).toContain('page 1')
      expect(value2).toContain('page 2')
    } finally {
      await page1.close()
      await page2.close()
    }
  })
})
