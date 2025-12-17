import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { STORAGE_TOKEN_ENABLED, MSG_GET_TOKENS, MSG_TOKEN_UPDATE, type TokenStats } from '@themegpt/shared'

// Hoisted mocks
const { mockGet, mockSet, mockStorageData } = vi.hoisted(() => {
  const data: Record<string, unknown> = {}
  return {
    mockStorageData: data,
    mockGet: vi.fn((key: string) => Promise.resolve(data[key])),
    mockSet: vi.fn((key: string, value: unknown) => {
      data[key] = value
      return Promise.resolve()
    })
  }
})

vi.mock('@plasmohq/storage', () => ({
  Storage: class {
    get = mockGet
    set = mockSet
  }
}))

// Import after mocks
import { TokenCounter } from './TokenCounter'

describe('TokenCounter', () => {
  let mockTabsQuery: ReturnType<typeof vi.fn>
  let mockTabsSendMessage: ReturnType<typeof vi.fn>
  let mockAddListener: ReturnType<typeof vi.fn>
  let mockRemoveListener: ReturnType<typeof vi.fn>
  let messageListeners: ((message: unknown) => void)[] = []

  beforeEach(() => {
    // Reset storage data
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key])
    mockGet.mockClear()
    mockSet.mockClear()
    messageListeners = []

    // Mock chrome APIs
    mockTabsQuery = vi.fn()
    mockTabsSendMessage = vi.fn()
    mockAddListener = vi.fn((listener) => {
      messageListeners.push(listener)
    })
    mockRemoveListener = vi.fn((listener) => {
      messageListeners = messageListeners.filter(l => l !== listener)
    })

    Object.assign(globalThis, {
      chrome: {
        tabs: {
          query: mockTabsQuery,
          sendMessage: mockTabsSendMessage
        },
        runtime: {
          lastError: null,
          onMessage: {
            addListener: mockAddListener,
            removeListener: mockRemoveListener
          },
          sendMessage: vi.fn().mockResolvedValue(undefined)
        }
      }
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('Rendering when enabled (default)', () => {
    it('renders session tokens header when enabled', () => {
      render(<TokenCounter />)
      expect(screen.getByText('Session Tokens')).toBeInTheDocument()
    })

    it('renders privacy notice text', () => {
      render(<TokenCounter />)
      expect(screen.getByText(/no data leaves your browser/i)).toBeInTheDocument()
    })

    it('renders hide button when enabled', () => {
      render(<TokenCounter />)
      expect(screen.getByText('Hide')).toBeInTheDocument()
    })

    it('renders stat labels', () => {
      render(<TokenCounter />)
      expect(screen.getByText('Input')).toBeInTheDocument()
      expect(screen.getByText('Output')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('renders placeholder values when no stats available', () => {
      render(<TokenCounter />)
      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBe(3) // Input, Output, Total
    })
  })

  describe('Rendering when disabled', () => {
    it('renders show button when disabled via storage', async () => {
      mockStorageData[STORAGE_TOKEN_ENABLED] = false

      render(<TokenCounter />)

      await waitFor(() => {
        expect(screen.getByText('Show Token Counter')).toBeInTheDocument()
      })
    })

    it('does not render session tokens header when disabled', async () => {
      mockStorageData[STORAGE_TOKEN_ENABLED] = false

      render(<TokenCounter />)

      await waitFor(() => {
        expect(screen.queryByText('Session Tokens')).not.toBeInTheDocument()
      })
    })
  })

  describe('Toggle functionality', () => {
    it('hides counter when Hide button is clicked', async () => {
      render(<TokenCounter />)

      fireEvent.click(screen.getByText('Hide'))

      await waitFor(() => {
        expect(screen.getByText('Show Token Counter')).toBeInTheDocument()
      })
      expect(mockSet).toHaveBeenCalledWith(STORAGE_TOKEN_ENABLED, false)
    })

    it('shows counter when Show button is clicked', async () => {
      mockStorageData[STORAGE_TOKEN_ENABLED] = false

      render(<TokenCounter />)

      await waitFor(() => {
        expect(screen.getByText('Show Token Counter')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Show Token Counter'))

      await waitFor(() => {
        expect(screen.getByText('Session Tokens')).toBeInTheDocument()
      })
      expect(mockSet).toHaveBeenCalledWith(STORAGE_TOKEN_ENABLED, true)
    })
  })

  describe('Chrome API interactions', () => {
    it('queries active tab and fetches stats on mount', async () => {
      const mockStats: TokenStats = {
        user: 100,
        assistant: 200,
        total: 300,
        lastUpdated: Date.now()
      }
      mockTabsQuery.mockImplementation((_, callback) => {
        callback([{ id: 123 }])
      })
      mockTabsSendMessage.mockImplementation((_, __, callback) => {
        callback(mockStats)
      })

      render(<TokenCounter />)

      await waitFor(() => {
        expect(mockTabsQuery).toHaveBeenCalled()
        expect(mockTabsSendMessage).toHaveBeenCalledWith(123, { type: MSG_GET_TOKENS }, expect.any(Function))
      })
    })

    it('displays stats from tab query', async () => {
      const mockStats: TokenStats = {
        user: 100,
        assistant: 200,
        total: 300,
        lastUpdated: Date.now()
      }
      mockTabsQuery.mockImplementation((_, callback) => {
        callback([{ id: 123 }])
      })
      mockTabsSendMessage.mockImplementation((_, __, callback) => {
        callback(mockStats)
      })

      render(<TokenCounter />)

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('200')).toBeInTheDocument()
        expect(screen.getByText('300')).toBeInTheDocument()
      })
    })

    it('handles missing tab ID gracefully', async () => {
      mockTabsQuery.mockImplementation((_, callback) => {
        callback([{}]) // No tab ID
      })

      render(<TokenCounter />)

      // Should not throw, just not call sendMessage
      await waitFor(() => {
        expect(mockTabsQuery).toHaveBeenCalled()
      })
      expect(mockTabsSendMessage).not.toHaveBeenCalled()
    })

    it('handles chrome runtime error gracefully', async () => {
      mockTabsQuery.mockImplementation((_, callback) => {
        callback([{ id: 123 }])
      })
      mockTabsSendMessage.mockImplementation((_, __, callback) => {
        // Simulate runtime error
        globalThis.chrome.runtime.lastError = { message: 'Tab not found' }
        callback(null)
        globalThis.chrome.runtime.lastError = null
      })

      render(<TokenCounter />)

      // Should not update stats when there's an error
      await waitFor(() => {
        const dashes = screen.getAllByText('-')
        expect(dashes.length).toBe(3)
      })
    })

    it('adds message listener on mount', () => {
      render(<TokenCounter />)

      expect(mockAddListener).toHaveBeenCalled()
    })

    it('removes message listener on unmount', () => {
      const { unmount } = render(<TokenCounter />)

      unmount()

      expect(mockRemoveListener).toHaveBeenCalled()
    })

    it('updates stats when receiving MSG_TOKEN_UPDATE message', async () => {
      mockTabsQuery.mockImplementation((_, callback) => {
        callback([])
      })

      render(<TokenCounter />)

      // Simulate receiving a message
      const newStats: TokenStats = {
        user: 500,
        assistant: 600,
        total: 1100,
        lastUpdated: Date.now()
      }

      act(() => {
        messageListeners.forEach(listener => {
          listener({ type: MSG_TOKEN_UPDATE, payload: newStats })
        })
      })

      await waitFor(() => {
        expect(screen.getByText('500')).toBeInTheDocument()
        expect(screen.getByText('600')).toBeInTheDocument()
        expect(screen.getByText('1,100')).toBeInTheDocument() // Formatted with comma
      })
    })

    it('ignores messages with wrong type', async () => {
      mockTabsQuery.mockImplementation((_, callback) => {
        callback([])
      })

      render(<TokenCounter />)

      act(() => {
        messageListeners.forEach(listener => {
          listener({ type: 'WRONG_TYPE', payload: { user: 999, assistant: 888, total: 1887 } })
        })
      })

      // Stats should remain at placeholders
      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBe(3)
    })

    it('stops fetching stats after disabled', async () => {
      mockStorageData[STORAGE_TOKEN_ENABLED] = false
      mockTabsQuery.mockImplementation((_, callback) => {
        callback([])
      })

      render(<TokenCounter />)

      // Component starts enabled, then disables after storage loads
      await waitFor(() => {
        expect(screen.getByText('Show Token Counter')).toBeInTheDocument()
      })

      // After disabled, should remove listener
      expect(mockRemoveListener).toHaveBeenCalled()
    })

    it('does not add message listener when disabled', async () => {
      mockStorageData[STORAGE_TOKEN_ENABLED] = false

      render(<TokenCounter />)

      await waitFor(() => {
        expect(screen.getByText('Show Token Counter')).toBeInTheDocument()
      })

      // Check that addListener was not called (or was called and then removed)
      // After storage loads as false, listener should not be added
      expect(mockAddListener.mock.calls.length).toBe(mockRemoveListener.mock.calls.length)
    })
  })

  describe('Number formatting', () => {
    it('formats large numbers with locale string', async () => {
      mockTabsQuery.mockImplementation((_, callback) => {
        callback([{ id: 123 }])
      })
      mockTabsSendMessage.mockImplementation((_, __, callback) => {
        callback({ user: 12345, assistant: 67890, total: 80235, lastUpdated: Date.now() })
      })

      render(<TokenCounter />)

      await waitFor(() => {
        expect(screen.getByText('12,345')).toBeInTheDocument()
        expect(screen.getByText('67,890')).toBeInTheDocument()
        expect(screen.getByText('80,235')).toBeInTheDocument()
      })
    })
  })
})
