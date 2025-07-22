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
router.get("/", async (req, res) => {
    try {
        const username = req.user?.username;
        if (!username) return res.status(401).json({ error: 'No autenticado' });
        const equipos = await equipoService.getAllEquipos(username);
        // Limpiar la respuesta para mostrar solo los campos requeridos
        const cleanEquipos = equipos.map(e => ({
            id: e.id,
            Heroe_O_Villano1: e.Heroe_O_Villano1,
            AliasPersonaje1: e.AliasPersonaje1,
            Heroe_O_Villano2: e.Heroe_O_Villano2,
            AliasPersonaje2: e.AliasPersonaje2,
            Heroe_O_Villano3: e.Heroe_O_Villano3,
            AliasPersonaje3: e.AliasPersonaje3
        }));
        res.json(cleanEquipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Agregar Equipos
router.post("/", async (req, res) => {
    try {
        const username = req.user?.username;
        if (!username) return res.status(401).json({ error: 'No autenticado' });
        const equipo = req.body;
        const newEquipo = await equipoService.addEquipo(equipo, username);
        res.status(201).json(newEquipo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Eliminar Equipo por ID
router.delete("/:id", async (req, res) => {
    try {
        const username = req.user?.username;
        if (!username) return res.status(401).json({ error: 'No autenticado' });
        const { id } = req.params;
        const result = await equipoService.deleteEquipo(id, username);
        if (result && result.deletedCount > 0) {
            res.json({ mensaje: "Se ha borrado el Equipo con exito" });
        } else {
            res.status(403).json({ error: "No tienes permiso para eliminar este equipo o no existe" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
