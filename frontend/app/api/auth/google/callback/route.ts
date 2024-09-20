import { NextRequest, NextResponse } from 'next/server'
import { getGoogleTokens } from '@/lib/google-auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect('/error?message=No code provided')
  }

  try {
    const tokens = await getGoogleTokens(code)
    
    // Here you would typically store the tokens securely, e.g., in a database
    // For this example, we'll just set them in a secure, HTTP-only cookie
    const response = NextResponse.redirect('/dashboard')
    response.cookies.set('google_access_token', tokens.access_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    })
    if (tokens.refresh_token) {
      response.cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
    }

    return response
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    return NextResponse.redirect('/error?message=Failed to authenticate with Google')
  }
}