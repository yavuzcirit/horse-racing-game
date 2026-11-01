import { expect, test } from '@playwright/test'
import {
  advance,
  controls,
  openGame,
  panel,
  raceStatus,
  runnerProgress,
  trackHeading,
} from '../support/game'

test('a reload resumes the program where it stopped, paused', async ({ page }) => {
  await openGame(page)
  const { generate, start, speed } = controls(page)
  await generate.click()
  await speed(4).check()
  await start.click()
  await advance(page, 3_500)

  const heading = await trackHeading(page).textContent()
  const resultCount = await panel(page, 'Results').getByRole('table').count()
  expect(resultCount).toBeGreaterThan(0)

  await page.reload()

  await expect(raceStatus(page)).toHaveText('Paused.')
  await expect(trackHeading(page)).toHaveText(heading!)
  await expect(panel(page, 'Results').getByRole('table')).toHaveCount(resultCount)
  await expect(controls(page).speed(4)).toBeChecked()

  const before = await runnerProgress(page)
  await controls(page).resume.click()
  await advance(page, 300)
  expect(await runnerProgress(page)).not.toEqual(before)
})

test('a corrupted saved session is discarded', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('horse-racing:session', '{"version":1,"seed":"x","race":{}}')
  })
  await openGame(page)

  await expect(trackHeading(page)).toHaveText('No program yet')
  expect(await page.evaluate(() => localStorage.getItem('horse-racing:session'))).toBeNull()
})
