import { Request, Response, Router } from 'express';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint to check if API is running
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/', (_req: Request, res: Response) => {
  res.send('Song Guesser API is running');
});

export default router;
