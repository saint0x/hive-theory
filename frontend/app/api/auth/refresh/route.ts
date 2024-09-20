import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/utils/database';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  try {
    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (Date.now() < user.token_expiry) {
      // Token is still valid
      return NextResponse.json({ token: user.access_token });
    }

    // Token has expired, refresh it
    const { credentials } = await client.refreshToken(user.refresh_token);

    // Update the database with the new tokens
    await db.run(
      'UPDATE users SET access_token = ?, token_expiry = ? WHERE id = ?',
      credentials.access_token,
      Date.now() + credentials.expiry_time! * 1000,
      userId
    );

    return NextResponse.json({ token: credentials.access_token });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}