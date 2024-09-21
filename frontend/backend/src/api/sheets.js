const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const sheets = google.sheets({ version: 'v4' });
const drive = google.drive({ version: 'v3' });

async function getAllSpreadsheets(auth) {
  try {
    const response = await drive.files.list({
      auth,
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, createdTime, modifiedTime, thumbnailLink)',
      orderBy: 'modifiedTime desc',
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    throw new Error('Failed to fetch spreadsheets');
  }
}

async function getSpreadsheetValues(auth, spreadsheetId, range) {
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

async function batchGetSpreadsheetValues(auth, spreadsheetId, ranges) {
  try {
    const response = await sheets.spreadsheets.values.batchGet({
      auth,
      spreadsheetId,
      ranges,
    });
    return (response.data.valueRanges && response.data.valueRanges.map(range => range.values || [])) || [];
  } catch (error) {
    console.error('Error fetching batch spreadsheet values:', error);
    throw new Error('Failed to fetch batch spreadsheet values');
  }
}

async function watchSheet(auth, fileId, webhookUrl) {
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

module.exports = {
  getAllSpreadsheets,
  getSpreadsheetValues,
  batchGetSpreadsheetValues,
  watchSheet
};