import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page.locator('h1')).toContainText('Sign in to your account')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/signup')
    
    await expect(page.locator('h1')).toContainText('Create your account')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  })

  test('should show validation errors for short password', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('123')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible()
  })

  test('should navigate between login and signup pages', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.getByRole('link', { name: 'Sign up' }).click()
    await expect(page).toHaveURL('/auth/signup')
    
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/auth/login')
  })
})
