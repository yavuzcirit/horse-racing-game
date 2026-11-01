import { expect, test } from '@playwright/test'
import { advance, controls, horseRows, openGame } from '../support/game'

test('ships a strict Content Security Policy and runs without violations', async ({ page }) => {
  const problems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(message.text())
  })
  page.on('pageerror', (error) => problems.push(error.message))

  await openGame(page)

  const policy = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute('content')
  expect(policy).toContain("default-src 'self'")
  expect(policy).toContain("script-src 'self'")
  expect(policy).not.toContain('unsafe-inline')
  expect(policy).not.toContain('unsafe-eval')

  const { generate, start, speed } = controls(page)
  await generate.click()
  await speed(4).check()
  await start.click()
  await advance(page, 5_000)

  expect(problems).toEqual([])
})

test('ignores a malformed seed in the URL', async ({ page }) => {
  await page.goto('/?seed=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E')
  await expect(horseRows(page)).toHaveCount(20)
  await expect(page.locator('img')).toHaveCount(0)
})

test('loads no third-party resources', async ({ page }) => {
  const origins = new Set<string>()
  page.on('request', (request) => origins.add(new URL(request.url()).origin))

  await openGame(page)

  expect([...origins]).toEqual(['http://localhost:4173'])
})
