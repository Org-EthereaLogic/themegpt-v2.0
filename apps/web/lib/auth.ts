import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db as firestore } from "./firebase-admin";

// In-memory log ring buffer for diagnostics (readable via /api/health)
const MAX_LOG_ENTRIES = 50;
const _authLogs: { ts: string; level: string; msg: string }[] = [];

function authLog(level: string, msg: string) {
  _authLogs.push({ ts: new Date().toISOString(), level, msg });
  if (_authLogs.length > MAX_LOG_ENTRIES) _authLogs.shift();
  console.log(`[auth:${level}] ${msg}`);
}

export function getAuthLogs() {
  return _authLogs;
}

function serializeMeta(metadata: unknown): string {
  if (!metadata) return 'undefined';
  if (metadata instanceof Error) {
    return JSON.stringify({ message: metadata.message, name: metadata.name, stack: metadata.stack?.split('\n').slice(0, 3).join(' | ') });
  }
  if (typeof metadata === 'object') {
    const obj = metadata as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val instanceof Error) {
        result[key] = { message: val.message, name: val.name, stack: val.stack?.split('\n').slice(0, 3).join(' | ') };
      } else {
        result[key] = val;
      }
    }
    return JSON.stringify(result);
  }
  return String(metadata);
}

// Collection names
const USERS_COLLECTION = 'users';

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NEXTAUTH_DEBUG === 'true',
  logger: {
    error(code, metadata) {
      authLog('ERROR', `${code} ${serializeMeta(metadata)}`);
    },
    warn(code) {
      authLog('WARN', code);
    },
    debug(code, metadata) {
      authLog('DEBUG', `${code} ${serializeMeta(metadata)}`);
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      authLog('INFO', `signIn callback: email=${user.email} provider=${account?.provider}`);
      if (!user.email || !account) return false;

      try {
        // Check if user exists
        const usersRef = firestore.collection(USERS_COLLECTION);
        const existingUser = await usersRef
          .where('email', '==', user.email)
          .limit(1)
          .get();

        if (existingUser.empty) {
          // Create new user
          const newUserRef = usersRef.doc();
          await newUserRef.set({
            email: user.email,
            provider: account.provider,
            providerId: account.providerAccountId,
            name: user.name || null,
            image: user.image || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          // Update existing user
          const userDoc = existingUser.docs[0];
          await userDoc.ref.update({
            name: user.name || null,
            image: user.image || null,
            updatedAt: new Date(),
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        try {
          const usersRef = firestore.collection(USERS_COLLECTION);
          const existingUser = await usersRef
            .where('email', '==', user.email)
            .limit(1)
            .get();

          if (!existingUser.empty) {
            token.userId = existingUser.docs[0].id;
          }
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

// Helper to get user ID from email
export async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const usersRef = firestore.collection(USERS_COLLECTION);
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].id;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}
