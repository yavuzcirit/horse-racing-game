import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      restoreMocks: true,
      unstubGlobals: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/main.ts', 'src/**/__tests__/**', 'src/**/types.ts', 'src/**/index.ts'],
        reporter: ['text', 'html', 'lcov'],
        thresholds: {
          lines: 85,
          functions: 85,
          branches: 80,
          statements: 85,
          'src/features/*/model/**': { lines: 95, functions: 95, branches: 90, statements: 95 },
          'src/features/*/store/**': { lines: 90, functions: 90, branches: 85, statements: 90 },
        },
      },
    },
  }),
)
