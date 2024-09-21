import { NextRequest, NextResponse } from 'next/server';
import { Hono } from 'hono';
import { getGoogleTokens, getUserInfo } from '../../../backend/src/api/auth/lib/google-auth';
import jwt from 'jsonwebtoken';
import backendApp from '../../../backend/src/index';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Type assertion for the backend app
const app = backendApp as unknown as Hono;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  console.log('Incoming GET request path:', path);

  if (path === '/api/auth/callback/google') {
    return handleGoogleCallback(request);
  }

  // For all other GET routes, use the existing handleRequest function
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  console.log('Incoming POST request');
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  console.log('Incoming PUT request');
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  console.log('Incoming DELETE request');
  return handleRequest(request);
}

async function handleGoogleCallback(request: NextRequest) {
  const url = new URL(request.url);
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

async function handleRequest(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  const method = request.method.toLowerCase();

  console.log(`Handling ${method.toUpperCase()} request for path: ${path}`);

  const honoEnv = {
    Variables: {
      auth: {} // Initialize this properly if needed
    }
  };

  const honoReq = new Request(`http://localhost${path}`, {
    method: method,
    headers: request.headers,
    body: ['get', 'head'].includes(method) ? undefined : await request.text(),
  });

  try {
    const honoRes = await app.fetch(honoReq, honoEnv);
    const body = await honoRes.text();

    const response = new NextResponse(body, {
      status: honoRes.status,
      headers: honoRes.headers,
    });

    return response;
  } catch (error) {
    console.error(`Error handling ${method.toUpperCase()} request for ${path}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}