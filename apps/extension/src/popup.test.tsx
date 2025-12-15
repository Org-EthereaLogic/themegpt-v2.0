import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DEFAULT_THEMES, type VerifyResponse, API_BASE_URL } from '@themegpt/shared'

// Hoisted mocks - must be defined before vi.mock
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
import Popup from './popup'

describe('Popup', () => {
  let mockFetch: ReturnType<typeof vi.fn>
  let originalOpen: typeof window.open

  beforeEach(() => {
    // Reset storage data
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key])
    mockGet.mockClear()
    mockSet.mockClear()

    // Mock fetch
    mockFetch = vi.fn()
    global.fetch = mockFetch as unknown as typeof fetch

    // Mock window.open
    originalOpen = window.open
    window.open = vi.fn()
  })

  afterEach(() => {
    cleanup()
    window.open = originalOpen
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders header with ThemeGPT branding', () => {
      render(<Popup />)
      expect(screen.getByText('ThemeGPT')).toBeInTheDocument()
    })

    it('renders Free Collection section', () => {
      render(<Popup />)
      expect(screen.getByText('Free Collection')).toBeInTheDocument()
    })

    it('renders Premium Collection section', () => {
      render(<Popup />)
      expect(screen.getByText('Premium Collection')).toBeInTheDocument()
    })

    it('renders subscription link in footer', () => {
      render(<Popup />)
      expect(screen.getByText(/manage subscription/i)).toBeInTheDocument()
    })

    it('renders activate button when no license', () => {
      render(<Popup />)
      expect(screen.getByText('Activate')).toBeInTheDocument()
    })

    it('renders Free Collection section with theme count badge', () => {
      render(<Popup />)
      const freeSection = screen.getByText('Free Collection').parentElement
      const freeThemeCount = DEFAULT_THEMES.filter(t => !t.isPremium).length
      expect(freeSection?.textContent).toContain(freeThemeCount.toString())
    })

    it('renders Premium Collection section with theme count badge', () => {
      render(<Popup />)
      const premiumSection = screen.getByText('Premium Collection').parentElement
      const premiumThemeCount = DEFAULT_THEMES.filter(t => t.isPremium).length
      expect(premiumSection?.textContent).toContain(premiumThemeCount.toString())
    })

    it('renders theme cards with names', () => {
      render(<Popup />)
      DEFAULT_THEMES.forEach(theme => {
        expect(screen.getByText(theme.name)).toBeInTheDocument()
      })
    })
  })

  describe('License Input Toggle', () => {
    it('shows license input when Activate button is clicked', () => {
      render(<Popup />)

      fireEvent.click(screen.getByText('Activate'))

      expect(screen.getByText('License Key')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter key...')).toBeInTheDocument()
      expect(screen.getByText('Verify')).toBeInTheDocument()
    })

    it('hides license input when clicked again', () => {
      render(<Popup />)

      fireEvent.click(screen.getByText('Activate'))
      expect(screen.getByText('License Key')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Activate'))
      expect(screen.queryByText('License Key')).not.toBeInTheDocument()
    })

    it('updates license key input value on change', () => {
      render(<Popup />)

      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'test-license-key' } })

      expect(input.value).toBe('test-license-key')
    })
  })

  describe('License Validation', () => {
    it('shows validating status when verify is clicked', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}))

      render(<Popup />)
      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'test-key' } })
      fireEvent.click(screen.getByText('Verify'))

      expect(await screen.findByText('Validating...')).toBeInTheDocument()
    })

    it('shows License Active on successful validation', async () => {
      const mockResponse: VerifyResponse = {
        valid: true,
        entitlement: {
          active: true,
          type: 'subscription',
          maxSlots: 3,
          permanentlyUnlocked: [],
          activeSlotThemes: []
        }
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      render(<Popup />)
      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'valid-key' } })
      fireEvent.click(screen.getByText('Verify'))

      expect(await screen.findByText('License Active ✅')).toBeInTheDocument()
    })

    it('shows Premium button when license is valid', async () => {
      const mockResponse: VerifyResponse = {
        valid: true,
        entitlement: {
          active: true,
          type: 'subscription',
          maxSlots: 3,
          permanentlyUnlocked: [],
          activeSlotThemes: []
        }
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      render(<Popup />)
      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'valid-key' } })
      fireEvent.click(screen.getByText('Verify'))

      expect(await screen.findByText('Premium')).toBeInTheDocument()
    })

    it('shows error message on failed validation', async () => {
      mockFetch.mockResolvedValue({ ok: false })

      render(<Popup />)
      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'invalid-key' } })
      fireEvent.click(screen.getByText('Verify'))

      expect(await screen.findByText('Validation failed. Try again.')).toBeInTheDocument()
    })

    it('shows connection error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      render(<Popup />)
      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'any-key' } })
      fireEvent.click(screen.getByText('Verify'))

      expect(await screen.findByText('Connection Error')).toBeInTheDocument()
    })

    it('shows error when API returns invalid license', async () => {
      const mockResponse: VerifyResponse = {
        valid: false,
        message: 'License expired'
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      render(<Popup />)
      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'expired-key' } })
      fireEvent.click(screen.getByText('Verify'))

      expect(await screen.findByText('Error: License expired')).toBeInTheDocument()
    })

    it('saves license key to storage on successful validation', async () => {
      const mockResponse: VerifyResponse = {
        valid: true,
        entitlement: {
          active: true,
          type: 'subscription',
          maxSlots: 3,
          permanentlyUnlocked: [],
          activeSlotThemes: []
        }
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      render(<Popup />)
      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'my-key' } })
      fireEvent.click(screen.getByText('Verify'))

      await screen.findByText('License Active ✅')
      expect(mockSet).toHaveBeenCalledWith('licenseKey', 'my-key')
    })

    it('displays slot usage for subscription license', async () => {
      const mockResponse: VerifyResponse = {
        valid: true,
        entitlement: {
          active: true,
          type: 'subscription',
          maxSlots: 3,
          permanentlyUnlocked: [],
          activeSlotThemes: ['theme-1']
        }
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      render(<Popup />)
      fireEvent.click(screen.getByText('Activate'))

      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'sub-key' } })
      fireEvent.click(screen.getByText('Verify'))

      expect(await screen.findByText(/Slots Used: 1 \/ 3/)).toBeInTheDocument()
    })
  })

  describe('Theme Selection', () => {
    it('applies free theme when clicked', async () => {
      render(<Popup />)

      const freeTheme = DEFAULT_THEMES.find(t => !t.isPremium)!
      const themeCard = screen.getByLabelText(`Apply ${freeTheme.name} theme`)
      fireEvent.click(themeCard)

      await waitFor(() => {
        expect(mockSet).toHaveBeenCalledWith('activeTheme', freeTheme)
      })
    })

    it('opens buy page for locked premium theme', () => {
      render(<Popup />)

      const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
      const themeCard = screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)
      fireEvent.click(themeCard)

      expect(window.open).toHaveBeenCalledWith(
        `https://themegpt.ai/themes/${premiumTheme.id}`,
        '_blank'
      )
    })

    it('applies unlocked premium theme', async () => {
      const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
      mockStorageData['unlockedThemes'] = [premiumTheme.id]

      render(<Popup />)

      // Wait for storage to be loaded
      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('unlockedThemes')
      })

      // Theme should be unlocked
      const themeCard = await screen.findByLabelText(`Apply ${premiumTheme.name} theme`)
      expect(themeCard).toBeInTheDocument()
    })

    it('activates theme in subscription slot when available', async () => {
      const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
      const mockResponse: VerifyResponse = {
        valid: true,
        entitlement: {
          active: true,
          type: 'subscription',
          maxSlots: 3,
          permanentlyUnlocked: [],
          activeSlotThemes: []
        }
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      render(<Popup />)

      // Validate license
      fireEvent.click(screen.getByText('Activate'))
      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'sub-key' } })
      fireEvent.click(screen.getByText('Verify'))

      await screen.findByText('License Active ✅')

      // Click premium theme - should use slot
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
      const themeCard = screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)
      fireEvent.click(themeCard)

      await waitFor(() => {
        expect(mockSet).toHaveBeenCalledWith('activeTheme', premiumTheme)
      })
    })

    it('shows slot error when subscription limit reached', async () => {
      const premiumThemes = DEFAULT_THEMES.filter(t => t.isPremium)
      const mockResponse: VerifyResponse = {
        valid: true,
        entitlement: {
          active: true,
          type: 'subscription',
          maxSlots: 2,
          permanentlyUnlocked: [],
          activeSlotThemes: [premiumThemes[0].id, premiumThemes[1].id]
        }
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      render(<Popup />)

      // Validate license
      fireEvent.click(screen.getByText('Activate'))
      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'sub-key' } })
      fireEvent.click(screen.getByText('Verify'))

      await screen.findByText('License Active ✅')

      // Try to activate a third theme
      const thirdPremiumTheme = premiumThemes[2]
      const themeCard = screen.getByText(thirdPremiumTheme.name).closest('button')!
      fireEvent.click(themeCard)

      expect(await screen.findByRole('alert')).toHaveTextContent(/Subscription limit reached/)
    })

    it('syncs slot changes to server', async () => {
      const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
      const mockResponse: VerifyResponse = {
        valid: true,
        entitlement: {
          active: true,
          type: 'subscription',
          maxSlots: 3,
          permanentlyUnlocked: [],
          activeSlotThemes: []
        }
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      render(<Popup />)

      // Validate license
      fireEvent.click(screen.getByText('Activate'))
      const input = screen.getByPlaceholderText('Enter key...')
      fireEvent.change(input, { target: { value: 'sub-key' } })
      fireEvent.click(screen.getByText('Verify'))

      await screen.findByText('License Active ✅')

      mockFetch.mockClear()
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })

      // Click premium theme
      const themeCard = screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)
      fireEvent.click(themeCard)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/api/sync`,
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining(premiumTheme.id)
          })
        )
      })
    })
  })

  describe('Initial State Loading', () => {
    it('loads active theme from storage on mount', () => {
      render(<Popup />)
      expect(mockGet).toHaveBeenCalledWith('activeTheme')
    })

    it('loads unlocked themes from storage on mount', () => {
      render(<Popup />)
      expect(mockGet).toHaveBeenCalledWith('unlockedThemes')
    })

    it('validates saved license key on mount', async () => {
      mockStorageData['licenseKey'] = 'saved-key'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          valid: true,
          entitlement: {
            active: true,
            type: 'subscription',
            maxSlots: 3,
            permanentlyUnlocked: [],
            activeSlotThemes: []
          }
        })
      })

      render(<Popup />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/api/verify`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ licenseKey: 'saved-key' })
          })
        )
      })
    })
  })

  describe('ThemeCard Accessibility', () => {
    it('has correct aria-label for free themes', () => {
      render(<Popup />)

      const freeTheme = DEFAULT_THEMES.find(t => !t.isPremium)!
      expect(screen.getByLabelText(`Apply ${freeTheme.name} theme`)).toBeInTheDocument()
    })

    it('has correct aria-label for locked premium themes', () => {
      render(<Popup />)

      const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
      expect(screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)).toBeInTheDocument()
    })

    it('shows Pro badge on locked premium themes', () => {
      render(<Popup />)

      const proBadges = screen.getAllByText('Pro')
      const premiumCount = DEFAULT_THEMES.filter(t => t.isPremium).length
      expect(proBadges.length).toBe(premiumCount)
    })
  })
})
