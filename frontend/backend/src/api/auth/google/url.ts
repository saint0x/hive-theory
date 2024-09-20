import type { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleAuthUrl } from '../../../../../utils/oauth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const url = await getGoogleAuthUrl();
      res.status(200).json({ url });
    } catch (error) {
      console.error('Error generating Google Auth URL:', error);
      res.status(500).json({ error: 'Failed to generate Google Auth URL' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}