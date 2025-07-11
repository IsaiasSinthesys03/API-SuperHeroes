import express from "express";
import equipoService from "../services/equipoService.js";

const router = express.Router();

/**
 * @swagger
 * /equipos:
 *   get:
 *     summary: Mostrar todos los equipos
 *     tags: [Equipos]
 *     responses:
 *       200:
 *         description: Lista de equipos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipo'
 *   post:
 *     summary: Agregar un nuevo equipo
 *     tags: [Equipos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EquipoInput'
 *     responses:
 *       201:
 *         description: Equipo creado
 *       400:
 *         description: Error de validación
 * /equipos/{id}:
 *   delete:
 *     summary: Eliminar un equipo por ID
 *     tags: [Equipos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del equipo
 *     responses:
 *       200:
 *         description: Equipo eliminado
 *       404:
 *         description: Equipo no encontrado
 * components:
 *   schemas:
 *     Equipo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         Heroe_O_Villano1:
 *           type: string
 *           enum: [heroe, villano]
 *         AliasPersonaje1:
 *           type: string
 *         Heroe_O_Villano2:
 *           type: string
 *           enum: [heroe, villano]
 *         AliasPersonaje2:
 *           type: string
 *         Heroe_O_Villano3:
 *           type: string
 *           enum: [heroe, villano]
 *         AliasPersonaje3:
 *           type: string
 *     EquipoInput:
 *       type: object
 *       properties:
 *         Heroe_O_Villano1:
 *           type: string
 *           enum: [heroe, villano]
 *         AliasPersonaje1:
 *           type: string
 *         Heroe_O_Villano2:
 *           type: string
 *           enum: [heroe, villano]
 *         AliasPersonaje2:
 *           type: string
 *         Heroe_O_Villano3:
 *           type: string
 *           enum: [heroe, villano]
 *         AliasPersonaje3:
 *           type: string
 */

// GET - Mostrar Equipos
router.get("/equipos", async (req, res) => {
    try {
        const equipos = await equipoService.getAllEquipos();
        res.json(equipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Agregar Equipos
router.post("/equipos", async (req, res) => {
    try {
        const equipo = req.body;
        const newEquipo = await equipoService.addEquipo(equipo);
        res.status(201).json(newEquipo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Eliminar Equipo por ID
router.delete("/equipos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await equipoService.deleteEquipo(id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;
