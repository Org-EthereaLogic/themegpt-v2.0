import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // Handle Plasmo url: imports by returning empty string
      '^url:': '',
      '@themegpt/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    alias: {
      // Mock url: prefix imports
      'url:../assets/mascot-32.png': '/test/__mocks__/asset.ts',
    },
  },
})
