import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  STORAGE_TOKEN_ENABLED,
  STORAGE_TOKEN_DISPLAY_MODE,
  STORAGE_TOKEN_CANVAS_PLACEMENT,
  MSG_GET_TOKENS,
  MSG_TOKEN_UPDATE,
  MSG_TOKEN_SETTINGS_UPDATE,
  type TokenStats
} from '@themegpt/shared'

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

import { TokenCounter } from './TokenCounter'

describe('TokenCounter', () => {
  let mockTabsQuery: ReturnType<typeof vi.fn>
  let mockTabsSendMessage: ReturnType<typeof vi.fn>
  let mockAddListener: ReturnType<typeof vi.fn>
  let mockRemoveListener: ReturnType<typeof vi.fn>
  let messageListeners: ((message: unknown) => void)[] = []

  beforeEach(() => {
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key])
    mockGet.mockClear()
    mockSet.mockClear()
    messageListeners = []

    mockTabsQuery = vi.fn((_, callback) => callback([]))
    mockTabsSendMessage = vi.fn((_, __, callback) => callback?.())
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
          id: 'test-extension-id',
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

  describe('Rendering', () => {
    it('renders session token stats and privacy note', () => {
      render(<TokenCounter />)

      expect(screen.getByText('Session Tokens')).toBeInTheDocument()
      expect(screen.getByText('Input')).toBeInTheDocument()
      expect(screen.getByText('Output')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getByText(/no data leaves your browser/i)).toBeInTheDocument()
    })

    it('renders a single canvas selector with Off, Side Top, and Compose Right', () => {
      render(<TokenCounter />)

      const canvasSelector = screen.getByLabelText('Canvas') as HTMLSelectElement
      expect(canvasSelector).toBeInTheDocument()
      expect(screen.queryByLabelText('Display')).not.toBeInTheDocument()
      expect(screen.queryByText('Hide')).not.toBeInTheDocument()
      expect(screen.queryByText('Show Token Counter')).not.toBeInTheDocument()

      const optionLabels = Array.from(canvasSelector.options).map(option => option.text)
      expect(optionLabels).toEqual(['Off', 'Side Top', 'Compose Right'])
    })

    it('keeps session token stats visible when canvas is off', async () => {
      mockStorageData[STORAGE_TOKEN_ENABLED] = false

      render(<TokenCounter />)

      await waitFor(() => {
        expect((screen.getByLabelText('Canvas') as HTMLSelectElement).value).toBe('off')
      })

      expect(screen.getByText('Input')).toBeInTheDocument()
      expect(screen.getByText('Output')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('maps legacy popup display mode to Off when enabled flag is missing', async () => {
      mockStorageData[STORAGE_TOKEN_DISPLAY_MODE] = 'popup'

      render(<TokenCounter />)

      await waitFor(() => {
        expect((screen.getByLabelText('Canvas') as HTMLSelectElement).value).toBe('off')
      })
    })
  })

  describe('Canvas selector behavior', () => {
    it('selecting Off persists disabled canvas state and notifies tab', async () => {
      mockTabsQuery.mockImplementation((_, callback) => callback([{ id: 123 }]))

      render(<TokenCounter />)

      fireEvent.change(screen.getByLabelText('Canvas'), {
        target: { value: 'off' }
      })

      await waitFor(() => {
        expect(mockSet).toHaveBeenCalledWith(STORAGE_TOKEN_ENABLED, false)
        expect(mockTabsSendMessage).toHaveBeenCalledWith(
          123,
          { type: MSG_TOKEN_SETTINGS_UPDATE, payload: { enabled: false } },
          expect.any(Function)
        )
      })
    })

    it('selecting Side Top stores enabled and sidebar placement', async () => {
      mockStorageData[STORAGE_TOKEN_ENABLED] = false
      mockTabsQuery.mockImplementation((_, callback) => callback([{ id: 123 }]))

      render(<TokenCounter />)

      fireEvent.change(screen.getByLabelText('Canvas'), {
        target: { value: 'sidebar-top' }
      })

      await waitFor(() => {
        expect(mockSet).toHaveBeenCalledWith(STORAGE_TOKEN_ENABLED, true)
        expect(mockSet).toHaveBeenCalledWith(STORAGE_TOKEN_CANVAS_PLACEMENT, 'sidebar-top')
        expect(mockTabsSendMessage).toHaveBeenCalledWith(
          123,
          {
            type: MSG_TOKEN_SETTINGS_UPDATE,
            payload: { enabled: true, placement: 'sidebar-top' }
          },
          expect.any(Function)
        )
      })
    })

    it('selecting Compose Right stores enabled and compose-right placement', async () => {
      mockTabsQuery.mockImplementation((_, callback) => callback([{ id: 123 }]))

      render(<TokenCounter />)

      fireEvent.change(screen.getByLabelText('Canvas'), {
        target: { value: 'composer-right' }
      })

      await waitFor(() => {
        expect(mockSet).toHaveBeenCalledWith(STORAGE_TOKEN_ENABLED, true)
        expect(mockSet).toHaveBeenCalledWith(STORAGE_TOKEN_CANVAS_PLACEMENT, 'composer-right')
        expect(mockTabsSendMessage).toHaveBeenCalledWith(
          123,
          {
            type: MSG_TOKEN_SETTINGS_UPDATE,
            payload: { enabled: true, placement: 'composer-right' }
          },
          expect.any(Function)
        )
      })
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

      mockTabsQuery.mockImplementation((_, callback) => callback([{ id: 123 }]))
      mockTabsSendMessage.mockImplementation((_, message, callback) => {
        if ((message as { type?: string }).type === MSG_GET_TOKENS) {
          callback(mockStats)
          return
        }
        callback?.()
      })

      render(<TokenCounter />)

      await waitFor(() => {
        expect(mockTabsSendMessage).toHaveBeenCalledWith(
          123,
          { type: MSG_GET_TOKENS },
          expect.any(Function)
        )
      })
    })

    it('displays stats from tab query', async () => {
      const mockStats: TokenStats = {
        user: 12345,
        assistant: 67890,
        total: 80235,
        lastUpdated: Date.now()
      }

      mockTabsQuery.mockImplementation((_, callback) => callback([{ id: 123 }]))
      mockTabsSendMessage.mockImplementation((_, message, callback) => {
        if ((message as { type?: string }).type === MSG_GET_TOKENS) {
          callback(mockStats)
          return
        }
        callback?.()
      })

      render(<TokenCounter />)

      await waitFor(() => {
        expect(screen.getByText('12,345')).toBeInTheDocument()
        expect(screen.getByText('67,890')).toBeInTheDocument()
        expect(screen.getByText('80,235')).toBeInTheDocument()
      })
    })

    it('updates stats when receiving MSG_TOKEN_UPDATE', async () => {
      render(<TokenCounter />)

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
        expect(screen.getByText('1,100')).toBeInTheDocument()
      })
    })

    it('handles missing tab ID gracefully', async () => {
      mockTabsQuery.mockImplementation((_, callback) => callback([{}]))

      render(<TokenCounter />)

      await waitFor(() => {
        expect(mockTabsQuery).toHaveBeenCalled()
      })
      expect(mockTabsSendMessage).not.toHaveBeenCalledWith(
        expect.any(Number),
        { type: MSG_GET_TOKENS },
        expect.any(Function)
      )
    })

    it('handles chrome runtime error gracefully', async () => {
      mockTabsQuery.mockImplementation((_, callback) => callback([{ id: 123 }]))
      mockTabsSendMessage.mockImplementation((_, __, callback) => {
        Object.defineProperty(globalThis.chrome.runtime, 'lastError', {
          value: { message: 'Tab not found' },
          configurable: true
        })
        callback(null)
        Object.defineProperty(globalThis.chrome.runtime, 'lastError', {
          value: null,
          configurable: true
        })
      })

      render(<TokenCounter />)

      await waitFor(() => {
        const dashes = screen.getAllByText('-')
        expect(dashes.length).toBe(3)
      })
    })

    it('adds message listener on mount and removes it on unmount', () => {
      const { unmount } = render(<TokenCounter />)

      expect(mockAddListener).toHaveBeenCalled()
      unmount()
      expect(mockRemoveListener).toHaveBeenCalled()
    })
  })
})
