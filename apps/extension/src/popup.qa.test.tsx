
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { API_BASE_URL, DEFAULT_THEMES } from '@themegpt/shared'
import Popup from './popup'

// Hoisted mocks
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

describe('QA: Extension Popup UI', () => {
    let mockFetch: ReturnType<typeof vi.fn>
    let originalOpen: typeof window.open

    beforeEach(() => {
        Object.keys(mockStorageData).forEach(key => delete mockStorageData[key])
        mockGet.mockClear()
        mockSet.mockClear()
        mockRemove.mockClear()
        mockFetch = vi.fn()
        global.fetch = mockFetch as unknown as typeof fetch
        originalOpen = window.open
        window.open = vi.fn()
    })

    afterEach(() => {
        cleanup()
        window.open = originalOpen
        vi.clearAllMocks()
    })

    const mockStatusResponse = (statusData: any) => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                user: { email: 'qa@example.com' },
                hasSubscription: true,
                subscription: statusData,
                accessibleThemes: []
            })
        })
    }

    it('displays "Lifetime Access" for lifetime users', async () => {
        mockStorageData['authToken'] = 'valid-token'
        mockStatusResponse({
            isActive: true,
            planType: 'lifetime',
            isLifetime: true,
            creditsRemaining: 9999
        })

        render(<Popup />)

        // Open account panel
        await waitFor(() => {
            const btn = screen.getByText('Lifetime')
            fireEvent.click(btn)
        })

        expect(screen.getByText('Lifetime Access')).toBeInTheDocument()
        // Should NOT show credits for lifetime
        expect(screen.queryByText(/downloads left/)).not.toBeInTheDocument()
    })

    it('displays "Yearly" for yearly subscribers', async () => {
        mockStorageData['authToken'] = 'valid-token'
        mockStatusResponse({
            isActive: true,
            planType: 'yearly',
            isLifetime: false,
            creditsRemaining: 10
        })

        render(<Popup />)

        // Open account panel
        await waitFor(() => {
            const btn = screen.getByText('Premium')
            fireEvent.click(btn)
        })

        expect(screen.getByText('Yearly')).toBeInTheDocument()
        expect(screen.getByText('10 downloads left')).toBeInTheDocument()
    })

    it('displays "Monthly" for monthly subscribers', async () => {
        mockStorageData['authToken'] = 'valid-token'
        mockStatusResponse({
            isActive: true,
            planType: 'monthly',
            isLifetime: false,
            creditsRemaining: 5
        })

        render(<Popup />)

        // Open account panel
        await waitFor(() => {
            const btn = screen.getByText('Premium')
            fireEvent.click(btn)
        })

        expect(screen.getByText('Monthly')).toBeInTheDocument()
    })

    it('shows coral badge styling for inactive subscription', async () => {
        mockStorageData['authToken'] = 'valid-token'
        mockStatusResponse({
            isActive: false,
            planType: 'monthly',
            isLifetime: false,
            creditsRemaining: 0
        })

        render(<Popup />)

        await waitFor(() => {
            const btn = screen.getByText('Premium')
            fireEvent.click(btn)
        })

        expect(screen.getByText('Monthly')).toBeInTheDocument()
        // Credits should NOT show when subscription is inactive
        expect(screen.queryByText(/downloads left/)).not.toBeInTheDocument()
    })

    it('shows "Start free 30-day trial" CTA for free users with no subscription', async () => {
        mockStorageData['authToken'] = 'valid-token'
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                user: { email: 'free@example.com' },
                hasSubscription: false,
                subscription: null,
                accessibleThemes: []
            })
        })

        render(<Popup />)

        await waitFor(() => {
            const btn = screen.getByText('Premium')
            fireEvent.click(btn)
        })

        expect(screen.getByText('Start free 30-day trial')).toBeInTheDocument()
    })

    it('shows "0 downloads left" when credits are zero', async () => {
        mockStorageData['authToken'] = 'valid-token'
        mockStatusResponse({
            isActive: true,
            planType: 'yearly',
            isLifetime: false,
            creditsRemaining: 0
        })

        render(<Popup />)

        await waitFor(() => {
            const btn = screen.getByText('Premium')
            fireEvent.click(btn)
        })

        expect(screen.getByText('0 downloads left')).toBeInTheDocument()
    })

    it('shows "Sign In" button when not authenticated', async () => {
        // No authToken set — user is disconnected
        render(<Popup />)

        await waitFor(() => {
            const btn = screen.getByText('Sign In')
            fireEvent.click(btn)
        })

        expect(screen.getByText('Connect Account')).toBeInTheDocument()
        expect(screen.getByText(/Connect with Google/)).toBeInTheDocument()
    })

    // --- NEW QA TESTS: Monetization State Coverage ---

    it('displays "Trial" header button, "Trial Active" badge, and days remaining for trialing users', async () => {
        mockStorageData['authToken'] = 'valid-token'
        // Set trial end 15 days from now
        const trialEnd = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        mockStatusResponse({
            isActive: true,
            planType: 'monthly',
            isLifetime: false,
            status: 'trialing',
            trialEndsAt: trialEnd,
            creditsRemaining: 10
        })

        render(<Popup />)

        // Header should show "Trial" button
        await waitFor(() => {
            expect(screen.getByText('Trial')).toBeInTheDocument()
        })

        // Open account panel
        fireEvent.click(screen.getByText('Trial'))

        // Should show "Trial Active" badge
        expect(screen.getByText('Trial Active')).toBeInTheDocument()

        // Should show days remaining (approximately 15 days)
        expect(screen.getByText(/\d+ days left in trial/)).toBeInTheDocument()
    })

    it('shows reactivation message for canceled subscription', async () => {
        mockStorageData['authToken'] = 'valid-token'
        mockStatusResponse({
            isActive: false,
            planType: 'monthly',
            isLifetime: false,
            status: 'canceled',
            creditsRemaining: 0
        })

        render(<Popup />)

        await waitFor(() => {
            const btn = screen.getByText('Premium')
            fireEvent.click(btn)
        })

        expect(screen.getByText(/Your subscription has ended/)).toBeInTheDocument()
        expect(screen.getByText(/Reactivate to restore access/)).toBeInTheDocument()

        // Verify the reactivation link points to account with UTM
        const reactivateLink = screen.getByText(/Reactivate to restore access/).closest('a')
        expect(reactivateLink?.getAttribute('href')).toContain('utm_source=extension')
        expect(reactivateLink?.getAttribute('href')).toContain('utm_campaign=account_management')
    })

    it('shows billing failure message for past_due subscription', async () => {
        mockStorageData['authToken'] = 'valid-token'
        mockStatusResponse({
            isActive: false,
            planType: 'monthly',
            isLifetime: false,
            status: 'past_due',
            creditsRemaining: 0
        })

        render(<Popup />)

        await waitFor(() => {
            const btn = screen.getByText('Premium')
            fireEvent.click(btn)
        })

        expect(screen.getByText(/Payment failed/)).toBeInTheDocument()
        expect(screen.getByText(/Update your billing details/)).toBeInTheDocument()

        // Verify the billing link has coral styling (className check)
        const billingLink = screen.getByText(/Update your billing details/).closest('a')
        expect(billingLink?.className).toContain('text-coral')
        expect(billingLink?.getAttribute('href')).toContain('utm_source=extension')
    })

    it('shows escalating lifecycle nudge on premium theme clicks (3-step)', async () => {
        render(<Popup />)

        const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
        const themeCard = screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)

        // Click 1: soft CTA, no redirect
        fireEvent.click(themeCard)
        await waitFor(() => {
            expect(screen.getByText(/premium theme/i)).toBeInTheDocument()
        })
        expect(window.open).not.toHaveBeenCalled()

        // Click 2: stronger CTA + redirect to pricing
        fireEvent.click(themeCard)
        await waitFor(() => {
            expect(window.open).toHaveBeenCalledTimes(1)
            expect(window.open).toHaveBeenCalledWith(
                expect.stringContaining('utm_campaign=trial_teaser'),
                '_blank'
            )
        })

        // Click 3: persistent CTA + redirect
        fireEvent.click(themeCard)
        await waitFor(() => {
            expect(screen.getByText(/keep coming back/i)).toBeInTheDocument()
            expect(window.open).toHaveBeenCalledTimes(2)
        })
    })

    it('shows review ask banner on 3rd successful theme apply and dismisses permanently', async () => {
        const premiumTheme = DEFAULT_THEMES.find(t => t.isPremium)!
        mockStorageData['authToken'] = 'valid-token'
        // Simulate 2 prior applies
        mockStorageData['themeApplyCount'] = 2

        // Mock status: active subscriber
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
        await waitFor(() => { expect(mockFetch).toHaveBeenCalled() })

        // Mock download success + subsequent status check
        mockFetch.mockResolvedValueOnce({ ok: true })
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                success: true,
                accessibleThemes: [premiumTheme.id]
            })
        })

        // Click premium theme (3rd apply)
        const themeCard = screen.getByLabelText(`${premiumTheme.name} - Premium, click to unlock`)
        fireEvent.click(themeCard)

        // Review ask banner should appear
        await waitFor(() => {
            expect(screen.getByText(/Loving ThemeGPT/)).toBeInTheDocument()
        })

        // Verify CWS review link
        const reviewLink = screen.getByText('Leave a review')
        expect(reviewLink.getAttribute('href')).toContain('chromewebstore.google.com')

        // Dismiss — verify storage flag is set
        fireEvent.click(screen.getByText('Maybe later'))
        await waitFor(() => {
            expect(mockSet).toHaveBeenCalledWith('reviewAskDismissed', true)
        })
        expect(screen.queryByText(/Loving ThemeGPT/)).not.toBeInTheDocument()
    })

    it('renders Manage Account footer link with correct UTM parameters', async () => {
        render(<Popup />)

        const footerLink = screen.getByText('Manage Account').closest('a')
        expect(footerLink).toBeTruthy()

        const href = footerLink!.getAttribute('href')!
        expect(href).toContain(`${API_BASE_URL}/account`)
        expect(href).toContain('utm_source=extension')
        expect(href).toContain('utm_medium=popup')
        expect(href).toContain('utm_campaign=account_management')
        expect(href).toContain('extension_version=')
    })
})
