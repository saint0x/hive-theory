import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.body;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.status(200).json(tokens);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).json({ message: 'Failed to exchange code for tokens' });
  }
}