import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const url = getAuthUrl();
    
    // Use the request object to get the host
    const host = request.headers.get('host') || 'localhost';
    
    // Log the request information
    console.log(`Auth URL requested from: ${host}`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}