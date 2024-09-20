import { NextApiRequest, NextApiResponse } from 'next'
import { getGoogleTokens, getUserInfo } from '@/lib/google-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query

  if (!code || Array.isArray(code)) {
    return res.status(400).json({ error: 'Invalid authorization code' })
  }

  try {
    const tokens = await getGoogleTokens(code)
    const userInfo = await getUserInfo(tokens.access_token!)

    // Here you would typically store the user info and tokens in your database
    // For this example, we'll just set them in cookies
    res.setHeader('Set-Cookie', [
      `access_token=${tokens.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600}`,
      `refresh_token=${tokens.refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/`,
      `user_info=${JSON.stringify(userInfo)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
    ])

    res.redirect('/create-connection')
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    res.redirect('/error?message=Failed to authenticate with Google')
  }
}