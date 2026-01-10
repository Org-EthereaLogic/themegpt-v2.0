import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: This resets on server restart and doesn't work across multiple instances
// For production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header (set by proxies/load balancers) or falls back to a default
 */
function getClientId(request: NextRequest): string {
  // In production behind a proxy, use X-Forwarded-For
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP (client IP)
    return forwardedFor.split(",")[0].trim();
  }

  // Fallback for direct connections
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Check rate limit for a request
 * Returns null if allowed, or a NextResponse if rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const clientId = getClientId(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // First request or window expired - start new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.interval,
    });
    return null;
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": entry.resetTime.toString(),
        },
      }
    );
  }

  // Increment counter
  entry.count++;
  return null;
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Auth endpoints - stricter limits to prevent brute force
  auth: { interval: 60 * 1000, maxRequests: 10 }, // 10 per minute

  // Webhook endpoints - more lenient for Stripe callbacks
  webhook: { interval: 60 * 1000, maxRequests: 100 }, // 100 per minute

  // General API endpoints
  api: { interval: 60 * 1000, maxRequests: 30 }, // 30 per minute

  // Extension sync - moderate limits
  sync: { interval: 60 * 1000, maxRequests: 20 }, // 20 per minute

  // Payment/checkout - strict limits
  payment: { interval: 60 * 1000, maxRequests: 5 }, // 5 per minute
};
