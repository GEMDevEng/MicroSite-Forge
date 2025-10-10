import { test, expect } from '@playwright/test'

test.describe('Lead Management', () => {
  test('should navigate to lead management dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/leads')

    await expect(page.locator('h1')).toContainText('Lead Management')
  })

  test('should display lead table', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/leads')

    // Assuming there's a table with leads
    const leadTable = page.locator('table').filter({ hasText: 'Name' })
    await expect(leadTable).toBeVisible()
  })

  test('should be able to enrich a lead', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/leads')

    // Click enrich button on first lead if exists
    const enrichButton = page.locator('button').filter({ hasText: 'Enrich' }).first()
    if (await enrichButton.isVisible()) {
      await enrichButton.click()
      // Some success message
      await expect(page.locator('text=Lead enriched')).toBeVisible()
    }
  })

  test('should show lead creation form', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/leads')

    const createLeadButton = page.locator('button').filter({ hasText: 'Create Lead' })
    if (await createLeadButton.isVisible()) {
      await createLeadButton.click()
      // Modal or form should appear
      const form = page.locator('form').filter({ hasText: 'Name' })
      await expect(form).toBeVisible()
    }
  })
})
