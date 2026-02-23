
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from './db';

// Hoist mocks so they are available to vi.mock
const mocks = vi.hoisted(() => {
    const get = vi.fn();
    const set = vi.fn();
    const update = vi.fn();
    const runTransaction = vi.fn();

    // Recursive mock for collection().doc()...
    const collection = vi.fn(() => ({
        doc: vi.fn(() => ({
            get,
            set,
            update,
        })),
        add: vi.fn(),
        where: vi.fn(() => ({
            get,
            limit: vi.fn(() => ({
                get,
            })),
            orderBy: vi.fn(() => ({
                limit: vi.fn(() => ({
                    get,
                }))
            }))
        })),
    }));

    const firestore = {
        collection,
        runTransaction,
    };

    return {
        get,
        set,
        update,
        runTransaction,
        collection,
        firestore,
    };
});

// Mock firebase-admin
vi.mock('./firebase-admin', () => ({
    db: mocks.firestore,
    getDb: () => mocks.firestore,
}));

describe('QA: Monetization Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Early Adopter Program', () => {
        it('isEarlyAdopterEligible returns true when slots available', async () => {
            // Mock getEarlyAdopterProgram return
            mocks.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    isActive: true,
                    usedSlots: 59,
                    maxSlots: 60,
                    cutoffDate: { toDate: () => new Date(Date.now() + 10000) }, // Future
                }),
            });

            const result = await db.isEarlyAdopterEligible();
            expect(result).toBe(true);
        });

        it('isEarlyAdopterEligible returns false when slots full', async () => {
            mocks.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    isActive: true,
                    usedSlots: 60,
                    maxSlots: 60,
                    cutoffDate: { toDate: () => new Date(Date.now() + 10000) },
                }),
            });

            const result = await db.isEarlyAdopterEligible();
            expect(result).toBe(false);
        });

        it('isEarlyAdopterEligible returns false when program is inactive', async () => {
            mocks.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    isActive: false,
                    usedSlots: 10,
                    maxSlots: 60,
                    cutoffDate: { toDate: () => new Date(Date.now() + 10000) },
                }),
            });

            const result = await db.isEarlyAdopterEligible();
            expect(result).toBe(false);
        });

        it('isEarlyAdopterEligible returns false when cutoff date has passed', async () => {
            mocks.get.mockResolvedValue({
                exists: true,
                data: () => ({
                    isActive: true,
                    usedSlots: 10,
                    maxSlots: 60,
                    cutoffDate: { toDate: () => new Date(Date.now() - 10000) }, // Past
                }),
            });

            const result = await db.isEarlyAdopterEligible();
            expect(result).toBe(false);
        });

        it('claimEarlyAdopterSlot succeeds when slot available', async () => {
            const txUpdate = vi.fn();
            mocks.runTransaction.mockImplementation(async (callback) => {
                const mockTransaction = {
                    get: vi.fn().mockResolvedValue({
                        exists: true,
                        data: () => ({
                            usedSlots: 59,
                            maxSlots: 60,
                            isActive: true,
                            cutoffDate: { toDate: () => new Date(Date.now() + 10000) },
                        }),
                    }),
                    update: txUpdate,
                };
                const ret = await callback(mockTransaction);
                return ret;
            });

            const result = await db.claimEarlyAdopterSlot();
            expect(result).toBe(true);
            // Verify transaction actually mutated state
            expect(txUpdate).toHaveBeenCalled();
        });

        it('claimEarlyAdopterSlot fails when slots full', async () => {
            const txUpdate = vi.fn();
            mocks.runTransaction.mockImplementation(async (callback) => {
                const mockTransaction = {
                    get: vi.fn().mockResolvedValue({
                        exists: true,
                        data: () => ({
                            usedSlots: 60,
                            maxSlots: 60,
                            isActive: true,
                            cutoffDate: { toDate: () => new Date(Date.now() + 10000) },
                        }),
                    }),
                    update: txUpdate,
                };
                const ret = await callback(mockTransaction);
                return ret;
            });

            const result = await db.claimEarlyAdopterSlot();
            expect(result).toBe(false);
            // Verify no mutation happened when slots are full
            expect(txUpdate).not.toHaveBeenCalled();
        });

        it('claimEarlyAdopterSlot auto-deactivates on last slot (59 → 60)', async () => {
            let capturedUpdate: Record<string, unknown> | undefined;
            mocks.runTransaction.mockImplementation(async (callback) => {
                const mockTransaction = {
                    get: vi.fn().mockResolvedValue({
                        exists: true,
                        data: () => ({
                            usedSlots: 59,
                            maxSlots: 60,
                            isActive: true,
                            cutoffDate: { toDate: () => new Date(Date.now() + 10000) },
                        }),
                    }),
                    update: vi.fn((_ref: unknown, data: Record<string, unknown>) => {
                        capturedUpdate = data;
                    }),
                };
                const ret = await callback(mockTransaction);
                return ret;
            });

            const result = await db.claimEarlyAdopterSlot();
            expect(result).toBe(true);
            expect(capturedUpdate).toEqual(expect.objectContaining({
                usedSlots: 60,
                isActive: false,
            }));
        });
    });

    describe('Lifetime Conversion', () => {
        it('convertToLifetime updates subscription correctly', async () => {
            mocks.update.mockResolvedValue(undefined);

            const result = await db.convertToLifetime('sub-123');
            expect(result).toBe(true);
            expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
                isLifetime: true,
                planType: 'lifetime',
                earlyAdopterConvertedAt: expect.any(Date),
            }));
        });
    });

    describe('Subscription Selection', () => {
        it('getSubscriptionByUserId prioritizes active record over newer expired record', async () => {
            const now = new Date();
            const plusDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

            mocks.get.mockResolvedValue({
                empty: false,
                docs: [
                    {
                        id: 'new-expired',
                        data: () => ({
                            userId: 'user-1',
                            stripeSubscriptionId: 'sub_new_expired',
                            stripeCustomerId: 'cus_new_expired',
                            status: 'expired',
                            planType: 'monthly',
                            currentPeriodStart: plusDays(-2),
                            currentPeriodEnd: plusDays(28),
                            createdAt: plusDays(1), // Newer doc
                            canceledAt: null,
                            trialEndsAt: null,
                            commitmentEndsAt: null,
                            isLifetime: false,
                            earlyAdopterConvertedAt: null,
                        }),
                    },
                    {
                        id: 'older-active',
                        data: () => ({
                            userId: 'user-1',
                            stripeSubscriptionId: 'sub_older_active',
                            stripeCustomerId: 'cus_older_active',
                            status: 'active',
                            planType: 'monthly',
                            currentPeriodStart: plusDays(-5),
                            currentPeriodEnd: plusDays(30),
                            createdAt: plusDays(-5), // Older doc
                            canceledAt: null,
                            trialEndsAt: null,
                            commitmentEndsAt: null,
                            isLifetime: false,
                            earlyAdopterConvertedAt: null,
                        }),
                    },
                ],
            });

            const result = await db.getSubscriptionByUserId('user-1');
            expect(result?.id).toBe('older-active');
            expect(result?.status).toBe('active');
        });
    });
});
