import { google } from 'googleapis'

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
)

export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return tokens
}