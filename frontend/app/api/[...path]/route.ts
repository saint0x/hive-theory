import { NextRequest, NextResponse } from 'next/server';
import app from '../../../backend/src/index';

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