import { expect, test } from '@playwright/test'

test.describe('Auth flow', () => {
  test('sign up continues to app page', async ({ page }) => {
    await page.goto('/signup')

    await page.getByPlaceholder('Your name').fill('Test User')
    await page.getByPlaceholder('you@example.com').fill('test@example.com')
    await page.getByPlaceholder('••••••••').fill('password123')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL(/\/app$/)
  })

  test('shows validation error when signup fields are missing', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Please enter your full name.')).toBeVisible()
    await expect(page).toHaveURL(/\/signup$/)
  })

  test('clears signup error when switching to signin', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Please enter your full name.')).toBeVisible()

    await page.getByRole('link', { name: 'Sign in', exact: true }).click()

    await expect(page).toHaveURL(/\/signin$/)
    await expect(page.getByText('Please enter your full name.')).toHaveCount(0)
  })
})
