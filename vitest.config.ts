import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['lib/cipher/**'],
      thresholds: {
        lines: 80,
      },
    },
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@cipher': path.resolve(__dirname, './lib/cipher'),
    },
  },
})
