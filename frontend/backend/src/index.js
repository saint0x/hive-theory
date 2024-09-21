const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const sheetsRouter = require('./routes/sheets');
const slidesRouter = require('./routes/slides');
const connectionsRouter = require('./routes/connections');
const { oauth2Client } = require('./config/auth');

// Create a Hono app
const app = new Hono();

// Middleware to add auth to the context
app.use('*', async (c, next) => {
  c.set('auth', oauth2Client);
  await next();
});

// Error handling middleware
app.use('*', async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

// Route handlers
app.route('/api/sheets', sheetsRouter);
app.route('/api/slides', slidesRouter);
app.route('/api/connections', connectionsRouter);

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'OK' }));

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Start the server
const port = 3001; // Hardcoded port number
console.log(`Backend server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port
});