const { OAuth2Client } = require('google-auth-library');
const sheetsApi = require('./sheets');
const slidesApi = require('./slides');

// This would typically be stored in a database
let connections = [];

async function createConnection(
  auth,
  sheetId,
  slideId,
  sheetRange,
  slidePageId,
  x,
  y,
  width,
  height,
  isImage
) {
  try {
    const placeholderType = isImage ? 'IMAGE' : 'TEXT';
    const slideElementId = await slidesApi.createPlaceholder(auth, slideId, slidePageId, placeholderType, x, y, width, height);

    const connection = {
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

async function syncConnection(auth, connection) {
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

async function syncAllConnections(auth) {
  for (const connection of connections) {
    await syncConnection(auth, connection);
  }
}

function getConnections() {
  return connections;
}

module.exports = {
  createConnection,
  syncConnection,
  syncAllConnections,
  getConnections
};