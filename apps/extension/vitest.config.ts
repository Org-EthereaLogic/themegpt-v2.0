import { defineConfig, type Plugin } from 'vitest/config'
import path from 'path'

/**
 * Vite plugin that resolves Plasmo's `url:` prefixed imports to a mock asset.
 * Plasmo/Parcel uses `url:./file.png` to get a URL string at build time,
 * but Vite doesn't understand this convention.
 */
function plasmoUrlImportPlugin(): Plugin {
  const mockAsset = path.resolve(__dirname, 'test/__mocks__/asset.ts')
  return {
    name: 'plasmo-url-import',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('url:')) {
        return mockAsset
      }
    },
  }
}

export default defineConfig({
  plugins: [plasmoUrlImportPlugin()],
  resolve: {
    alias: {
      '@themegpt/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
  },
})
