const { Hono } = require('hono');
const connectionsApi = require('../api/connections');

const connectionsRouter = new Hono();

connectionsRouter.post('/connections', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

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

module.exports = connectionsRouter;