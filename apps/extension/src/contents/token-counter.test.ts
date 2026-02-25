import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  MSG_GET_TOKENS,
  MSG_TOKEN_UPDATE,
  MSG_TOKEN_SETTINGS_UPDATE,
  STORAGE_TOKEN_ENABLED,
  STORAGE_TOKEN_DISPLAY_MODE,
  STORAGE_TOKEN_CANVAS_PLACEMENT
} from '@themegpt/shared'

const { mockStorageGet, mockStorageWatch, mockStorageData } = vi.hoisted(() => {
  const data: Record<string, unknown> = {}
  return {
    mockStorageData: data,
    mockStorageGet: vi.fn((key: string) => Promise.resolve(data[key])),
    mockStorageWatch: vi.fn(() => true)
  }
})

vi.mock('@plasmohq/storage', () => ({
  Storage: class {
    get = mockStorageGet
    watch = mockStorageWatch
  }
}))

import { calculateTokenStats } from './token-counter'

describe('token-counter', () => {
  describe('calculateTokenStats', () => {
    it('should correctly count tokens for user and assistant', () => {
      const messages = [
        { role: 'user', text: 'Hello world' },
        { role: 'assistant', text: 'Hi there' }
      ]

      const stats = calculateTokenStats(messages)

      expect(stats.user).toBeGreaterThan(0)
      expect(stats.assistant).toBeGreaterThan(0)
      expect(stats.total).toBe(stats.user + stats.assistant)
    })

    it('should handle empty or null text', () => {
      const messages = [
        { role: 'user', text: '' },
        { role: 'assistant', text: null }
      ]

      const stats = calculateTokenStats(messages)

      expect(stats.user).toBe(0)
      expect(stats.assistant).toBe(0)
      expect(stats.total).toBe(0)
    })

    it('should ignore tokens from unknown roles', () => {
      const messages = [
        { role: 'system', text: 'System message' },
        { role: 'user', text: 'User message' }
      ]

      const stats = calculateTokenStats(messages)

      expect(stats.assistant).toBe(0)
      expect(stats.user).toBeGreaterThan(0)
      expect(stats.total).toBe(stats.user)
    })

    it('should count multiple messages per role', () => {
      const messages = [
        { role: 'user', text: 'First question' },
        { role: 'assistant', text: 'First answer' },
        { role: 'user', text: 'Second question' },
        { role: 'assistant', text: 'Second answer' }
      ]

      const stats = calculateTokenStats(messages)

      expect(stats.user).toBeGreaterThan(0)
      expect(stats.assistant).toBeGreaterThan(0)
      expect(stats.total).toBe(stats.user + stats.assistant)
    })

    it('should handle empty messages array', () => {
      const messages: Array<{ role: string | null, text: string | null }> = []

      const stats = calculateTokenStats(messages)

      expect(stats.user).toBe(0)
      expect(stats.assistant).toBe(0)
      expect(stats.total).toBe(0)
    })

    it('should include lastUpdated timestamp', () => {
      const before = Date.now()
      const stats = calculateTokenStats([{ role: 'user', text: 'test' }])
      const after = Date.now()

      expect(stats.lastUpdated).toBeGreaterThanOrEqual(before)
      expect(stats.lastUpdated).toBeLessThanOrEqual(after)
    })
  })

  describe('config export', () => {
    it('should export correct PlasmoCSConfig', async () => {
      const module = await import('./token-counter')

      expect(module.config).toBeDefined()
      expect(module.config.matches).toContain('https://chat.openai.com/*')
      expect(module.config.matches).toContain('https://chatgpt.com/*')
    })
  })
})

describe('token-counter DOM interactions', () => {
  let mockSendMessage: ReturnType<typeof vi.fn>
  let mockAddListener: ReturnType<typeof vi.fn>
  let messageListeners: Map<string, (req: unknown, sender: unknown, sendResponse: (res: unknown) => void) => boolean | void>

  beforeEach(() => {
    vi.useFakeTimers()
    messageListeners = new Map()
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key])
    mockStorageGet.mockClear()
    mockStorageWatch.mockClear()

    mockSendMessage = vi.fn().mockImplementation(() => Promise.resolve())
    mockAddListener = vi.fn((listener) => {
      messageListeners.set('listener', listener)
    })

    Object.assign(globalThis, {
      chrome: {
        runtime: {
          id: 'test-extension-id',
          sendMessage: mockSendMessage,
          onMessage: {
            addListener: mockAddListener,
            removeListener: vi.fn()
          }
        }
      }
    })

    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('should respond to GET_TOKENS message', async () => {
    vi.resetModules()
    await import('./token-counter')

    expect(mockAddListener).toHaveBeenCalled()

    const listener = messageListeners.get('listener')
    expect(listener).toBeDefined()

    const sendResponse = vi.fn()
    const result = listener!({ type: MSG_GET_TOKENS }, {}, sendResponse)

    expect(result).toBe(true)
    expect(sendResponse).toHaveBeenCalled()
  })

  it('detects messages with data-message-author-role', async () => {
    vi.resetModules()
    await import('./token-counter')

    const userMessage = document.createElement('div')
    userMessage.setAttribute('data-message-author-role', 'user')
    userMessage.textContent = 'Hello world'
    document.body.appendChild(userMessage)

    await vi.advanceTimersByTimeAsync(1100)

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: MSG_TOKEN_UPDATE,
        payload: expect.objectContaining({
          user: expect.any(Number),
          total: expect.any(Number)
        })
      })
    )
  })

  it('hides canvas counter when enabled is false', async () => {
    mockStorageData[STORAGE_TOKEN_ENABLED] = false
    mockStorageData[STORAGE_TOKEN_CANVAS_PLACEMENT] = 'sidebar-top'

    vi.resetModules()
    await import('./token-counter')
    await Promise.resolve()

    const counter = document.getElementById('themegpt-token-counter-canvas')
    expect(counter).not.toBeInTheDocument()
  })

  it('maps legacy popup mode to disabled when enabled flag is missing', async () => {
    mockStorageData[STORAGE_TOKEN_DISPLAY_MODE] = 'popup'
    mockStorageData[STORAGE_TOKEN_CANVAS_PLACEMENT] = 'sidebar-top'

    vi.resetModules()
    await import('./token-counter')
    await Promise.resolve()

    const counter = document.getElementById('themegpt-token-counter-canvas')
    expect(counter).not.toBeInTheDocument()
  })

  it('maps legacy canvas mode to enabled when enabled flag is missing', async () => {
    mockStorageData[STORAGE_TOKEN_DISPLAY_MODE] = 'canvas'
    mockStorageData[STORAGE_TOKEN_CANVAS_PLACEMENT] = 'sidebar-top'

    const aside = document.createElement('aside')
    const nav = document.createElement('nav')
    aside.appendChild(nav)
    document.body.appendChild(aside)

    vi.resetModules()
    await import('./token-counter')
    await Promise.resolve()

    const counter = document.getElementById('themegpt-token-counter-canvas')
    expect(counter).toBeInTheDocument()
    expect(counter).toHaveClass('themegpt-token-counter--sidebar')
  })

  it('mounts canvas counter at sidebar top when selected', async () => {
    mockStorageData[STORAGE_TOKEN_ENABLED] = true
    mockStorageData[STORAGE_TOKEN_CANVAS_PLACEMENT] = 'sidebar-top'

    const aside = document.createElement('aside')
    const nav = document.createElement('nav')
    aside.appendChild(nav)
    document.body.appendChild(aside)

    vi.resetModules()
    await import('./token-counter')
    await Promise.resolve()

    const counter = document.getElementById('themegpt-token-counter-canvas')
    expect(counter).toBeInTheDocument()
    expect(counter).toHaveClass('themegpt-token-counter--sidebar')
    expect(counter?.parentElement).toBe(nav)
  })

  it('mounts compose-right counter in far-right lane when space is available', async () => {
    mockStorageData[STORAGE_TOKEN_ENABLED] = true
    mockStorageData[STORAGE_TOKEN_CANVAS_PLACEMENT] = 'composer-right'

    const textarea = document.createElement('textarea')
    textarea.setAttribute('data-testid', 'prompt-textarea')
    Object.defineProperty(textarea, 'getBoundingClientRect', {
      value: () => ({
        x: 20,
        y: 620,
        width: 700,
        height: 56,
        top: 620,
        left: 20,
        right: 720,
        bottom: 676,
        toJSON: () => ({})
      })
    })
    document.body.appendChild(textarea)

    vi.resetModules()
    await import('./token-counter')
    await Promise.resolve()

    const counter = document.getElementById('themegpt-token-counter-canvas') as HTMLDivElement | null
    expect(counter).toBeInTheDocument()
    expect(counter).toHaveClass('themegpt-token-counter--composer-right')
    expect(counter?.parentElement).toBe(document.body)
    expect(Number.parseInt(counter?.style.left ?? '0', 10)).toBeGreaterThanOrEqual(732)
  })

  it('falls back to floating when compose-right lane has insufficient room', async () => {
    mockStorageData[STORAGE_TOKEN_ENABLED] = true
    mockStorageData[STORAGE_TOKEN_CANVAS_PLACEMENT] = 'composer-right'

    const textarea = document.createElement('textarea')
    textarea.setAttribute('data-testid', 'prompt-textarea')
    Object.defineProperty(textarea, 'getBoundingClientRect', {
      value: () => ({
        x: 300,
        y: 620,
        width: 710,
        height: 56,
        top: 620,
        left: 300,
        right: 1010,
        bottom: 676,
        toJSON: () => ({})
      })
    })
    document.body.appendChild(textarea)

    vi.resetModules()
    await import('./token-counter')
    await Promise.resolve()

    const counter = document.getElementById('themegpt-token-counter-canvas')
    expect(counter).toBeInTheDocument()
    expect(counter).toHaveClass('themegpt-token-counter--floating')
  })

  it('updates placement from runtime settings message', async () => {
    mockStorageData[STORAGE_TOKEN_ENABLED] = false

    const textarea = document.createElement('textarea')
    textarea.setAttribute('data-testid', 'prompt-textarea')
    document.body.appendChild(textarea)

    vi.resetModules()
    await import('./token-counter')
    await Promise.resolve()

    const listener = messageListeners.get('listener')
    expect(listener).toBeDefined()

    listener!(
      {
        type: MSG_TOKEN_SETTINGS_UPDATE,
        payload: { enabled: true, placement: 'composer-right' }
      },
      {},
      vi.fn()
    )

    const counter = document.getElementById('themegpt-token-counter-canvas')
    expect(counter).toBeInTheDocument()
    expect(counter).toHaveClass('themegpt-token-counter--composer-right')
  })

  it('renders mascot icon with data URI in counter header', async () => {
    mockStorageData[STORAGE_TOKEN_ENABLED] = true
    mockStorageData[STORAGE_TOKEN_CANVAS_PLACEMENT] = 'sidebar-top'

    const aside = document.createElement('aside')
    const nav = document.createElement('nav')
    aside.appendChild(nav)
    document.body.appendChild(aside)

    vi.resetModules()
    await import('./token-counter')
    await Promise.resolve()

    const icon = document.querySelector('#themegpt-token-counter-canvas .themegpt-token-counter__icon') as HTMLImageElement | null
    expect(icon).toBeInTheDocument()
    expect(icon?.getAttribute('src')).toMatch(/^data:image\/png;base64,/)
  })
})
