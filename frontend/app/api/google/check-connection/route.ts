import { NextResponse } from 'next/server'
import { oauth2Client } from '@/lib/google-auth'

export async function GET() {
  try {
    const tokens = await oauth2Client.getAccessToken()
    return NextResponse.json({ isConnected: !!tokens.token })
  } catch (error) {
    console.error('Error checking Google connection:', error)
    return NextResponse.json({ isConnected: false, error: 'Failed to check connection' }, { status: 500 })
  }
}