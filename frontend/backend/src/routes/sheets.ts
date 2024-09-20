import { Hono } from 'hono';
import { SheetsController } from '../controllers/sheetsController';
import { OAuth2Client } from 'google-auth-library';

type Bindings = {
  auth: OAuth2Client;
};

type Variables = {
  auth: OAuth2Client;
};

const sheetsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>();

sheetsRouter.get('/spreadsheets', async (c) => {
  const auth = c.get('auth');
  const controller = new SheetsController(auth);
  try {
    const spreadsheets = await controller.getSpreadsheets();
    return c.json(spreadsheets);
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    return c.json({ error: 'Failed to fetch spreadsheets' }, 500);
  }
});

sheetsRouter.get('/spreadsheets/:id', async (c) => {
  const auth = c.get('auth');
  const controller = new SheetsController(auth);
  const { id } = c.req.param();
  try {
    const metadata = await controller.getSpreadsheetMetadata(id);
    return c.json(metadata);
  } catch (error) {
    console.error(`Error fetching metadata for spreadsheet ${id}:`, error);
    return c.json({ error: 'Failed to fetch spreadsheet metadata' }, 500);
  }
});

sheetsRouter.get('/spreadsheets/:id/values', async (c) => {
  const auth = c.get('auth');
  const controller = new SheetsController(auth);
  const { id } = c.req.param();
  const range = c.req.query('range');
  if (!range) {
    return c.json({ error: 'Range parameter is required' }, 400);
  }
  try {
    const values = await controller.getSpreadsheetValues(id, range);
    return c.json(values);
  } catch (error) {
    console.error(`Error fetching values for spreadsheet ${id}:`, error);
    return c.json({ error: 'Failed to fetch spreadsheet values' }, 500);
  }
});

export default sheetsRouter;