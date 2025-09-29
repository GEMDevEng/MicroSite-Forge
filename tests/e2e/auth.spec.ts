import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login')

    await expect(page.locator('h1')).toContainText('Sign in to your account')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign ?in/i })).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup')

    await expect(page.locator('h1')).toContainText('Create your account')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('#confirmPassword')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login')

    await page.getByLabel('Email').fill('not-an-email')
    await page.locator('#password').fill('password123')
    await page.getByRole('button', { name: /sign ?in/i }).click()

    // Adjust regex to match your UI text, likely "Invalid email"
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('should show validation errors for short password', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login')

    await page.getByLabel('Email').fill('test@example.com')
    await page.locator('#password').fill('123')
    await page.getByRole('button', { name: /sign ?in/i }).click()

    // Adjust regex to match your UI text, e.g. "Password must be at least 6 characters"
    await expect(page.getByText(/password.*too short/i)).toBeVisible()
  })

  test('should navigate between login and signup pages', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login')

    await page.getByRole('link', { name: /create account/i }).click()
    await expect(page.locator('h1')).toContainText('Create your account')

    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page.locator('h1')).toContainText('Sign in to your account')
  })

  test('should display GitHub OAuth button', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/login')

    // Check that both login and signup have the GitHub button
    const githubButton = page.locator('button').filter({ hasText: 'GitHub' })
    await expect(githubButton).toBeVisible()

    // GitHub button should be clickable (though OAuth won't work without config)
    await expect(githubButton).toBeEnabled()
  })

  test('should display all OAuth provider buttons', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup')

    // Check for all OAuth providers
    const googleButton = page.locator('button').filter({ hasText: 'Google' })
    const facebookButton = page.locator('button').filter({ hasText: 'Facebook' })
    const githubButton = page.locator('button').filter({ hasText: 'GitHub' })

    await expect(googleButton).toBeVisible()
    await expect(facebookButton).toBeVisible()
    await expect(githubButton).toBeVisible()

    // All should be enabled
    await expect(googleButton).toBeEnabled()
    await expect(facebookButton).toBeEnabled()
    await expect(githubButton).toBeEnabled()
  })
})
