import { NextRequest, NextResponse } from 'next/server'
import { listFiles } from '@/backend/src/api/drive'
import { oauth2Client } from '@/backend/src/config/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mimeType = searchParams.get('mimeType')

  if (!mimeType) {
    return NextResponse.json({ error: 'Missing mimeType parameter' }, { status: 400 })
  }

  try {
    const files = await listFiles(oauth2Client, mimeType)
    return NextResponse.json(files)
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}