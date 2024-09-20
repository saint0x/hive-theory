import { NextRequest, NextResponse } from 'next/server';
import { getGoogleTokens } from '@/lib/google-auth';


export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    const tokens = await getGoogleTokens(code);
    
    const response = NextResponse.json({ success: true });
    response.cookies.set('google_access_token', tokens.access_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });

    if (tokens.refresh_token) {
      response.cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }

    return response;
  } catch (error) {
    console.error('Error connecting to Google:', error);
    return NextResponse.json({ error: 'Failed to connect to Google' }, { status: 500 });
  }
}