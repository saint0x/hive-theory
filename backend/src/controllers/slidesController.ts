import * as driveApi from '../api/drive';
import { OAuth2Client } from 'google-auth-library';

export class SlidesController {
  constructor(private auth: OAuth2Client) {}

  async getPresentations() {
    return driveApi.listFiles(this.auth, 'application/vnd.google-apps.presentation');
  }

  async getPresentationMetadata(fileId: string) {
    return driveApi.getFileMetadata(this.auth, fileId);
  }

  async exportPresentation(fileId: string): Promise<Buffer | null> {
    try {
      const pdfBuffer = await driveApi.exportSlides(this.auth, fileId);
      return Buffer.from(pdfBuffer as ArrayBuffer);
    } catch (error) {
      console.error('Error exporting presentation:', error);
      return null;
    }
  }
}