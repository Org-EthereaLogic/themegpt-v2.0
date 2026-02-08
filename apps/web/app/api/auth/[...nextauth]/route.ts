import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const nextAuthHandler = NextAuth(authOptions);

/**
 * Firebase Hosting strips ALL cookies except `__session` from incoming requests.
 * NextAuth uses multiple cookies (__Secure-next-auth.state, __Host-next-auth.csrf-token, etc.)
 * This wrapper packs all NextAuth cookies into a single `__session` cookie so they
 * survive the Firebase Hosting CDN layer. The middleware unpacks them on the way in.
 */
function wrapHandler(handler: (req: Request, ctx: unknown) => Promise<Response>) {
  return async (req: Request, ctx: unknown) => {
    const response = await handler(req, ctx);

    // Read existing packed cookies from the incoming __session cookie
    const cookieHeader = req.headers.get("cookie") || "";
    let packed: Record<string, string> = {};
    const sessionMatch = cookieHeader.match(/__session=([^;]*)/);
    if (sessionMatch) {
      try {
        packed = JSON.parse(decodeURIComponent(sessionMatch[1]));
      } catch {
        // ignore malformed __session
      }
    }

    // Get Set-Cookie headers — try getSetCookie() first, fallback to raw parsing
    let setCookies: string[] = [];
    try {
      setCookies = response.headers.getSetCookie();
    } catch {
      // Fallback: parse from raw header (joined with ", " by Headers.get)
      const raw = response.headers.get("set-cookie");
      if (raw) {
        // Split carefully — cookie values can contain commas in Expires dates
        // Use regex to split on ", " followed by a cookie name pattern
        setCookies = raw.split(/,\s*(?=[A-Za-z_][A-Za-z0-9_.-]*=)/);
      }
    }

    // Merge Set-Cookie headers into packed object
    let hasChanges = false;
    for (const cookie of setCookies) {
      const eqIndex = cookie.indexOf("=");
      if (eqIndex === -1) continue;

      const semiIndex = cookie.indexOf(";", eqIndex);
      const name = cookie.substring(0, eqIndex).trim();
      const value =
        semiIndex === -1
          ? cookie.substring(eqIndex + 1)
          : cookie.substring(eqIndex + 1, semiIndex);

      if (name === "__session") continue;

      if (cookie.includes("Max-Age=0") || cookie.includes("max-age=0")) {
        delete packed[name];
      } else {
        packed[name] = value;
      }
      hasChanges = true;
    }

    // Create a new response with the __session cookie added
    // (original response headers may be immutable)
    const newHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Skip set-cookie — we'll re-add them individually below
      if (key.toLowerCase() !== "set-cookie") {
        newHeaders.append(key, value);
      }
    });
    // Re-add Set-Cookie headers individually (forEach joins them with ", ")
    for (const cookie of setCookies) {
      newHeaders.append("Set-Cookie", cookie);
    }

    if (hasChanges && Object.keys(packed).length > 0) {
      newHeaders.append(
        "Set-Cookie",
        `__session=${encodeURIComponent(JSON.stringify(packed))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`,
      );
    } else if (hasChanges && Object.keys(packed).length === 0) {
      newHeaders.append(
        "Set-Cookie",
        `__session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      );
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

export const GET = wrapHandler(nextAuthHandler);
export const POST = wrapHandler(nextAuthHandler);
