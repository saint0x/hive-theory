import { Hono } from 'hono';
import { sheets_v4, slides_v1 } from 'googleapis';
import { getAuthClient } from '../utils/googleAuth';

const syncRouter = new Hono();

syncRouter.post('/sync', async (c) => {
  const { spreadsheetId, presentationId, mappings } = await c.req.json();
  const auth = await getAuthClient();
  const sheetsApi = new sheets_v4.Sheets({ auth });
  const slidesApi = new slides_v1.Slides({ auth });

  try {
    const updates: slides_v1.Schema$Request[] = [];

    for (const mapping of mappings) {
      const { sheetRange, slideObjectId, type, transform } = mapping;
      
      // Fetch data from Sheets
      const sheetResponse = await sheetsApi.spreadsheets.values.get({
        spreadsheetId,
        range: sheetRange,
      });
      
      const cellValue = sheetResponse.data.values?.[0]?.[0];

      if (cellValue === undefined) {
        console.warn(`No value found for range: ${sheetRange}`);
        continue;
      }

      // Update Slides based on type (text or image)
      if (type === 'text') {
        updates.push({
          deleteText: {
            objectId: slideObjectId,
            textRange: { type: 'ALL' }
          }
        });
        updates.push({
          insertText: {
            objectId: slideObjectId,
            insertionIndex: 0,
            text: cellValue,
          },
        });

        // Add text style updates if provided
        if (transform && (transform.fontSize || transform.color)) {
          updates.push({
            updateTextStyle: {
              objectId: slideObjectId,
              textRange: { type: 'ALL' },
              style: {
                fontSize: transform.fontSize ? { magnitude: transform.fontSize, unit: 'PT' } : undefined,
                foregroundColor: transform.color ? { color: transform.color } : undefined,
              },
              fields: 'fontSize,foregroundColor',
            },
          });
        }
      } else if (type === 'image') {
        updates.push({
          replaceImage: {
            imageObjectId: slideObjectId,
            imageReplaceMethod: 'CENTER_INSIDE',
            url: cellValue,
          },
        });
      }

      // Add position/size updates if provided
      if (transform && (transform.translateX !== undefined || transform.translateY !== undefined || transform.width !== undefined || transform.height !== undefined)) {
        updates.push({
          updatePageElementTransform: {
            objectId: slideObjectId,
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
    }

    // Apply all updates to the presentation
    const slidesResponse = await slidesApi.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: updates,
      },
    });

    return c.json({ message: 'Sync completed successfully', updates: slidesResponse.data });
  } catch (error) {
    console.error('Error during sync:', error);
    return c.json({ error: 'Failed to sync data' }, 500);
  }
});

export default syncRouter;