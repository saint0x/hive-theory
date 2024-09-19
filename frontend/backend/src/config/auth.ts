import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const credentials = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI
};

export const oauth2Client = new OAuth2Client(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uri
);

export function setCredentials(tokens: {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}) {
  oauth2Client.setCredentials(tokens);
}