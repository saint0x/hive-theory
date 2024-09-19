import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { code } = await request.json()

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  const tokenEndpoint = 'https://oauth2.googleapis.com/token'

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri!,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 400 })
  }

  const data = await response.json()
  return NextResponse.json(data)
}