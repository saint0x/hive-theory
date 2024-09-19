import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const drive = google.drive({ version: 'v3' });
const sheets = google.sheets({ version: 'v4' });

export async function listFiles(auth: OAuth2Client, mimeType: string) {
  const res = await drive.files.list({
    auth,
    q: `mimeType='${mimeType}'`,
    fields: 'files(id, name, mimeType, thumbnailLink)',
  });
  return res.data.files || [];
}

export async function getFileMetadata(auth: OAuth2Client, fileId: string) {
  const res = await drive.files.get({
    auth,
    fileId,
    fields: 'id, name, mimeType, createdTime, modifiedTime, owners, thumbnailLink',
  });
  return res.data;
}

export async function downloadSheet(auth: OAuth2Client, fileId: string, range: string) {
  const res = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: fileId,
    range,
  });
  return res.data.values || [];
}

export async function exportSlides(auth: OAuth2Client, fileId: string): Promise<ArrayBuffer> {
  const res = await drive.files.export({
    auth,
    fileId,
    mimeType: 'application/pdf',
  }, { responseType: 'arraybuffer' });
  return res.data as ArrayBuffer;
}