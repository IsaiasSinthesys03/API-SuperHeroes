
import express from 'express';
import peleasRepository from '../repositories/peleasRepository.js';
const router = express.Router();

/**
 * @swagger
 * /estadisticas:
 *   get:
 *     summary: Obtener estadísticas de peleas
 *     description: Devuelve el contenido completo de Peleas.json
 *     tags: [Estadisticas]
 *     responses:
 *       200:
 *         description: Lista de estadísticas de peleas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const data = await peleasRepository.getAllPeleas();
    // Solo mostrar id, round1, round2, round3 y Ganador
    const simple = data.map(p => {
      let j1 = 0, j2 = 0;
      if (p.round1 === 'Jugador 1') j1++;
      if (p.round1 === 'Jugador 2') j2++;
      if (p.round2 === 'Jugador 1') j1++;
      if (p.round2 === 'Jugador 2') j2++;
      if (p.round3 === 'Jugador 1') j1++;
      if (p.round3 === 'Jugador 2') j2++;
      let Ganador = null;
      if (j1 > j2) Ganador = 'Jugador 1';
      else if (j2 > j1) Ganador = 'Jugador 2';
      else if (j1 === j2 && (j1 > 0 || j2 > 0)) Ganador = 'Empate';
      return { id: p.id, round1: p.round1, round2: p.round2, round3: p.round3, Ganador };
    });
    res.json(simple);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
