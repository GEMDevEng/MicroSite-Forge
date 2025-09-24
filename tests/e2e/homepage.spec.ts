import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toContainText('MicroSite Forge')
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Check Get Started button
    const getStartedButton = page.getByRole('link', { name: 'Get Started' })
    await expect(getStartedButton).toBeVisible()
    await expect(getStartedButton).toHaveAttribute('href', '/auth/signup')

    // Check Sign In button
    const signInButton = page.getByRole('link', { name: 'Sign In' })
    await expect(signInButton).toBeVisible()
    await expect(signInButton).toHaveAttribute('href', '/auth/login')
  })

  test('should display feature cards', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('AI-Powered Research')).toBeVisible()
    await expect(page.getByText('Instant Deployment')).toBeVisible()
    await expect(page.getByText('Smart Lead Capture')).toBeVisible()
    await expect(page.getByText('Real-time Analytics')).toBeVisible()
  })

  test('should display business impact metrics', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('$19K', { exact: true })).toBeVisible()
    await expect(page.getByText('95%', { exact: true })).toBeVisible()
    await expect(page.getByTestId('metric-sites')).toBeVisible()
  })
})
