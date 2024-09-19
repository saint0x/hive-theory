import { Hono } from 'hono';
import { OAuth2Client } from 'google-auth-library';
import * as connectionsApi from '../api/connections';

interface Env {
  auth: OAuth2Client;
}

interface ConnectionRequest {
  sheetId: string;
  slideId: string;
  sheetRange: string;
  slidePageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isImage: boolean;
}

const router = new Hono<{ Bindings: Env }>();

router.post('/connections', async (c) => {
  const auth = c.env.auth;
  const body = await c.req.json() as ConnectionRequest;

  try {
    const connection = await connectionsApi.createConnection(
      auth, 
      body.sheetId, 
      body.slideId, 
      body.sheetRange, 
      body.slidePageId, 
      body.x, 
      body.y, 
      body.width, 
      body.height, 
      body.isImage
    );
    return c.json(connection);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return c.json({ error: errorMessage }, 500);
  }
});

router.get('/connections', async (c) => {
  const connections = connectionsApi.getConnections();
  return c.json(connections);
});

router.post('/sync', async (c) => {
  const auth = c.env.auth;
  try {
    await connectionsApi.syncAllConnections(auth);
    return c.json({ message: 'Sync completed successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return c.json({ error: errorMessage }, 500);
  }
});

export default router;