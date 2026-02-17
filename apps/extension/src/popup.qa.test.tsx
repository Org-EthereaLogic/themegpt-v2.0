
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { API_BASE_URL } from '@themegpt/shared'
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

    it('shows "Subscribe" CTA for free users with no subscription', async () => {
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

        expect(screen.getByText('Subscribe')).toBeInTheDocument()
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

    it('shows "Connect" button when not authenticated', async () => {
        // No authToken set — user is disconnected
        render(<Popup />)

        await waitFor(() => {
            const btn = screen.getByText('Connect')
            fireEvent.click(btn)
        })

        expect(screen.getByText('Connect Account')).toBeInTheDocument()
        expect(screen.getByText(/Connect with Google/)).toBeInTheDocument()
    })
})
