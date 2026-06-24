import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('exposes labeled controls without serious accessibility violations', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
  await expect(page.getByLabel('名称')).toBeVisible()
  await expect(page.getByLabel('密码')).toHaveAttribute('type', 'password')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = results.violations.filter(violation =>
    violation.impact === 'serious' || violation.impact === 'critical',
  )

  expect(serious).toEqual([])
})

test('updates theme, form values, tabs, and pagination', async ({ page }) => {
  const themeSwitch = page.getByRole('switch', { name: 'Dark' })
  await themeSwitch.focus()
  await themeSwitch.press('Space')
  await expect(themeSwitch).toBeChecked()
  await expect(page.locator('html')).toHaveAttribute('data-neu-theme', 'dark')

  await page.getByLabel('名称').fill('Healock')
  await page.getByLabel('密码').fill('secret')
  await expect(page.getByLabel('名称')).toHaveValue('Healock')

  await page.getByRole('tab', { name: 'Status' }).click()
  await expect(page.getByRole('progressbar', { name: 'Build' })).toHaveAttribute('aria-valuenow', '68')
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
})

test('supports keyboard tab navigation', async ({ page }) => {
  const form = page.getByRole('tab', { name: 'Form' })
  const styles = await form.evaluate(element => {
    const computed = getComputedStyle(element)
    return {
      paddingInline: Number.parseFloat(computed.paddingInlineStart),
      borderRadius: Number.parseFloat(computed.borderRadius),
    }
  })
  expect(styles.paddingInline).toBeGreaterThan(0)
  expect(styles.borderRadius).toBeGreaterThan(0)

  await form.focus()
  await form.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Status' })).toBeFocused()
  await expect(page.getByRole('tab', { name: 'Status' })).toHaveAttribute('aria-selected', 'true')
})

test('opens and selects an accessible dropdown item', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Menu' })
  await trigger.click()
  const profile = page.getByRole('menuitem', { name: 'Profile' })
  await expect(profile).toBeVisible()
  await profile.click()
  await expect(trigger).toBeFocused()

  await page.getByRole('tab', { name: 'Status' }).click()
  await expect(page.getByText('Selected: profile')).toBeVisible()
})

test('keeps interactive pointer targets at least 44px tall', async ({ page }) => {
  const menu = page.getByRole('button', { name: 'Menu' })
  const save = page.getByRole('button', { name: '保存' })
  const formTab = page.getByRole('tab', { name: 'Form' })
  const themeSwitch = page.getByRole('switch', { name: 'Dark' }).locator('..')

  for (const target of [menu, save, formTab, themeSwitch]) {
    const box = await target.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44)
  }

  await menu.click()
  const menuItemBox = await page.getByRole('menuitem', { name: 'Profile' }).boundingBox()
  expect(menuItemBox?.height).toBeGreaterThanOrEqual(44)
})

test('does not overflow at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width)
})

test('honors reduced motion and forced colors', async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  const button = page.getByRole('button', { name: '保存' })
  const styles = await button.evaluate(element => {
    const computed = getComputedStyle(element)
    return {
      forcedColorsActive: matchMedia('(forced-colors: active)').matches,
      transitionDuration: computed.transitionDuration,
      boxShadow: computed.boxShadow,
    }
  })
  expect(styles.forcedColorsActive).toBe(true)
  expect(Number.parseFloat(styles.transitionDuration)).toBeLessThanOrEqual(0.00001)
  if (browserName !== 'webkit') {
    expect(styles.boxShadow).toBe('none')
  }
})

test('matches the primary card visual baseline', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'One stable browser owns the shared visual baseline.')
  await expect(page.locator('.neu-card')).toHaveScreenshot('primary-card.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.03,
  })
})
