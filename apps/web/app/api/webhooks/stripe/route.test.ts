import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

type MockResponseInit = {
  status?: number;
  headers?: Record<string, string>;
};

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: (body: unknown, init?: MockResponseInit) => ({
        json: async () => body,
        status: init?.status || 200,
      }),
    },
  };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn((name: string) => {
      if (name === 'stripe-signature') return 'test_sig';
      return null;
    }),
  }),
}));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    beginWebhookEventProcessing: vi.fn().mockResolvedValue('acquired'),
    completeWebhookEventProcessing: vi.fn().mockResolvedValue(undefined),
    abandonWebhookEventProcessing: vi.fn().mockResolvedValue(undefined),
    createLicense: vi.fn().mockResolvedValue(undefined),
    createSubscription: vi.fn().mockResolvedValue('sub-doc-id'),
    getSubscriptionByStripeId: vi.fn().mockResolvedValue(null),
    isEarlyAdopterEligible: vi.fn().mockResolvedValue(false),
    getThemeName: vi.fn().mockReturnValue('Test Theme'),
    getAbandonedCheckoutBySessionId: vi.fn().mockResolvedValue(null),
    upsertAbandonedCheckout: vi.fn().mockResolvedValue(true),
    upsertCheckoutSession: vi.fn().mockResolvedValue(true),
    upsertRevenueEvent: vi.fn().mockResolvedValue(true),
    getUserById: vi.fn().mockResolvedValue(null),
  },
}));

// Mock Stripe
const mockConstructEvent = vi.fn();
const mockSubscriptionsRetrieve = vi.fn();
const mockCustomersUpdate = vi.fn().mockResolvedValue({});
const mockCustomersRetrieve = vi.fn().mockResolvedValue({ deleted: false, email: 'test@test.com' });

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
    customers: { update: mockCustomersUpdate, retrieve: mockCustomersRetrieve },
  }),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendSubscriptionConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendCheckoutRecoveryEmail: vi.fn().mockResolvedValue({ success: true }),
  sendThemePurchaseConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendTrialEndingEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
}));

const { db } = await import('@/lib/db');

function makeRequest(body: string = '{}') {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
  });
}

describe('Stripe Webhook Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    vi.mocked(db.beginWebhookEventProcessing).mockResolvedValue('acquired');
  });

  it('returns 400 if stripe-signature is missing', async () => {
    const { headers } = await import('next/headers');
    vi.mocked(headers).mockResolvedValueOnce({
      get: vi.fn(() => null),
    } as unknown as Awaited<ReturnType<typeof headers>>);

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Missing signature');
  });

  it('returns 400 if signature verification fails', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });

    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
  });

  it('returns 200 without processing if event already processed (idempotency)', async () => {
    vi.mocked(db.beginWebhookEventProcessing).mockResolvedValueOnce('already_processed');
    mockConstructEvent.mockReturnValueOnce({
      id: 'evt_duplicate',
      type: 'checkout.session.completed',
      data: { object: {} },
    });

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.received).toBe(true);
    expect(db.createSubscription).not.toHaveBeenCalled();
    expect(db.createLicense).not.toHaveBeenCalled();
    expect(db.completeWebhookEventProcessing).not.toHaveBeenCalled();
  });

  it('returns 409 if same event is already in progress (retryable)', async () => {
    vi.mocked(db.beginWebhookEventProcessing).mockResolvedValueOnce('in_progress');
    mockConstructEvent.mockReturnValueOnce({
      id: 'evt_busy',
      type: 'checkout.session.completed',
      data: { object: {} },
    });

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe('Event processing already in progress');
    expect(db.createSubscription).not.toHaveBeenCalled();
    expect(db.createLicense).not.toHaveBeenCalled();
    expect(db.completeWebhookEventProcessing).not.toHaveBeenCalled();
  });

  it('returns 500 if webhook processing lock cannot be acquired', async () => {
    vi.mocked(db.beginWebhookEventProcessing).mockResolvedValueOnce('error');
    mockConstructEvent.mockReturnValueOnce({
      id: 'evt_lock_error',
      type: 'checkout.session.completed',
      data: { object: {} },
    });

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Failed to acquire webhook processing lock');
    expect(db.createSubscription).not.toHaveBeenCalled();
    expect(db.createLicense).not.toHaveBeenCalled();
    expect(db.completeWebhookEventProcessing).not.toHaveBeenCalled();
  });

  it('releases processing lock and returns 500 if handler throws', async () => {
    mockConstructEvent.mockReturnValueOnce({
      id: 'evt_fails',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { type: 'monthly', userId: 'user-1', planType: 'monthly' },
          subscription: 'sub_fails',
          customer: 'cus_123',
        },
      },
    });
    mockSubscriptionsRetrieve.mockRejectedValueOnce(new Error('Stripe retrieve failed'));

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Webhook processing failed');
    expect(db.abandonWebhookEventProcessing).toHaveBeenCalledWith('evt_fails');
    expect(db.completeWebhookEventProcessing).not.toHaveBeenCalled();
  });

  it('creates subscription for checkout.session.completed and marks event processed', async () => {
    const mockStripeSubscription = {
      id: 'sub_test123',
      status: 'active',
      items: { data: [{ current_period_start: 1700000000, current_period_end: 1702592000 }] },
      trial_end: null,
      metadata: {},
    };
    mockSubscriptionsRetrieve.mockResolvedValueOnce(mockStripeSubscription);

    mockConstructEvent.mockReturnValueOnce({
      id: 'evt_new',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { type: 'monthly', userId: 'user-1', planType: 'monthly' },
          subscription: 'sub_test123',
          customer: 'cus_123',
          customer_email: 'test@test.com',
        },
      },
    });

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.received).toBe(true);
    expect(db.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        stripeSubscriptionId: 'sub_test123',
        planType: 'monthly',
      })
    );
    expect(db.createLicense).toHaveBeenCalled();
    expect(db.completeWebhookEventProcessing).toHaveBeenCalledWith('evt_new', 'checkout.session.completed');
    expect(db.abandonWebhookEventProcessing).not.toHaveBeenCalled();
  });

  it('creates license for single theme purchase', async () => {
    mockConstructEvent.mockReturnValueOnce({
      id: 'evt_single',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { type: 'single', themeId: 'dracula' },
          customer: 'cus_456',
          customer_email: 'buyer@test.com',
        },
      },
    });

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(db.createLicense).toHaveBeenCalledWith(
      'KEY-AAAAAAAA',
      expect.objectContaining({
        active: true,
        type: 'lifetime',
        permanentlyUnlocked: ['dracula'],
      })
    );
    expect(db.createSubscription).not.toHaveBeenCalled();
    expect(db.completeWebhookEventProcessing).toHaveBeenCalledWith('evt_single', 'checkout.session.completed');
  });

  it('handles invoice.paid for first yearly payment', async () => {
    mockConstructEvent.mockReturnValueOnce({
      id: 'evt_invoice',
      type: 'invoice.paid',
      data: {
        object: {
          subscription: 'sub_yearly',
          billing_reason: 'subscription_create',
          amount_paid: 9900,
        },
      },
    });

    mockSubscriptionsRetrieve.mockResolvedValueOnce({
      id: 'sub_yearly',
      metadata: { planType: 'yearly' },
      items: { data: [] },
      customer: 'cus_789',
    });

    // Early adopter not eligible — skip conversion
    vi.mocked(db.isEarlyAdopterEligible).mockResolvedValueOnce(false);

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(db.isEarlyAdopterEligible).toHaveBeenCalled();
    expect(db.completeWebhookEventProcessing).toHaveBeenCalledWith('evt_invoice', 'invoice.paid');
  });
});
