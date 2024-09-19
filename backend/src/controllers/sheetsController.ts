import * as driveApi from '../api/drive';
import { OAuth2Client } from 'google-auth-library';

export class SheetsController {
  constructor(private auth: OAuth2Client) {}

  async getSpreadsheets() {
    return driveApi.listFiles(this.auth, 'application/vnd.google-apps.spreadsheet');
  }

  async getSpreadsheetMetadata(fileId: string) {
    return driveApi.getFileMetadata(this.auth, fileId);
  }

  async getSpreadsheetValues(fileId: string, range: string) {
    return driveApi.downloadSheet(this.auth, fileId, range);
  }
}