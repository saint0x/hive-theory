import { NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-auth'

export async function GET() {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/presentations'
      ]
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error generating Google auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}