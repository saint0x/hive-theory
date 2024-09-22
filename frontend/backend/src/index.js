const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const { logger } = require('hono/logger');
const sheetsRouter = require('./routes/sheets');
const slidesRouter = require('./routes/slides');
const connectionsRouter = require('./routes/connections');
const { oauth2Client } = require('./config/auth');

// Create a Hono app
const app = new Hono();

// Add logger middleware
app.use('*', logger());

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
    return c.json({ error: 'An unexpected error occurred', details: error.message }, 500);
  }
});

// Route handlers
app.route('/api', sheetsRouter);
app.route('/api', slidesRouter);
app.route('/api', connectionsRouter);

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'OK', timestamp: new Date().toISOString() }));

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Start the server
const port = 3001; // Hardcoded port number
const server = serve({
  fetch: app.fetch,
  port: port
});

server.on('listening', () => {
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});