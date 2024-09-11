import { Hono } from 'hono';
import { google } from 'googleapis';
import { getAuthClient } from '../utils/googleAuth'

const slides = new Hono();

slides.get('/slides/:presentationId', async (c) => {
  const presentationId = c.req.param('presentationId');
  const auth = await getAuthClient();
  const slidesApi = google.slides({ version: 'v1', auth });

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
  const auth = await getAuthClient();
  const slidesApi = google.slides({ version: 'v1', auth });

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
  const auth = await getAuthClient();
  const slidesApi = google.slides({ version: 'v1', auth });

  try {
    const requests = [
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
              fontSize: transform.fontSize ? { magnitude: transform.fontSize, unit: 'PT' } : null,
              foregroundColor: transform.color ? { color: transform.color } : null,
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
  const auth = await getAuthClient();
  const slidesApi = google.slides({ version: 'v1', auth });

  try {
    const requests = [
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