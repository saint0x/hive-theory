import { google } from 'googleapis'

// WARNING: Hardcoding sensitive information is not recommended for production use.
// Always use environment variables in production environments.
const GOOGLE_CLIENT_ID = '1027395944679-gpv1ct5ncvmucji8hh0i8hkgbg91ti6s.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
const GOOGLE_REDIRECT_URI = 'https://symmetrical-space-capybara-pxr4j9rv9pvcrr4x-3000.app.github.dev/api/auth/callback/google'

if (process.env.NODE_ENV === 'production') {
  console.warn('Using hardcoded Google OAuth credentials in production is not secure.')
}

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
)

export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  return tokens
}