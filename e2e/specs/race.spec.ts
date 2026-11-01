import { expect, test } from '@playwright/test'
import {
  advance,
  advanceUntil,
  controls,
  horseRows,
  openGame,
  panel,
  raceStatus,
  runnerProgress,
  trackHeading,
} from '../support/game'

test.beforeEach(async ({ page }) => {
  await openGame(page)
})

test('shows twenty horses and waits for a program', async ({ page }) => {
  const { generate, start } = controls(page)

  await expect(horseRows(page)).toHaveCount(20)
  await expect(trackHeading(page)).toHaveText('No program yet')
  await expect(generate).toBeEnabled()
  await expect(start).toBeDisabled()
  await expect(panel(page, 'Program')).toContainText('Press Generate Program')
  await expect(panel(page, 'Results')).toContainText('Results appear here')
})

test('generates six rounds of ten horses at the required distances', async ({ page }) => {
  await controls(page).generate.click()

  const program = panel(page, 'Program')
  await expect(program.locator('caption')).toHaveText([
    'Round 1 · 1200 m',
    'Round 2 · 1400 m',
    'Round 3 · 1600 m',
    'Round 4 · 1800 m',
    'Round 5 · 2000 m',
    'Round 6 · 2200 m',
  ])
  for (const table of await program.getByRole('table').all()) {
    await expect(table.locator('tbody tr')).toHaveCount(10)
  }
  await expect(page.getByRole('listitem').filter({ hasText: /^Lane \d+: / })).toHaveCount(0)
  await expect(page.getByTestId('runner')).toHaveCount(10)
  await expect(raceStatus(page)).toContainText('in the gates')
})

test('runs the rounds one at a time and posts each result as it finishes', async ({ page }) => {
  const { generate, start, speed } = controls(page)
  const results = panel(page, 'Results').getByRole('table')

  await generate.click()
  await speed(4).check()
  await start.click()

  await advance(page, 300)
  await expect(trackHeading(page)).toHaveText('Round 1 · 1200 m')
  expect(Math.max(...(await runnerProgress(page)))).toBeGreaterThan(0)
  await expect(results).toHaveCount(0)

  for (let round = 1; round <= 6; round++) {
    await advanceUntil(page, async () => (await results.count()) === round, { step: 250 })
    await expect(results.nth(round - 1).locator('caption')).toContainText(`Round ${round} ·`)
    await expect(results.nth(round - 1).locator('tbody tr')).toHaveCount(10)
  }

  await expect(raceStatus(page)).toHaveText('All 6 rounds are complete.')
  await expect(start).toBeDisabled()
  await expect(generate).toBeEnabled()
})

test('lists finishers in order with their times', async ({ page }) => {
  const { generate, start, speed } = controls(page)
  await generate.click()
  await speed(4).check()
  await start.click()

  const firstResult = panel(page, 'Results').getByRole('table').first()
  await advanceUntil(page, () => firstResult.isVisible(), { step: 250 })

  const rows = firstResult.locator('tbody tr')
  await expect(rows.locator('td').first()).toHaveText('1')
  const times = await rows.locator('td:last-child').allTextContents()
  const seconds = times.map((time) => {
    const [minutes, rest] = time.trim().split(':')
    return Number(minutes) * 60 + Number(rest)
  })
  expect(seconds).toEqual([...seconds].sort((a, b) => a - b))
})

test('pausing freezes the horses and resuming carries on', async ({ page }) => {
  const { generate, start, pause, resume } = controls(page)
  await generate.click()
  await start.click()
  await advance(page, 1_500)

  await pause.click()
  await expect(raceStatus(page)).toHaveText('Paused.')
  await expect(controls(page).generate).toBeEnabled()
  const frozen = await runnerProgress(page)

  await advance(page, 3_000)
  expect(await runnerProgress(page)).toEqual(frozen)

  await resume.click()
  await advance(page, 1_000)
  const moved = await runnerProgress(page)
  moved.forEach((progress, lane) => expect(progress).toBeGreaterThan(frozen[lane]!))
})

test('the commentator calls the start, the leaders and the winner', async ({ page }) => {
  const { generate, start, speed } = controls(page)
  await generate.click()
  await speed(4).check()
  await start.click()

  const commentary = panel(page, 'Commentary')
  await advance(page, 200)
  await expect(commentary.getByRole('listitem').first()).toContainText("And they're off! Round 1")

  await advanceUntil(
    page,
    async () => (await panel(page, 'Results').getByRole('table').count()) === 1,
    {
      step: 250,
    },
  )
  await expect(commentary).toContainText('takes the early lead')
  await expect(commentary).toContainText(/wins Round 1 in \d:\d{2}\.\d{2}/)
})

test('the same seed always produces the same horses and program', async ({ page, browser }) => {
  await controls(page).generate.click()
  const names = await horseRows(page).locator('th').allTextContents()
  const program = await panel(page, 'Program').locator('tbody').first().textContent()

  const other = await browser.newPage()
  await openGame(other)
  await controls(other).generate.click()
  await expect(horseRows(other).locator('th')).toHaveText(names)
  await expect(panel(other, 'Program').locator('tbody').first()).toHaveText(program ?? '')
  await other.close()
})

test('new horses replace the stable and clear the program', async ({ page }) => {
  const { generate, newHorses } = controls(page)
  const before = await horseRows(page).locator('th').allTextContents()
  await generate.click()

  await newHorses.click()

  await expect(horseRows(page)).toHaveCount(20)
  await expect(horseRows(page).locator('th')).not.toHaveText(before)
  await expect(panel(page, 'Program')).toContainText('Press Generate Program')
})
