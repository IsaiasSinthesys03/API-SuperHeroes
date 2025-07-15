import express from 'express';
import fs from 'fs-extra';
const router = express.Router();

/**
 * @swagger
 * /resultados:
 *   get:
 *     summary: Obtener historial de ganadores de rounds
 *     responses:
 *       200:
 *         description: Lista de ganadores por round
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pelea'
 */
router.get('/resultados', async (req, res) => {
  try {
    const peleas = await fs.readJson('./data/Peleas.json');
    res.json(peleas);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo leer el historial de peleas', detalle: e.message });
  }
});

export default router;
