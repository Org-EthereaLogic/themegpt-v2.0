
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';

type MockResponseInit = {
    status?: number;
    headers?: Record<string, string>;
};

// Mock dependencies
vi.mock('next/server', async () => {
    const actual = await vi.importActual('next/server');
    return {
        ...actual,
        NextResponse: {
            json: (body: unknown, init?: MockResponseInit) => {
                return {
                    json: async () => body,
                    status: init?.status || 200,
                    headers: new Map(Object.entries(init?.headers || {})),
                };
            },
        },
    };
});

vi.mock('@/lib/db', () => ({
    db: {
        getSubscriptionByUserId: vi.fn(),
        upsertSubscriptionByStripeId: vi.fn(),
    },
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn().mockReturnValue(null),
    RATE_LIMITS: { auth: {} },
}));

// Mock Stripe
const mockStripe = {
    customers: {
        list: vi.fn(),
    },
    subscriptions: {
        list: vi.fn(),
    },
};

vi.mock('@/lib/stripe', () => ({
    getStripe: () => mockStripe,
}));

// Mock Jose SignJWT
vi.mock('jose', () => ({
    SignJWT: class {
        setProtectedHeader() { return this; }
        setIssuedAt() { return this; }
        setExpirationTime() { return this; }
        sign() { return Promise.resolve('mock.jwt.token'); }
    }
}));

const mockGetServerSession = vi.mocked(getServerSession);
const mockGetSubscriptionByUserId = vi.mocked(db.getSubscriptionByUserId);

describe('Extension Auth Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.EXTENSION_JWT_SECRET = 'test-secret';
    });

    const createRequest = () => {
        return new NextRequest('http://localhost/api/extension/auth', {
            method: 'POST',
        });
    };

    it('returns 401 if not authenticated', async () => {
        mockGetServerSession.mockResolvedValue(null);

        const req = createRequest();
        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it('returns token if already subscribed (skip Stripe link)', async () => {
        mockGetServerSession.mockResolvedValue({
            user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        } as Awaited<ReturnType<typeof getServerSession>>);

        mockGetSubscriptionByUserId.mockResolvedValue({ id: 'sub-1' } as Awaited<ReturnType<typeof db.getSubscriptionByUserId>>);

        const req = createRequest();
        const res = await POST(req);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.token).toBe('mock.jwt.token');
        // Should NOT have called Stripe
        expect(mockStripe.customers.list).not.toHaveBeenCalled();
    });

    it('links Stripe subscription with LIFETIME metadata correctly', async () => {
        mockGetServerSession.mockResolvedValue({
            user: { id: 'user-life', email: 'life@example.com', name: 'Life User' },
        } as Awaited<ReturnType<typeof getServerSession>>);

        // No existing DB subscription
        mockGetSubscriptionByUserId.mockResolvedValue(null);

        // Mock Stripe Customer
        mockStripe.customers.list.mockResolvedValue({
            data: [{ id: 'cus_123', email: 'life@example.com' }],
        });

        // Mock Stripe Subscription with Lifetime Metadata
        mockStripe.subscriptions.list.mockResolvedValue({
            data: [{
                id: 'sub_stripe_life',
                status: 'active',
                metadata: { isLifetime: 'true', planType: 'lifetime' },
                items: {
                    data: [{
                        price: { recurring: { interval: 'year' } },
                        current_period_start: 1000,
                        current_period_end: 2000,
                    }],
                },
            }],
        });

        const req = createRequest();
        const res = await POST(req);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.token).toBe('mock.jwt.token');

        // Verify upsertSubscriptionByStripeId was called with isLifetime: true
        expect(db.upsertSubscriptionByStripeId).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'user-life',
            stripeSubscriptionId: 'sub_stripe_life',
            isLifetime: true,
            planType: 'lifetime',
        }));
    });

    it('links Stripe subscription with YEARLY metadata (standard) correctly', async () => {
        mockGetServerSession.mockResolvedValue({
            user: { id: 'user-year', email: 'year@example.com', name: 'Year User' },
        } as Awaited<ReturnType<typeof getServerSession>>);

        mockGetSubscriptionByUserId.mockResolvedValue(null);

        mockStripe.customers.list.mockResolvedValue({
            data: [{ id: 'cus_456', email: 'year@example.com' }],
        });

        mockStripe.subscriptions.list.mockResolvedValue({
            data: [{
                id: 'sub_stripe_year',
                status: 'active',
                metadata: { planType: 'yearly' }, // NO isLifetime
                items: {
                    data: [{
                        price: { recurring: { interval: 'year' } },
                        current_period_start: 1000,
                        current_period_end: 2000,
                    }],
                },
            }],
        });

        const req = createRequest();
        await POST(req);

        // Verify upsertSubscriptionByStripeId was called WITHOUT isLifetime
        expect(db.upsertSubscriptionByStripeId).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'user-year',
            stripeSubscriptionId: 'sub_stripe_year',
            isLifetime: false,
            planType: 'yearly',
        }));
    });
});
