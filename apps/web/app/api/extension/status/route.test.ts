
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

// Mock dependencies
vi.mock('next/server', async () => {
    const actual = await vi.importActual('next/server');
    return {
        ...actual,
        NextResponse: {
            json: (body: any, init?: any) => {
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
    },
}));

vi.mock('@/lib/credits', () => ({
    hasFullAccess: vi.fn((sub) => {
        // Simple mock: if it has planType='lifetime' or isLifetime=true, return true
        // or if status=active
        return sub?.status === 'active' || sub?.isLifetime === true;
    }),
}));

vi.mock('jose', () => ({
    jwtVerify: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn().mockReturnValue(null),
    RATE_LIMITS: { sync: {} },
}));

describe('Extension Status Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.EXTENSION_JWT_SECRET = 'test-secret';
    });

    const createRequest = (token?: string) => {
        const headers = new Headers();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return new NextRequest('http://localhost/api/extension/status', {
            headers,
        });
    };

    it('returns 401 if token is missing', async () => {
        const req = createRequest();
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it('returns 401 if token is invalid', async () => {
        (jwtVerify as any).mockRejectedValue(new Error('Invalid token'));

        const req = createRequest('invalid-token');
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it('returns correct status for active yearly subscription', async () => {
        (jwtVerify as any).mockResolvedValue({
            payload: { userId: 'user-123', email: 'test@example.com' },
        });

        const mockSubscription = {
            id: 'sub-1',
            status: 'active',
            planType: 'yearly',
            isLifetime: false,
            currentPeriodEnd: new Date(Date.now() + 10000),
            trialEndsAt: null,
        };

        (db.getSubscriptionByUserId as any).mockResolvedValue(mockSubscription);

        const req = createRequest('valid-token');
        const res = await GET(req);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.hasSubscription).toBe(true);
        expect(body.subscription.planType).toBe('yearly');
        expect(body.subscription.isLifetime).toBe(false);
        expect(body.accessibleThemes.length).toBeGreaterThan(0);
    });

    it('returns correct status for LIFETIME subscription', async () => {
        (jwtVerify as any).mockResolvedValue({
            payload: { userId: 'user-life', email: 'life@example.com' },
        });

        const mockSubscription = {
            id: 'sub-life',
            status: 'active',
            planType: 'lifetime',
            isLifetime: true,
            currentPeriodEnd: new Date('2099-12-31'),
            trialEndsAt: null,
        };

        (db.getSubscriptionByUserId as any).mockResolvedValue(mockSubscription);

        const req = createRequest('valid-token');
        const res = await GET(req);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.hasSubscription).toBe(true);
        expect(body.subscription.planType).toBe('lifetime');
        expect(body.subscription.isLifetime).toBe(true);
        // Lifetime should have full access
        expect(body.subscription.hasFullAccess).toBe(true);
        expect(body.accessibleThemes.length).toBeGreaterThan(0);
    });

    it('returns correct status for expired subscription', async () => {
        (jwtVerify as any).mockResolvedValue({
            payload: { userId: 'user-expired', email: 'expired@example.com' },
        });

        const mockSubscription = {
            id: 'sub-expired',
            status: 'canceled',
            planType: 'monthly',
            isLifetime: false,
            currentPeriodEnd: new Date(Date.now() - 10000), // Past
            trialEndsAt: null,
        };

        (db.getSubscriptionByUserId as any).mockResolvedValue(mockSubscription);

        const req = createRequest('valid-token');
        const res = await GET(req);
        const body = await res.json();

        expect(body.success).toBe(true);
        // hasSubscription check in route depends on hasFullAccess
        // for expired sub, hasFullAccess will be false
        expect(body.subscription.hasFullAccess).toBe(false);
        expect(body.accessibleThemes).toEqual([]);
    });

    it('returns correct status for Internal User override', async () => {
        (jwtVerify as any).mockResolvedValue({
            payload: { userId: 'user-internal', email: 'admin@etherealogic.ai' },
        });

        // No DB subscription
        (db.getSubscriptionByUserId as any).mockResolvedValue(null);

        const req = createRequest('valid-token');
        const res = await GET(req);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.hasSubscription).toBe(true);
        // Internal override mocks a lifetime subscription
        expect(body.subscription.planType).toBe('lifetime');
        expect(body.subscription.isLifetime).toBe(true);
        expect(body.subscription.hasFullAccess).toBe(true);
    });
});
