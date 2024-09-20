import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = '1027395944679-gpv1ct5ncvmucji8hh0i8hkgbg91ti6s.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error('Missing required Google OAuth environment variables');
}

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export async function getAuthClient(): Promise<OAuth2Client> {
  return oauth2Client;
}

export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent',
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

export async function getUserInfo(accessToken: string) {
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  oauth2Client.setCredentials({ access_token: accessToken });
  const { data } = await oauth2.userinfo.get();
  return data;
}

export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}