import { Hono } from 'hono';
import { OAuth2Client } from 'google-auth-library';
import * as connectionsApi from '../api/connections';

type Bindings = {
  auth: OAuth2Client;
};

type Variables = {
  auth: OAuth2Client;
};

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

const connectionsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

connectionsRouter.post('/connections', async (c) => {
  const auth = c.get('auth');
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
    console.error('Error creating connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return c.json({ error: errorMessage }, 500);
  }
});

connectionsRouter.get('/connections', async (c) => {
  try {
    const connections = await connectionsApi.getConnections();
    return c.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return c.json({ error: 'Failed to fetch connections' }, 500);
  }
});

connectionsRouter.post('/sync', async (c) => {
  const auth = c.get('auth');
  try {
    await connectionsApi.syncAllConnections(auth);
    return c.json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Error syncing connections:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return c.json({ error: errorMessage }, 500);
  }
});

export default connectionsRouter;