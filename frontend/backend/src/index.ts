import { Hono } from 'hono';
import { OAuth2Client } from 'google-auth-library';
import sheetsRouter from './routes/sheets';
import slidesRouter from './routes/slides';
import connectionsRouter from './routes/connections';
import { oauth2Client } from './config/auth';

// Define the environment type
type Env = {
  Variables: {
    auth: OAuth2Client;
  };
};

// Create a Hono app with the Env type
const app = new Hono<Env>();

// Middleware to add auth to the context
app.use('*', async (c: { env: { Variables: { auth: any; }; }; }, next: () => any) => {
  if (!c.env.Variables) {
    c.env.Variables = {} as Env['Variables'];
  }
  c.env.Variables.auth = oauth2Client;
  await next();
});

// Error handling middleware
app.use('*', async (c: { json: (arg0: { error: string; }, arg1: number) => any; }, next: () => any) => {
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
app.get('/health', (c: { json: (arg0: { status: string; }) => any; }) => c.json({ status: 'OK' }));

// 404 handler
app.notFound((c: { json: (arg0: { error: string; }, arg1: number) => any; }) => {
  return c.json({ error: 'Not Found' }, 404);
});

export default app;