import express from 'express';
import fs from 'fs-extra';
const router = express.Router();

// Utilidad para obtener el resultado de un jugador en un round
async function getResultado(round, jugador) {
  const peleas = await fs.readJson('./data/Peleas.json');
  const resultado = peleas.find(p => p.round === round);
  if (!resultado) return { mensaje: 'Aún no hay resultado para este round.' };
  if (resultado.ganador === jugador) {
    return { mensaje: 'YOU WIN', detalle: `Ganador del Round ${round}` };
  } else {
    return { mensaje: 'YOU LOSE', detalle: `Perdedor del Round ${round}` };
  }
}

/**
 * @swagger
 * /round1jugador1/resultados:
 *   get:
 *     summary: Resultado del Jugador 1 en Round 1
 *     responses:
 *       200:
 *         description: Resultado (YOU WIN o YOU LOSE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 detalle:
 *                   type: string
 * /round1jugador2/resultados:
 *   get:
 *     summary: Resultado del Jugador 2 en Round 1
 *     responses:
 *       200:
 *         description: Resultado (YOU WIN o YOU LOSE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 detalle:
 *                   type: string
 * /round2jugador1/resultados:
 *   get:
 *     summary: Resultado del Jugador 1 en Round 2
 *     responses:
 *       200:
 *         description: Resultado (YOU WIN o YOU LOSE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 detalle:
 *                   type: string
 * /round2jugador2/resultados:
 *   get:
 *     summary: Resultado del Jugador 2 en Round 2
 *     responses:
 *       200:
 *         description: Resultado (YOU WIN o YOU LOSE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 detalle:
 *                   type: string
 * /round3jugador1/resultados:
 *   get:
 *     summary: Resultado del Jugador 1 en Round 3
 *     responses:
 *       200:
 *         description: Resultado (YOU WIN o YOU LOSE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 detalle:
 *                   type: string
 * /round3jugador2/resultados:
 *   get:
 *     summary: Resultado del Jugador 2 en Round 3
 *     responses:
 *       200:
 *         description: Resultado (YOU WIN o YOU LOSE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 detalle:
 *                   type: string
 */

// Endpoints por round y jugador
router.get('/round1jugador1/resultados', async (req, res) => {
  res.json(await getResultado(1, 1));
});
router.get('/round1jugador2/resultados', async (req, res) => {
  res.json(await getResultado(1, 2));
});
router.get('/round2jugador1/resultados', async (req, res) => {
  res.json(await getResultado(2, 1));
});
router.get('/round2jugador2/resultados', async (req, res) => {
  res.json(await getResultado(2, 2));
});
router.get('/round3jugador1/resultados', async (req, res) => {
  res.json(await getResultado(3, 1));
});
router.get('/round3jugador2/resultados', async (req, res) => {
  res.json(await getResultado(3, 2));
});

export default router;
