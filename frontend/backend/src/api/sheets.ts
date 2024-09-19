import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const sheets = google.sheets({ version: 'v4' });
const drive = google.drive({ version: 'v3' });

interface SpreadsheetData {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  thumbnailLink?: string;
}

export async function getAllSpreadsheets(auth: OAuth2Client): Promise<SpreadsheetData[]> {
  try {
    const response = await drive.files.list({
      auth,
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, createdTime, modifiedTime, thumbnailLink)',
      orderBy: 'modifiedTime desc',
    });

    return response.data.files as SpreadsheetData[] || [];
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    throw new Error('Failed to fetch spreadsheets');
  }
}

export async function getSpreadsheetValues(auth: OAuth2Client, spreadsheetId: string, range: string): Promise<any[][]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching spreadsheet values:', error);
    throw new Error('Failed to fetch spreadsheet values');
  }
}

export async function batchGetSpreadsheetValues(auth: OAuth2Client, spreadsheetId: string, ranges: string[]): Promise<any[][][]> {
  try {
    const response = await sheets.spreadsheets.values.batchGet({
      auth,
      spreadsheetId,
      ranges,
    });
    return response.data.valueRanges?.map(range => range.values || []) || [];
  } catch (error) {
    console.error('Error fetching batch spreadsheet values:', error);
    throw new Error('Failed to fetch batch spreadsheet values');
  }
}

type WatchResponse = drive_v3.Schema$Channel;

export async function watchSheet(auth: OAuth2Client, fileId: string, webhookUrl: string): Promise<WatchResponse> {
  try {
    const response = await drive.files.watch({
      auth,
      fileId,
      requestBody: {
        kind: 'api#channel',
        id: `sheet-watch-${Date.now()}`,
        type: 'web_hook',
        address: webhookUrl,
      },
    });
    
    if (!response.data) {
      throw new Error('No data returned from watch request');
    }

    return response.data;
  } catch (error) {
    console.error('Error setting up sheet watch:', error);
    throw new Error('Failed to set up sheet watch');
  }
}