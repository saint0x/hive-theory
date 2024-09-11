import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import sheets from './routes/sheets';
import slides from './routes/slides';
import sync from './routes/sync';

const app = new Hono();

app.use('*', async (c, next) => {
    console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);
    await next();
});

app.route('/api', sheets);
app.route('/api', slides);
app.route('/api', sync);

app.get('/', (c) => c.text('Hive Theory backend is live!'));

serve(app);