import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    },
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate: '{testDir}/__snapshots__/{projectName}/{arg}{ext}',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'e2e',
      testDir: './e2e/specs',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual-desktop',
      testDir: './e2e/visual',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } },
    },
    {
      name: 'visual-mobile',
      testDir: './e2e/visual',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'npm run build-only && npm run preview',
    port: PORT,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
