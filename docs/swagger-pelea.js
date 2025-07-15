/**
 * @swagger
 * components:
 *   schemas:
 *     Pelea:
 *       type: object
 *       properties:
 *         round:
 *           type: integer
 *           description: Número de round (debería ser 1, 2 o 3)
 *         ganador:
 *           type: integer
 *           description: Número de jugador ganador del round (1 o 2)
 *
 * /pelea:
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
