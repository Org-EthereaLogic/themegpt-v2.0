import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Theme } from '@themegpt/shared'

// Mock storage before importing module
const mockGet = vi.fn()
const mockWatch = vi.fn()

vi.mock('@plasmohq/storage', () => ({
  Storage: class {
    get = mockGet
    watch = mockWatch
  }
}))

describe('theme-injector', () => {
  let styleElement: HTMLStyleElement | null = null
  const defaultColors: Theme['colors'] = {
    '--cgpt-bg': '#ffffff',
    '--cgpt-surface': '#f5f5f5',
    '--cgpt-text': '#000000',
    '--cgpt-text-muted': '#666666',
    '--cgpt-border': '#cccccc',
    '--cgpt-accent': '#ff0000'
  }

  beforeEach(() => {
    // Clean up any existing style elements
    document.getElementById('themegpt-styles')?.remove()
    styleElement = null
    vi.clearAllMocks()
    mockGet.mockResolvedValue(undefined)
  })

  afterEach(() => {
    document.getElementById('themegpt-styles')?.remove()
  })

  describe('applyTheme', () => {
    it('should create a style element with CSS variables when theme is applied', async () => {
      const mockTheme: Theme = {
        id: 'test-theme',
        name: 'Test Theme',
        category: 'core',
        isPremium: false,
        colors: defaultColors
      }
      mockGet.mockResolvedValue(mockTheme)

      // Re-import module to trigger init with mocked theme
      vi.resetModules()
      await import('./theme-injector')

      // Wait for async init
      await new Promise(resolve => setTimeout(resolve, 50))

      const style = document.getElementById('themegpt-styles')
      expect(style).toBeTruthy()
      expect(style?.textContent).toContain('--cgpt-bg: #ffffff')
      expect(style?.textContent).toContain('--cgpt-surface: #f5f5f5')
      expect(style?.textContent).toContain('--cgpt-text: #000000')
    })

    it('should include ChatGPT UI overrides in CSS', async () => {
      const mockTheme: Theme = {
        id: 'test-theme',
        name: 'Test Theme',
        category: 'core',
        isPremium: false,
        colors: defaultColors
      }
      mockGet.mockResolvedValue(mockTheme)

      vi.resetModules()
      await import('./theme-injector')
      await new Promise(resolve => setTimeout(resolve, 50))

      const style = document.getElementById('themegpt-styles')
      expect(style?.textContent).toContain('background-color: var(--cgpt-bg)')
      expect(style?.textContent).toContain('[data-message-author-role]')
    })

    it('should not create style element when no theme is saved', async () => {
      mockGet.mockResolvedValue(undefined)

      vi.resetModules()
      await import('./theme-injector')
      await new Promise(resolve => setTimeout(resolve, 50))

      const style = document.getElementById('themegpt-styles')
      expect(style).toBeNull()
    })

    it('should set up storage watch for theme changes', async () => {
      mockGet.mockResolvedValue(undefined)

      vi.resetModules()
      await import('./theme-injector')
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockWatch).toHaveBeenCalled()
      expect(mockWatch).toHaveBeenCalledWith(expect.objectContaining({
        activeTheme: expect.any(Function)
      }))
    })

    it('should update theme when storage watch callback fires', async () => {
      mockGet.mockResolvedValue(undefined)
      let watchCallback: ((change: { newValue: Theme | null }) => void) | null = null
      mockWatch.mockImplementation((config: { activeTheme: (change: { newValue: Theme | null }) => void }) => {
        watchCallback = config.activeTheme
      })

      vi.resetModules()
      await import('./theme-injector')
      await new Promise(resolve => setTimeout(resolve, 50))

      // Initially no style
      expect(document.getElementById('themegpt-styles')).toBeNull()

      // Simulate theme change via storage watch
      const newTheme: Theme = {
        id: 'new-theme',
        name: 'New Theme',
        category: 'core',
        isPremium: false,
        colors: { ...defaultColors, '--cgpt-bg': '#123456' }
      }
      watchCallback!({ newValue: newTheme })

      const style = document.getElementById('themegpt-styles')
      expect(style).toBeTruthy()
      expect(style?.textContent).toContain('--cgpt-bg: #123456')
    })

    it('should remove theme when null is passed via watch', async () => {
      const mockTheme: Theme = {
        id: 'test-theme',
        name: 'Test Theme',
        category: 'core',
        isPremium: false,
        colors: defaultColors
      }
      mockGet.mockResolvedValue(mockTheme)

      let watchCallback: ((change: { newValue: Theme | null }) => void) | null = null
      mockWatch.mockImplementation((config: { activeTheme: (change: { newValue: Theme | null }) => void }) => {
        watchCallback = config.activeTheme
      })

      vi.resetModules()
      await import('./theme-injector')
      await new Promise(resolve => setTimeout(resolve, 50))

      // Theme should be applied
      expect(document.getElementById('themegpt-styles')).toBeTruthy()

      // Remove theme
      watchCallback!({ newValue: null })

      expect(document.getElementById('themegpt-styles')).toBeNull()
    })

    it('should handle theme with empty colors object', async () => {
      const mockTheme: Theme = {
        id: 'empty-theme',
        name: 'Empty Theme',
        category: 'core',
        isPremium: false,
        colors: {} as unknown as Theme['colors']
      }
      mockGet.mockResolvedValue(mockTheme)

      vi.resetModules()
      await import('./theme-injector')
      await new Promise(resolve => setTimeout(resolve, 50))

      const style = document.getElementById('themegpt-styles')
      // Should still create style element with base CSS
      expect(style).toBeTruthy()
    })

    it('should reuse existing style element on theme updates', async () => {
      const mockTheme: Theme = {
        id: 'test-theme',
        name: 'Test Theme',
        category: 'core',
        isPremium: false,
        colors: { ...defaultColors, '--cgpt-bg': '#111111' }
      }
      mockGet.mockResolvedValue(mockTheme)

      let watchCallback: ((change: { newValue: Theme | null }) => void) | null = null
      mockWatch.mockImplementation((config: { activeTheme: (change: { newValue: Theme | null }) => void }) => {
        watchCallback = config.activeTheme
      })

      vi.resetModules()
      await import('./theme-injector')
      await new Promise(resolve => setTimeout(resolve, 50))

      const firstStyle = document.getElementById('themegpt-styles')

      // Update theme
      watchCallback!({ newValue: { ...mockTheme, colors: { ...defaultColors, '--cgpt-bg': '#222222' } } })

      const secondStyle = document.getElementById('themegpt-styles')
      expect(secondStyle).toBe(firstStyle) // Same element, just updated content
      expect(secondStyle?.textContent).toContain('#222222')
    })
  })

  describe('config', () => {
    it('should export correct PlasmoCSConfig', async () => {
      vi.resetModules()
      const module = await import('./theme-injector')

      expect(module.config).toBeDefined()
      expect(module.config.matches).toContain('https://chat.openai.com/*')
      expect(module.config.matches).toContain('https://chatgpt.com/*')
      expect(module.config.run_at).toBe('document_start')
    })
  })
})
