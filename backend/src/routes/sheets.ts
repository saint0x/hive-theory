import { Hono } from 'hono';
import { SheetsController } from '../controllers/sheetsController';
import { OAuth2Client } from 'google-auth-library';

// Define the environment type
type Env = {
  auth: OAuth2Client;
};

const sheetsRouter = new Hono<{ Bindings: Env }>();

sheetsRouter.get('/spreadsheets', async (c) => {
  const controller = new SheetsController(c.env.auth);
  const spreadsheets = await controller.getSpreadsheets();
  return c.json(spreadsheets);
});

sheetsRouter.get('/spreadsheets/:id', async (c) => {
  const controller = new SheetsController(c.env.auth);
  const { id } = c.req.param();
  const metadata = await controller.getSpreadsheetMetadata(id);
  return c.json(metadata);
});

sheetsRouter.get('/spreadsheets/:id/values', async (c) => {
  const controller = new SheetsController(c.env.auth);
  const { id } = c.req.param();
  const range = c.req.query('range');
  if (!range) {
    return c.json({ error: 'Range parameter is required' }, 400);
  }
  const values = await controller.getSpreadsheetValues(id, range);
  return c.json(values);
});

export default sheetsRouter;