import { NextRequest, NextResponse } from 'next/server';
import app from '../../../../backend/src/index';
import { Env } from 'hono';

export async function GET(request: NextRequest) {
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

  const honoEnv: Env = {
    Variables: {
      auth: {} // Initialize this properly based on your auth requirements
    }
  };

  let body: string | undefined;
  if (!['get', 'head'].includes(method)) {
    body = await request.text();
  }

  const honoReq = new Request(`http://localhost${path}`, {
    method: method,
    headers: request.headers,
    body: body,
  });

  try {
    const honoRes = await app.fetch(honoReq, honoEnv);
    const responseBody = await honoRes.text();

    const response = new NextResponse(responseBody, {
      status: honoRes.status,
      headers: new Headers(honoRes.headers),
    });

    return response;
  } catch (error) {
    console.error('Error handling request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}