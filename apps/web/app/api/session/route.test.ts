import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

type MockResponseInit = {
  status?: number;
};

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

const mockStripe = {
  checkout: { sessions: { retrieve: vi.fn() } },
  customers: { retrieve: vi.fn() },
  subscriptions: { retrieve: vi.fn() },
};

vi.mock('@/lib/stripe', () => ({
  getStripe: () => mockStripe,
}));

function makeRequest(sessionId?: string) {
  const url = sessionId
    ? `http://localhost/api/session?session_id=${sessionId}`
    : 'http://localhost/api/session';
  return new Request(url, { method: 'GET' });
}

describe('Session API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if session_id is missing', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Missing session_id');
  });

  it('returns correct fields for subscription (no licenseKey)', async () => {
    mockStripe.checkout.sessions.retrieve.mockResolvedValueOnce({
      payment_status: 'paid',
      mode: 'subscription',
      subscription: 'sub_123',
      metadata: { planType: 'yearly' },
      customer_details: { email: 'user@test.com' },
    });

    mockStripe.subscriptions.retrieve.mockResolvedValueOnce({
      status: 'active',
      items: { data: [{ plan: { interval: 'year' } }] },
      metadata: { isLifetime: 'true' },
    });

    const res = await GET(makeRequest('cs_test_sub'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.planType).toBe('yearly');
    expect(body.isLifetime).toBe(true);
    expect(body).not.toHaveProperty('userEmail');
    expect(body).not.toHaveProperty('licenseKey');
  });

  it('returns hasLicense:true for single theme purchase (no licenseKey)', async () => {
    mockStripe.checkout.sessions.retrieve.mockResolvedValueOnce({
      payment_status: 'paid',
      mode: 'payment',
      customer: 'cus_456',
      metadata: { themeId: 'dracula', themeName: 'Dracula' },
    });

    mockStripe.customers.retrieve.mockResolvedValueOnce({
      deleted: false,
      metadata: { licenseKey: 'KEY-ABCD1234' },
    });

    const res = await GET(makeRequest('cs_test_single'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.hasLicense).toBe(true);
    expect(body.planType).toBe('single');
    expect(body.themeId).toBe('dracula');
    expect(body).not.toHaveProperty('licenseKey');
  });

  it('returns pending state when license not yet created', async () => {
    mockStripe.checkout.sessions.retrieve.mockResolvedValueOnce({
      payment_status: 'paid',
      mode: 'payment',
      customer: 'cus_789',
      metadata: {},
    });

    mockStripe.customers.retrieve.mockResolvedValueOnce({
      deleted: false,
      metadata: {},
    });

    const res = await GET(makeRequest('cs_test_pending'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.pending).toBe(true);
  });
});
