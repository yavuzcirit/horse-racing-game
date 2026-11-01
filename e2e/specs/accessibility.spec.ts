import { expect, test } from '@playwright/test'
import { advance, controls, openGame, raceStatus } from '../support/game'

test.beforeEach(async ({ page }) => {
  await openGame(page)
})

test('the whole game can be played with the keyboard', async ({ page }) => {
  const { generate, start, pause, speed } = controls(page)

  await generate.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(start).toBeFocused()

  await page.keyboard.press('Space')
  await expect(pause).toBeFocused()
  await advance(page, 500)
  await expect(raceStatus(page)).toContainText('under way')

  await page.keyboard.press('Tab')
  await expect(speed(1)).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(speed(2)).toBeChecked()
})

test('landmarks, headings and live regions are in place', async ({ page }) => {
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Horse Racing')
  await expect(page.getByRole('list', { name: /Live race commentary/ })).toHaveAttribute(
    'aria-live',
    'polite',
  )
  await expect(page.getByRole('group', { name: 'Speed' })).toBeVisible()
})
