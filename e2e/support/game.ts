import { expect, type Page } from '@playwright/test'

export const DEFAULT_SEED = 42

const CLOCK_START = new Date('2026-01-05T09:00:00Z')

export async function openGame(page: Page, seed = DEFAULT_SEED) {
  await page.clock.install({ time: CLOCK_START })
  await page.goto(`/?seed=${seed}`)
  await page.clock.pauseAt(new Date(CLOCK_START.getTime() + 1_000))
  await expect(horseRows(page)).toHaveCount(20)
}

export async function advance(page: Page, milliseconds: number) {
  await page.clock.runFor(milliseconds)
}

export function horseRows(page: Page) {
  return page
    .getByRole('table', { name: 'All horses with their condition and colour' })
    .locator('tbody tr')
}

export function controls(page: Page) {
  return {
    generate: page.getByRole('button', { name: 'Generate Program' }),
    start: page.getByRole('button', { name: 'Start', exact: true }),
    pause: page.getByRole('button', { name: 'Pause', exact: true }),
    resume: page.getByRole('button', { name: 'Resume', exact: true }),
    newHorses: page.getByRole('button', { name: 'New horses' }),
    speed: (factor: 1 | 2 | 4) => page.getByRole('radio', { name: `${factor}×` }),
  }
}

export function panel(page: Page, name: 'Program' | 'Results' | 'Commentary') {
  return page.getByRole('region', { name, exact: true })
}

export function raceStatus(page: Page) {
  return page.getByTestId('race-status')
}

export function trackHeading(page: Page) {
  return page.getByRole('heading', { level: 2, name: /^(Round \d · \d+ m|No program yet)$/ })
}

export async function runnerProgress(page: Page): Promise<number[]> {
  return page
    .getByTestId('runner')
    .evaluateAll((runners) =>
      runners.map((runner) => Number((runner as HTMLElement).style.getPropertyValue('--progress'))),
    )
}

export async function advanceUntil(
  page: Page,
  done: () => Promise<boolean>,
  { step = 1_000, budget = 120_000 } = {},
) {
  for (let spent = 0; spent <= budget; spent += step) {
    if (await done()) return
    await advance(page, step)
  }
  throw new Error(`Condition not reached within ${budget} ms of game time`)
}
