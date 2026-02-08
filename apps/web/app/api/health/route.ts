import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { getAuthLogs } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ] as const;

  const env: Record<string, boolean> = {};
  for (const key of envVars) {
    env[key] = !!process.env[key];
  }

  let firebaseConnected = false;
  try {
    const db = getDb();
    await db.listCollections();
    firebaseConnected = true;
  } catch (error) {
    console.error('Health check Firebase error:', error);
  }

  let authLogs: unknown[] = [];
  try {
    authLogs = getAuthLogs();
  } catch (e) {
    authLogs = [{ error: String(e) }];
  }

  return NextResponse.json(
    { version: 'v10', env, firebaseConnected, authLogs },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } },
  );
}
