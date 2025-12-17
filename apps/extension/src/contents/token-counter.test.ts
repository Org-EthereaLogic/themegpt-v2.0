import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MSG_GET_TOKENS, MSG_TOKEN_UPDATE } from '@themegpt/shared'

// Test the pure function directly
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

    it('should handle null role', () => {
      const messages = [
        { role: null, text: 'Some text' },
        { role: 'user', text: 'User text' }
      ]

      const stats = calculateTokenStats(messages)

      // null role should be ignored
      expect(stats.user).toBeGreaterThan(0)
      expect(stats.assistant).toBe(0)
    })

    it('should tokenize longer messages correctly', () => {
      const longText = 'This is a longer message that contains multiple words and should result in multiple tokens being counted accurately.'
      const messages = [
        { role: 'user', text: longText }
      ]

      const stats = calculateTokenStats(messages)

      // Long message should have many tokens
      expect(stats.user).toBeGreaterThan(10)
      expect(stats.total).toBe(stats.user)
    })

    it('should handle special characters', () => {
      const messages = [
        { role: 'user', text: 'Hello! @#$%^&*() 你好 🎉' }
      ]

      const stats = calculateTokenStats(messages)

      expect(stats.user).toBeGreaterThan(0)
    })
  })

  describe('config export', () => {
    it('should export correct PlasmoCSConfig', async () => {
      // Re-import to get the config
      const module = await import('./token-counter')

      expect(module.config).toBeDefined()
      expect(module.config.matches).toContain('https://chat.openai.com/*')
      expect(module.config.matches).toContain('https://chatgpt.com/*')
    })
  })
})

// Separate describe block for DOM interaction tests
describe('token-counter DOM interactions', () => {
  let mockSendMessage: ReturnType<typeof vi.fn>
  let mockAddListener: ReturnType<typeof vi.fn>
  let messageListeners: Map<string, (req: unknown, sender: unknown, sendResponse: (res: unknown) => void) => boolean | void>

  beforeEach(() => {
    vi.useFakeTimers()
    messageListeners = new Map()

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

    // Set up document with mock main element
    document.body.innerHTML = '<main></main>'
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('should respond to GET_TOKENS message', async () => {
    // Reset modules to re-run initialization
    vi.resetModules()

    // Import after setting up mocks
    await import('./token-counter')

    // Verify listener was added
    expect(mockAddListener).toHaveBeenCalled()

    // Get the listener
    const listener = messageListeners.get('listener')
    expect(listener).toBeDefined()

    // Simulate receiving a GET_TOKENS message
    const sendResponse = vi.fn()
    const result = listener!({ type: MSG_GET_TOKENS }, {}, sendResponse)

    // Should return true to indicate async response
    expect(result).toBe(true)
    expect(sendResponse).toHaveBeenCalled()
  })

  it('should send TOKEN_UPDATE message when content changes', async () => {
    vi.resetModules()
    await import('./token-counter')

    // Add message elements to DOM
    const main = document.querySelector('main')!
    const userMessage = document.createElement('div')
    userMessage.setAttribute('data-message-author-role', 'user')
    userMessage.textContent = 'Hello world'
    main.appendChild(userMessage)

    // Wait for observer to detect changes (debounce is 1000ms)
    await vi.advanceTimersByTimeAsync(1100)

    // Should have sent an update
    expect(mockSendMessage).toHaveBeenCalled()
  })

  it('should extract message data from DOM elements', async () => {
    vi.resetModules()
    await import('./token-counter')

    // Add multiple message elements
    const main = document.querySelector('main')!

    const userMsg = document.createElement('div')
    userMsg.setAttribute('data-message-author-role', 'user')
    userMsg.textContent = 'User message'
    main.appendChild(userMsg)

    const assistantMsg = document.createElement('div')
    assistantMsg.setAttribute('data-message-author-role', 'assistant')
    assistantMsg.textContent = 'Assistant response'
    main.appendChild(assistantMsg)

    // Trigger update
    await vi.advanceTimersByTimeAsync(1100)

    // Verify update was sent with token counts
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: MSG_TOKEN_UPDATE,
        payload: expect.objectContaining({
          user: expect.any(Number),
          assistant: expect.any(Number),
          total: expect.any(Number)
        })
      })
    )
  })

  it('should not send update if total count unchanged', async () => {
    vi.resetModules()
    await import('./token-counter')

    const main = document.querySelector('main')!
    const userMsg = document.createElement('div')
    userMsg.setAttribute('data-message-author-role', 'user')
    userMsg.textContent = 'Hello'
    main.appendChild(userMsg)

    // First update
    await vi.advanceTimersByTimeAsync(1100)
    const firstCallCount = mockSendMessage.mock.calls.length

    // Trigger another update without changing content
    await vi.advanceTimersByTimeAsync(1100)

    // Should not have sent additional update
    expect(mockSendMessage.mock.calls.length).toBe(firstCallCount)
  })

  it('should retry initObserver if main not found', async () => {
    // Remove main element
    document.body.innerHTML = ''

    vi.resetModules()
    await import('./token-counter')

    // Should set a timeout to retry
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    // Add main element
    document.body.innerHTML = '<main></main>'

    // Advance to trigger retry
    await vi.advanceTimersByTimeAsync(1100)

    // Observer should now be set up
    expect(mockAddListener).toHaveBeenCalled()
  })

  it('should handle sendMessage errors gracefully', async () => {
    mockSendMessage.mockImplementation(() => Promise.reject(new Error('Popup not open')))

    vi.resetModules()
    await import('./token-counter')

    const main = document.querySelector('main')!
    const userMsg = document.createElement('div')
    userMsg.setAttribute('data-message-author-role', 'user')
    userMsg.textContent = 'Test'
    main.appendChild(userMsg)

    // Should not throw even though sendMessage fails
    await expect(vi.advanceTimersByTimeAsync(1100)).resolves.not.toThrow()
  })
})
