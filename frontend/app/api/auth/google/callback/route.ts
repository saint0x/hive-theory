import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUser } from '@/utils/database';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  try {
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Failed to verify ID token');
    }

    const { email, name, sub: googleId } = payload;

    if (!email || !name || !googleId) {
      throw new Error('Missing user information from Google');
    }

    const user = await findOrCreateUser(email, name, googleId, tokens);

    // Create a session token or JWT for your app
    // This is a simplified example. In a real app, you'd use a proper JWT library
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
    })).toString('base64');

    return NextResponse.json({ token: sessionToken });
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}