const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const slides = google.slides({ version: 'v1' });

async function getPresentation(auth, presentationId) {
  try {
    const response = await slides.presentations.get({
      auth,
      presentationId,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching presentation:', error);
    throw new Error('Failed to fetch presentation');
  }
}

async function updateSlideContent(
  auth,
  presentationId,
  pageObjectId,
  elementId,
  content,
  isImage
) {
  try {
    const requests = [];

    if (isImage) {
      requests.push({
        replaceImage: {
          imageObjectId: elementId,
          imageReplaceMethod: 'CENTER_INSIDE',
          url: content.url,
        },
      });
    } else {
      requests.push({
        insertText: {
          objectId: elementId,
          insertionIndex: 0,
          text: content,
        },
      }, {
        deleteText: {
          objectId: elementId,
          textRange: {
            type: 'ALL',
          },
        },
      });
    }

    const response = await slides.presentations.batchUpdate({
      auth,
      presentationId,
      requestBody: {
        requests,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating slide content:', error);
    throw new Error('Failed to update slide content');
  }
}

async function createPlaceholder(
  auth,
  presentationId,
  pageObjectId,
  placeholderType,
  x,
  y,
  width,
  height
) {
  try {
    const requests = [{
      createShape: {
        objectId: `placeholder_${Date.now()}`,
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: pageObjectId,
          size: {
            width: { magnitude: width, unit: 'PT' },
            height: { magnitude: height, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: x,
            translateY: y,
            unit: 'PT',
          },
        },
      },
    }];

    if (placeholderType === 'TEXT') {
      requests.push({
        insertText: {
          objectId: `placeholder_${Date.now()}`,
          insertionIndex: 0,
          text: 'Placeholder Text',
        },
      });
    }

    const response = await slides.presentations.batchUpdate({
      auth,
      presentationId,
      requestBody: {
        requests,
      },
    });

    const createShapeReply = response.data.replies && response.data.replies.find(reply => reply.createShape);
    return createShapeReply && createShapeReply.createShape && createShapeReply.createShape.objectId || '';
  } catch (error) {
    console.error('Error creating placeholder:', error);
    throw new Error('Failed to create placeholder');
  }
}

module.exports = {
  getPresentation,
  updateSlideContent,
  createPlaceholder
};