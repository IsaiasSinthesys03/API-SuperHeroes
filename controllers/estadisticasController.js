
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
router.get('/', async (req, res) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: 'No autenticado' });
    const data = await peleasRepository.getAllPeleas();
    // Filtrar solo las peleas del usuario autenticado
    const userPeleas = data.filter(p => p.username === username);
    // Verificar si hay al menos una pelea con los 3 rounds completados y un ganador
    const peleaFinalizada = userPeleas.find(p => p.Round1 && p.Round2 && p.Round3 && p.Ganador);
    if (!peleaFinalizada) {
      return res.status(403).json({ error: 'Error, No se ha concluido el enfrentamiento' });
    }
    // Mostrar solo las peleas finalizadas
    const simple = userPeleas.filter(p => p.Round1 && p.Round2 && p.Round3 && p.Ganador).map(p => ({
      id: p.id,
      Round1: p.Round1,
      Round2: p.Round2,
      Round3: p.Round3,
      Ganador: p.Ganador
    }));
    res.json(simple);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
