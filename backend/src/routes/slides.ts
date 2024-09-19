import { Hono } from 'hono';
import { SlidesController } from '../controllers/slidesController';
import { OAuth2Client } from 'google-auth-library';

// Define the environment type
type Env = {
  auth: OAuth2Client;
};

const slidesRouter = new Hono<{ Bindings: Env }>();

slidesRouter.get('/presentations', async (c) => {
  const controller = new SlidesController(c.env.auth);
  const presentations = await controller.getPresentations();
  return c.json(presentations);
});

slidesRouter.get('/presentations/:id', async (c) => {
  const controller = new SlidesController(c.env.auth);
  const { id } = c.req.param();
  const metadata = await controller.getPresentationMetadata(id);
  return c.json(metadata);
});

slidesRouter.get('/presentations/:id/export', async (c) => {
  const controller = new SlidesController(c.env.auth);
  const { id } = c.req.param();
  const pdfBuffer = await controller.exportPresentation(id);
  if (!pdfBuffer) {
    return c.json({ error: 'Failed to export presentation' }, 500);
  }
  return c.body(pdfBuffer as Buffer, 200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="presentation-${id}.pdf"`,
  });
});

export default slidesRouter;