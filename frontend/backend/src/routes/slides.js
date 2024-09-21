const { Hono } = require('hono');
const { SlidesController } = require('../controllers/slidesController');
const { google } = require('googleapis');

const slidesRouter = new Hono();

slidesRouter.get('/presentations', async (c) => {
  const auth = c.get('auth');
  const controller = new SlidesController(auth);
  try {
    const presentations = await controller.getPresentations();
    return c.json(presentations);
  } catch (error) {
    console.error('Error fetching presentations:', error);
    return c.json({ error: 'Failed to fetch presentations' }, 500);
  }
});

slidesRouter.get('/presentations/:id', async (c) => {
  const auth = c.get('auth');
  const controller = new SlidesController(auth);
  const { id } = c.req.param();
  try {
    const metadata = await controller.getPresentationMetadata(id);
    return c.json(metadata);
  } catch (error) {
    console.error(`Error fetching metadata for presentation ${id}:`, error);
    return c.json({ error: 'Failed to fetch presentation metadata' }, 500);
  }
});

slidesRouter.get('/presentations/:id/export', async (c) => {
  const auth = c.get('auth');
  const controller = new SlidesController(auth);
  const { id } = c.req.param();
  try {
    const pdfBuffer = await controller.exportPresentation(id);
    if (!pdfBuffer) {
      return c.json({ error: 'Failed to export presentation' }, 500);
    }
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `attachment; filename="presentation-${id}.pdf"`);
    return c.body(pdfBuffer);
  } catch (error) {
    console.error(`Error exporting presentation ${id}:`, error);
    return c.json({ error: 'Failed to export presentation' }, 500);
  }
});

slidesRouter.post('/presentations/:id/update', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  const { updates } = await c.req.json();

  try {
    const slides = google.slides({ version: 'v1', auth });
    
    const requests = updates.map(update => ({
      insertText: {
        objectId: update.elementId,
        insertionIndex: 0,
        text: update.content
      }
    }));

    await slides.presentations.batchUpdate({
      presentationId: id,
      requestBody: {
        requests: requests
      }
    });

    return c.json({ message: 'Presentation updated successfully' });
  } catch (error) {
    console.error(`Error updating presentation ${id}:`, error);
    return c.json({ error: 'Failed to update presentation' }, 500);
  }
});

slidesRouter.post('/presentations/:id/create-placeholder', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  const { pageId, x, y, width, height } = await c.req.json();

  try {
    const slides = google.slides({ version: 'v1', auth });
    
    const response = await slides.presentations.batchUpdate({
      presentationId: id,
      requestBody: {
        requests: [{
          createShape: {
            objectId: `placeholder_${Date.now()}`,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageId,
              size: {
                width: { magnitude: width, unit: 'PT' },
                height: { magnitude: height, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: x,
                translateY: y,
                unit: 'PT'
              }
            }
          }
        }]
      }
    });

    const placeholderId = response.data.replies[0].createShape.objectId;
    return c.json({ placeholderId });
  } catch (error) {
    console.error(`Error creating placeholder in presentation ${id}:`, error);
    return c.json({ error: 'Failed to create placeholder' }, 500);
  }
});

module.exports = slidesRouter;