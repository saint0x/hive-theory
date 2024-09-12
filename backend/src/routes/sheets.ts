import { Hono } from 'hono';
import { google, sheets_v4, Auth } from 'googleapis';
import { getAuthClient } from '../utils/googleAuth';

const sheetsRouter = new Hono();

// Create a function to get the Sheets API client
async function getSheetsApiClient(): Promise<sheets_v4.Sheets> {
  const auth = await getAuthClient() as Auth.OAuth2Client;
  return new sheets_v4.Sheets({ auth });
}

sheetsRouter.get('/sheets/:spreadsheetId', async (c) => {
  const spreadsheetId = c.req.param('spreadsheetId');
  const sheetsApi = await getSheetsApiClient();

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
  const sheetsApi = await getSheetsApiClient();

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
  const sheetsApi = await getSheetsApiClient();

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