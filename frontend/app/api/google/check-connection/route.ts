import { NextRequest, NextResponse } from 'next/server';
import { oauth2Client } from '@/lib/google-auth';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('google_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ connected: false });
  }

  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    await drive.files.list({ pageSize: 1 });
    return NextResponse.json({ connected: true });
  } catch (error) {
    console.error('Error checking Google connection:', error);
    return NextResponse.json({ connected: false });
  }
}