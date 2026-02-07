import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

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

  return NextResponse.json({ env, firebaseConnected });
}
