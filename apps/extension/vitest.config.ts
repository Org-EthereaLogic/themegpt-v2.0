import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // Handle Plasmo url: imports by returning empty string
      '^url:': '',
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
