import { Hono } from 'hono';
import { sheets_v4 } from 'googleapis';
import { getAuthClient } from '../utils/googleAuth';

const sheetsRouter = new Hono();

sheetsRouter.get('/sheets/:spreadsheetId', async (c) => {
  const spreadsheetId = c.req.param('spreadsheetId');
  const auth = await getAuthClient();
  const sheetsApi = new sheets_v4.Sheets({ auth });

  try {
    const response = await sheetsApi.spreadsheets.get({
      spreadsheetId,
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error fetching spreadsheet:', error);
    return c.json({ error: 'Failed to fetch spreadsheet' }, 500);
  }
});

sheetsRouter.get('/sheets/:spreadsheetId/values/:range', async (c) => {
  const spreadsheetId = c.req.param('spreadsheetId');
  const range = c.req.param('range');
  const auth = await getAuthClient();
  const sheetsApi = new sheets_v4.Sheets({ auth });

  try {
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error fetching values:', error);
    return c.json({ error: 'Failed to fetch values' }, 500);
  }
});

sheetsRouter.post('/sheets/:spreadsheetId/values/:range', async (c) => {
  const spreadsheetId = c.req.param('spreadsheetId');
  const range = c.req.param('range');
  const { values } = await c.req.json();
  const auth = await getAuthClient();
  const sheetsApi = new sheets_v4.Sheets({ auth });

  try {
    const response = await sheetsApi.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error updating values:', error);
    return c.json({ error: 'Failed to update values' }, 500);
  }
});

export default sheetsRouter;