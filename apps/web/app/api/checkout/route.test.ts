import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetServerSession = vi.fn();
const mockCheckRateLimit = vi.fn();
const mockCheckoutCreate = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  RATE_LIMITS: {
    payment: {},
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    isEarlyAdopterEligible: vi.fn().mockResolvedValue(false),
    getSubscriptionByUserId: vi.fn().mockResolvedValue(null),
    upsertCheckoutSession: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockCheckoutCreate,
      },
    },
  }),
  STRIPE_PRICES: {
    monthly: "price_monthly",
    yearly: "price_yearly",
    singleTheme: "price_single",
  },
  TRIAL_DAYS: 30,
}));

const { POST } = await import("./route");
const { db } = await import("@/lib/db");

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Checkout API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockReturnValue(null);
    mockGetServerSession.mockResolvedValue({
      user: { id: "user_123", email: "buyer@etherealogic.ai" },
    });
    mockCheckoutCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
      created: 1710000000,
      currency: "usd",
      amount_total: 699,
    });
    vi.mocked(db.isEarlyAdopterEligible).mockResolvedValue(false);
    vi.mocked(db.getSubscriptionByUserId).mockResolvedValue(null);
    vi.mocked(db.upsertCheckoutSession).mockResolvedValue(true);
  });

  it("creates monthly checkout without promotions consent collection and persists attribution", async () => {
    const response = await POST(
      makeRequest({
        type: "monthly",
        attribution: {
          utmSource: "extension",
          utmMedium: "popup",
          utmCampaign: "launch",
          landingPath: "/?utm_source=extension",
        },
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const checkoutParams = mockCheckoutCreate.mock.calls[0]?.[0];
    expect(checkoutParams).toBeTruthy();
    expect(checkoutParams.consent_collection).toEqual({ promotions: "auto" });
    expect(checkoutParams.metadata.utm_source).toBe("extension");
    expect(checkoutParams.metadata.utm_medium).toBe("popup");
    expect(checkoutParams.metadata.utm_campaign).toBe("launch");
    expect(checkoutParams.subscription_data.trial_period_days).toBe(30);
    expect(checkoutParams.subscription_data.metadata.utm_source).toBe("extension");

    expect(db.upsertCheckoutSession).toHaveBeenCalledWith(
      "cs_test_123",
      expect.objectContaining({
        sessionStatus: "created",
        checkoutType: "monthly",
        utmSource: "extension",
        utmMedium: "popup",
        utmCampaign: "launch",
      })
    );
  });

  it("returns 401 when checkout is attempted without an authenticated session", async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    const response = await POST(makeRequest({ type: "monthly" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Authentication required");
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid checkout type", async () => {
    const response = await POST(makeRequest({ type: "invalid-plan" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid checkout type");
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it("returns 409 when user already has full subscription access", async () => {
    vi.mocked(db.getSubscriptionByUserId).mockResolvedValueOnce({
      id: "sub_123",
      userId: "user_123",
      stripeSubscriptionId: "stripe_sub_123",
      stripeCustomerId: "stripe_cus_123",
      status: "active",
      planType: "monthly",
      currentPeriodStart: new Date("2026-02-01T00:00:00.000Z"),
      currentPeriodEnd: new Date("2026-03-01T00:00:00.000Z"),
      canceledAt: null,
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
      trialEndsAt: null,
      commitmentEndsAt: null,
      isLifetime: false,
      earlyAdopterConvertedAt: null,
    } as Awaited<ReturnType<typeof db.getSubscriptionByUserId>>);

    const response = await POST(makeRequest({ type: "monthly" }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.message).toContain("already have an active subscription");
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });
});
