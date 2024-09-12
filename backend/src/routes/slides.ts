import { Hono } from 'hono';
import { google, slides_v1, Auth } from 'googleapis';
import { getAuthClient } from '../utils/googleAuth'

const slides = new Hono();

// Create a function to get the Slides API client
async function getSlidesApiClient(): Promise<slides_v1.Slides> {
  const auth = await getAuthClient() as Auth.OAuth2Client;
  return google.slides({ version: 'v1', auth });
}

slides.get('/slides/:presentationId', async (c) => {
  const presentationId = c.req.param('presentationId');
  const slidesApi = await getSlidesApiClient();

  try {
    const response = await slidesApi.presentations.get({
      presentationId,
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error fetching presentation:', error);
    return c.json({ error: 'Failed to fetch presentation' }, 500);
  }
});

slides.post('/slides/:presentationId/replaceText', async (c) => {
  const presentationId = c.req.param('presentationId');
  const { replaceText, text } = await c.req.json();
  const slidesApi = await getSlidesApiClient();

  try {
    const response = await slidesApi.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: [
          {
            replaceAllText: {
              containsText: { text: replaceText },
              replaceText: text,
            },
          },
        ],
      },
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error replacing text:', error);
    return c.json({ error: 'Failed to replace text' }, 500);
  }
});

slides.post('/slides/:presentationId/insertText', async (c) => {
  const presentationId = c.req.param('presentationId');
  const { objectId, text, transform } = await c.req.json();
  const slidesApi = await getSlidesApiClient();

  try {
    const requests: slides_v1.Schema$Request[] = [
      {
        insertText: {
          objectId,
          insertionIndex: 0,
          text,
        },
      },
    ];

    if (transform) {
      if (transform.fontSize || transform.color) {
        requests.push({
          updateTextStyle: {
            objectId,
            textRange: { type: 'ALL' },
            style: {
              fontSize: transform.fontSize ? { magnitude: transform.fontSize, unit: 'PT' } : undefined,
              foregroundColor: transform.color ? { opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } } } : undefined,
            },
            fields: 'fontSize,foregroundColor',
          },
        });
      }

      if (transform.translateX !== undefined || transform.translateY !== undefined) {
        requests.push({
          updatePageElementTransform: {
            objectId,
            applyMode: 'ABSOLUTE',
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: transform.translateX || 0,
              translateY: transform.translateY || 0,
              unit: 'PT',
            },
          },
        });
      }
    }

    const response = await slidesApi.presentations.batchUpdate({
      presentationId,
      requestBody: { requests },
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error inserting text:', error);
    return c.json({ error: 'Failed to insert text' }, 500);
  }
});

slides.post('/slides/:presentationId/insertImage', async (c) => {
  const presentationId = c.req.param('presentationId');
  const { objectId, imageUrl, transform } = await c.req.json();
  const slidesApi = await getSlidesApiClient();

  try {
    const requests: slides_v1.Schema$Request[] = [
      {
        createImage: {
          objectId,
          url: imageUrl,
          elementProperties: {
            pageObjectId: 'p', // Assuming first slide, update as needed
          },
        },
      },
    ];

    if (transform && (transform.translateX !== undefined || transform.translateY !== undefined || transform.width !== undefined || transform.height !== undefined)) {
      requests.push({
        updatePageElementTransform: {
          objectId,
          applyMode: 'ABSOLUTE',
          transform: {
            scaleX: transform.width ? transform.width / 100 : 1,
            scaleY: transform.height ? transform.height / 100 : 1,
            translateX: transform.translateX || 0,
            translateY: transform.translateY || 0,
            unit: 'PT',
          },
        },
      });
    }

    const response = await slidesApi.presentations.batchUpdate({
      presentationId,
      requestBody: { requests },
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error inserting image:', error);
    return c.json({ error: 'Failed to insert image' }, 500);
  }
});

export default slides;