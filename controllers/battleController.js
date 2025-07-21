import express from "express";
import battleService from "../services/battleService.js";

const router = express.Router();

/**
 * @swagger
 * /battles:
 *   get:
 *     summary: Obtiene todas las batallas
 *     tags: [Batallas]
 *     responses:
 *       200:
 *         description: Lista de batallas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Battle'
 *   post:
 *     summary: Agrega una nueva batalla
 *     tags: [Batallas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BattleInput'
 *     responses:
 *       201:
 *         description: Batalla creada
 *       400:
 *         description: Heroe o villano no encontrado
 *
 * /battles/{id}:
 *   put:
 *     summary: Edita una batalla
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la batalla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BattleInput'
 *     responses:
 *       200:
 *         description: Batalla actualizada
 *       404:
 *         description: Batalla, héroe o villano no encontrado
 *   delete:
 *     summary: Elimina una batalla
 *     tags: [Batallas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la batalla
 *     responses:
 *       200:
 *         description: Batalla eliminada
 *       404:
 *         description: Batalla no encontrada
 *
 * components:
 *   schemas:
 *     Battle:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         heroAlias:
 *           type: string
 *         villainAlias:
 *           type: string
 *     BattleInput:
 *       type: object
 *       properties:
 *         heroAlias:
 *           type: string
 *         villainAlias:
 *           type: string
 */

// GET todas las batallas
router.get("/", async (req, res) => {
    try {
        const battles = await battleService.getAllBattles();
        res.json(battles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST nueva batalla
router.post("/", async (req, res) => {
    try {
        const { heroAlias, villainAlias } = req.body;
        const newBattle = await battleService.addBattle({ heroAlias, villainAlias });
        res.status(201).json(newBattle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT editar batalla
router.put("/:id", async (req, res) => {
    try {
        const { heroAlias, villainAlias } = req.body;
        const updatedBattle = await battleService.updateBattle(req.params.id, { heroAlias, villainAlias });
        res.json(updatedBattle);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE eliminar batalla
router.delete("/:id", async (req, res) => {
    try {
        const result = await battleService.deleteBattle(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;
