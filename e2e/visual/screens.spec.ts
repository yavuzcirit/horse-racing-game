import { expect, test } from '@playwright/test'
import { advance, advanceUntil, controls, openGame, raceStatus } from '../support/game'

test.describe('game screen', () => {
  test.beforeEach(async ({ page }) => {
    await openGame(page)
  })

  test('before a program is generated', async ({ page }) => {
    await expect(page).toHaveScreenshot('initial.png', { fullPage: true })
  })

  test('with a program in the gates', async ({ page }) => {
    await controls(page).generate.click()
    await expect(page).toHaveScreenshot('program.png', { fullPage: true })
  })

  test('in the middle of the first round', async ({ page }) => {
    const { generate, start, pause } = controls(page)
    await generate.click()
    await start.click()
    await advance(page, 4_000)
    await pause.click()
    await expect(page.locator('.track')).toHaveScreenshot('mid-race-track.png')
    await expect(page).toHaveScreenshot('mid-race.png', { fullPage: true })
  })

  test('after all six rounds', async ({ page }) => {
    const { generate, start, speed } = controls(page)
    await generate.click()
    await speed(4).check()
    await start.click()
    await advanceUntil(
      page,
      async () => (await raceStatus(page).textContent())?.includes('complete') ?? false,
    )
    await expect(page).toHaveScreenshot('finished.png', { fullPage: true })
  })
})
