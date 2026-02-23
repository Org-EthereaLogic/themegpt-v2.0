import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DEFAULT_THEMES, API_BASE_URL } from '@themegpt/shared'

// Hoisted mocks - must be defined before vi.mock
const { mockGet, mockSet, mockRemove, mockStorageData } = vi.hoisted(() => {
  const data: Record<string, unknown> = {}
  return {
    mockStorageData: data,
    mockGet: vi.fn((key: string) => Promise.resolve(data[key])),
    mockSet: vi.fn((key: string, value: unknown) => {
      data[key] = value
      return Promise.resolve()
    }),
    mockRemove: vi.fn((key: string) => {
      delete data[key]
      return Promise.resolve()
    })
  }
})

vi.mock('@plasmohq/storage', () => ({
  Storage: class {
    get = mockGet
    set = mockSet
    remove = mockRemove
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
    mockRemove.mockClear()

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

    it('renders Manage Account link in footer', () => {
      render(<Popup />)
      expect(screen.getByText(/Manage Account/)).toBeInTheDocument()
    })

    it('renders Sign In button when not authenticated', () => {
      render(<Popup />)
      expect(screen.getByText('Sign In')).toBeInTheDocument()
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
        const nameElements = screen.getAllByText(theme.name)
        expect(nameElements.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('Account Panel Toggle', () => {
    it('shows account panel when Sign In button is clicked', () => {
      render(<Popup />)

      fireEvent.click(screen.getByText('Sign In'))

      expect(screen.getByText('Connect Account')).toBeInTheDocument()
      expect(screen.getByText('Connect with Google/GitHub')).toBeInTheDocument()
    })

    it('hides account panel when clicked again', () => {
      render(<Popup />)

      fireEvent.click(screen.getByText('Sign In'))
      expect(screen.getByText('Connect Account')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Sign In'))
      expect(screen.queryByText('Connect Account')).not.toBeInTheDocument()
    })

    it('shows token input field with placeholder', () => {
      render(<Popup />)

      fireEvent.click(screen.getByText('Sign In'))

      expect(screen.getByPlaceholderText('Paste token...')).toBeInTheDocument()
      expect(screen.getByText('Go')).toBeInTheDocument()
    })

    it('updates token input value on change', () => {
      render(<Popup />)

      fireEvent.click(screen.getByText('Sign In'))

      const input = screen.getByPlaceholderText('Paste token...') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'test-token' } })

      expect(input.value).toBe('test-token')
    })
  })

  describe('OAuth Connection', () => {
    it('opens auth page when Connect with Google/GitHub is clicked', () => {
      render(<Popup />)

      fireEvent.click(screen.getByText('Sign In'))
      fireEvent.click(screen.getByText('Connect with Google/GitHub'))

      expect(window.open).toHaveBeenCalledWith(`${API_BASE_URL}/auth/extension?utm_source=extension&utm_medium=popup&utm_campaign=auth_flow&extension_version=unknown`, '_blank')
    })

    it('shows connecting status when token is submitted', async () => {
      mockFetch.mockImplementation(() => new Promise(() => { }))

      render(<Popup />)
      fireEvent.click(screen.getByText('Sign In'))

      const input = screen.getByPlaceholderText('Paste token...')
      fireEvent.change(input, { target: { value: 'test-token' } })
      fireEvent.click(screen.getByText('Go'))

      // "Connecting..." appears in both button and status - just check that at least one exists
      const connectingElements = await screen.findAllByText('Connecting...')
      expect(connectingElements.length).toBeGreaterThan(0)
    })

    it('shows Premium button after successful token validation', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          user: { email: 'test@example.com' },
          hasSubscription: true,
          subscription: { isActive: true, planType: 'monthly' },
          accessibleThemes: []
        })
      })

      render(<Popup />)
      fireEvent.click(screen.getByText('Sign In'))

      const input = screen.getByPlaceholderText('Paste token...')
      fireEvent.change(input, { target: { value: 'valid-token' } })
      fireEvent.click(screen.getByText('Go'))

      // After successful connection, header button changes from "Sign In" to "Premium"
      expect(await screen.findByText('Premium')).toBeInTheDocument()
    })

    it('shows error message on failed token validation', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 })

      render(<Popup />)
      fireEvent.click(screen.getByText('Sign In'))

      const input = screen.getByPlaceholderText('Paste token...')
      fireEvent.change(input, { target: { value: 'invalid-token' } })
      fireEvent.click(screen.getByText('Go'))

      expect(await screen.findByText('Invalid token. Please try again.')).toBeInTheDocument()
    })

    it('shows connection error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      render(<Popup />)
      fireEvent.click(screen.getByText('Sign In'))

      const input = screen.getByPlaceholderText('Paste token...')
      fireEvent.change(input, { target: { value: 'any-token' } })
      fireEvent.click(screen.getByText('Go'))

      expect(await screen.findByText('Connection Error')).toBeInTheDocument()
    })

    it('saves auth token to storage on successful validation', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          user: { email: 'test@example.com' },
          hasSubscription: false,
          accessibleThemes: []
        })
      })

      render(<Popup />)
      fireEvent.click(screen.getByText('Sign In'))

      const input = screen.getByPlaceholderText('Paste token...')
      fireEvent.change(input, { target: { value: 'my-token' } })
      fireEvent.click(screen.getByText('Go'))

      // Wait for Premium button to appear (indicates successful connection)
      await screen.findByText('Premium')
      expect(mockSet).toHaveBeenCalledWith('authToken', 'my-token')
    })

    it('displays subscription info when connected with active subscription', async () => {
      mockStorageData['authToken'] = 'saved-token'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          user: { email: 'test@example.com' },
          hasSubscription: true,
          subscription: { isActive: true, planType: 'monthly', creditsRemaining: 5 },
          accessibleThemes: []
        })
      })

      render(<Popup />)

      // Wait for auto-check on mount
      await waitFor(() => {
        expect(screen.getByText('Premium')).toBeInTheDocument()
      })
    })
  })

  describe('Account Disconnect', () => {
    it('shows disconnect button when connected', async () => {
      mockStorageData['authToken'] = 'saved-token'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          user: { email: 'test@example.com' },
          hasSubscription: false,
          accessibleThemes: []
        })
      })

      render(<Popup />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Open account panel
      fireEvent.click(screen.getByText('Premium'))

      expect(screen.getByText('Disconnect')).toBeInTheDocument()
    })

    it('clears auth data when disconnect is clicked', async () => {
      mockStorageData['authToken'] = 'saved-token'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          user: { email: 'test@example.com' },
          hasSubscription: false,
          accessibleThemes: []
        })
      })

      render(<Popup />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Open account panel and disconnect
      fireEvent.click(screen.getByText('Premium'))
      fireEvent.click(screen.getByText('Disconnect'))

      await waitFor(() => {
        expect(mockRemove).toHaveBeenCalledWith('authToken')
        expect(mockRemove).toHaveBeenCalledWith('unlockedThemes')
      })
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

    it('opens pricing page on first locked premium click when not subscribed', async () => {
      render(<Popup />)

      const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
      const themeCard = screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)
      fireEvent.click(themeCard)
      await waitFor(() => {
        expect(mockSet).toHaveBeenCalledWith('premiumClickCount', 1)
        expect(window.open).toHaveBeenCalledWith(`${API_BASE_URL}/?utm_source=extension&utm_medium=popup&utm_campaign=trial_teaser&extension_version=unknown#pricing`, '_blank')
      })
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

    it('downloads premium theme when subscribed with credits', async () => {
      const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
      mockStorageData['authToken'] = 'valid-token'

      // Mock status check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          user: { email: 'test@example.com' },
          hasSubscription: true,
          subscription: { isActive: true, creditsRemaining: 5 },
          accessibleThemes: []
        })
      })

      render(<Popup />)

      // Wait for status check
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Mock download endpoint
      mockFetch.mockResolvedValueOnce({ ok: true })
      // Mock subsequent status check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          accessibleThemes: [premiumTheme.id]
        })
      })

      // Click premium theme
      const themeCard = screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)
      fireEvent.click(themeCard)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/api/extension/download`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ themeId: premiumTheme.id })
          })
        )
      })
    })

    it('shows error when no credits remaining', async () => {
      const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
      mockStorageData['authToken'] = 'valid-token'

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          user: { email: 'test@example.com' },
          hasSubscription: true,
          subscription: { isActive: true, creditsRemaining: 0 },
          accessibleThemes: []
        })
      })

      render(<Popup />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      // Click premium theme
      const themeCard = screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)
      fireEvent.click(themeCard)

      expect(await screen.findByRole('alert')).toHaveTextContent(/No downloads remaining/)
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

    it('checks account status with saved token on mount', async () => {
      mockStorageData['authToken'] = 'saved-token'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          user: { email: 'test@example.com' },
          hasSubscription: false,
          accessibleThemes: []
        })
      })

      render(<Popup />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/api/extension/status`,
          expect.objectContaining({
            headers: { Authorization: 'Bearer saved-token' }
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
