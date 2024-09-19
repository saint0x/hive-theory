import { google, slides_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const slides = google.slides({ version: 'v1' });

interface Presentation {
  presentationId: string;
  title: string;
  slides: Array<{
    objectId: string;
    title?: string;
  }>;
}

type UpdateResponse = slides_v1.Schema$BatchUpdatePresentationResponse;

export async function getPresentation(auth: OAuth2Client, presentationId: string): Promise<Presentation> {
  try {
    const response = await slides.presentations.get({
      auth,
      presentationId,
    });
    return response.data as Presentation;
  } catch (error) {
    console.error('Error fetching presentation:', error);
    throw new Error('Failed to fetch presentation');
  }
}

export async function updateSlideContent(
  auth: OAuth2Client,
  presentationId: string,
  pageObjectId: string,
  elementId: string,
  content: string | { url: string },
  isImage: boolean
): Promise<UpdateResponse> {
  try {
    const requests: slides_v1.Schema$Request[] = [];

    if (isImage) {
      requests.push({
        replaceImage: {
          imageObjectId: elementId,
          imageReplaceMethod: 'CENTER_INSIDE',
          url: (content as { url: string }).url,
        },
      });
    } else {
      requests.push({
        insertText: {
          objectId: elementId,
          insertionIndex: 0,
          text: content as string,
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

export async function createPlaceholder(
  auth: OAuth2Client,
  presentationId: string,
  pageObjectId: string,
  placeholderType: 'TEXT' | 'IMAGE',
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> {
  try {
    const requests: slides_v1.Schema$Request[] = [{
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

    const createShapeReply = response.data.replies?.find(reply => reply.createShape);
    return createShapeReply?.createShape?.objectId || '';
  } catch (error) {
    console.error('Error creating placeholder:', error);
    throw new Error('Failed to create placeholder');
  }
}