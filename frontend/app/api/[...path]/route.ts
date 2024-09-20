import { NextRequest, NextResponse } from 'next/server';
import app from '../../../backend/src/index';
import { getGoogleTokens, getUserInfo } from '../../../backend/src/api/auth/lib/google-auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  console.log('Incoming request path:', path);

  if (path === '/api/auth/callback/google') {
    const code = url.searchParams.get('code');
    if (!code) {
      console.log('No code provided in Google callback');
      return NextResponse.redirect('/error?message=No code provided');
    }

    try {
      console.log('Exchanging code for tokens');
      const tokens = await getGoogleTokens(code);
      console.log('Fetching user info');
      const userInfo = await getUserInfo(tokens.access_token!);

      // Create a JWT token
      const token = jwt.sign(
        { 
          userId: userInfo.id, 
          email: userInfo.email,
          name: userInfo.name
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Redirecting to /');
      const response = NextResponse.redirect(new URL('/', request.url));

      // Set JWT token as an HTTP-only cookie
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600 // 1 hour
      });

      return response;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return NextResponse.redirect('/error?message=Failed to authenticate with Google');
    }
  }

  // For all other routes, use the existing handleRequest function
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  const method = request.method.toLowerCase();

  const honoEnv = {
    Variables: {
      auth: {} // You might need to initialize this properly
    }
  };

  const honoReq = new Request(`http://localhost${path}`, {
    method: method,
    headers: request.headers,
    body: ['get', 'head'].includes(method) ? undefined : await request.text(),
  });

  const honoRes = await app.fetch(honoReq, honoEnv);
  const body = await honoRes.text();

  const response = new NextResponse(body, {
    status: honoRes.status,
    headers: honoRes.headers,
  });

  return response;
}