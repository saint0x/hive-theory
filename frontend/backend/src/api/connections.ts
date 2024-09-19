import { OAuth2Client } from 'google-auth-library';
import * as sheetsApi from './sheets';
import * as slidesApi from './slides';

interface Connection {
  id: string;
  sheetId: string;
  slideId: string;
  sheetRange: string;
  slideElementId: string;
  isImage: boolean;
}

// This would typically be stored in a database
let connections: Connection[] = [];

export async function createConnection(
  auth: OAuth2Client,
  sheetId: string,
  slideId: string,
  sheetRange: string,
  slidePageId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  isImage: boolean
): Promise<Connection> {
  try {
    const placeholderType = isImage ? 'IMAGE' : 'TEXT';
    const slideElementId = await slidesApi.createPlaceholder(auth, slideId, slidePageId, placeholderType, x, y, width, height);

    const connection: Connection = {
      id: `connection_${Date.now()}`,
      sheetId,
      slideId,
      sheetRange,
      slideElementId,
      isImage,
    };

    connections.push(connection);

    // Perform initial sync
    await syncConnection(auth, connection);

    return connection;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw new Error('Failed to create connection');
  }
}

export async function syncConnection(auth: OAuth2Client, connection: Connection): Promise<void> {
  try {
    const sheetValues = await sheetsApi.getSpreadsheetValues(auth, connection.sheetId, connection.sheetRange);
    const content = sheetValues[0][0]; // Assuming single cell

    if (connection.isImage) {
      // Assuming the cell contains an image URL
      await slidesApi.updateSlideContent(auth, connection.slideId, '', connection.slideElementId, { url: content }, true);
    } else {
      await slidesApi.updateSlideContent(auth, connection.slideId, '', connection.slideElementId, content, false);
    }
  } catch (error) {
    console.error('Error syncing connection:', error);
    throw new Error('Failed to sync connection');
  }
}

export async function syncAllConnections(auth: OAuth2Client): Promise<void> {
  for (const connection of connections) {
    await syncConnection(auth, connection);
  }
}

export function getConnections(): Connection[] {
  return connections;
}