/**
 * @swagger
 * /enfrentamientos:
 *   get:
 *     summary: Mostrar todos los enfrentamientos
 *     tags: [Enfrentamientos]
 *     responses:
 *       200:
 *         description: Lista de enfrentamientos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enfrentamiento'
 *   post:
 *     summary: Agregar un nuevo enfrentamiento
 *     tags: [Enfrentamientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnfrentamientoInput'
 *     responses:
 *       201:
 *         description: Enfrentamiento creado
 *       400:
 *         description: Error de validación
 * /enfrentamientos/{id}:
 *   delete:
 *     summary: Eliminar un enfrentamiento por ID
 *     tags: [Enfrentamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del enfrentamiento
 *     responses:
 *       200:
 *         description: Enfrentamiento eliminado
 *       404:
 *         description: Enfrentamiento no encontrado
 * components:
 *   schemas:
 *     Enfrentamiento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         ID_Equipo1:
 *           type: integer
 *         AliasPersonaje1_1:
 *           type: string
 *         VidaPersonaje1_1:
 *           type: integer
 *         AliasPersonaje1_2:
 *           type: string
 *         VidaPersonaje1_2:
 *           type: integer
 *         AliasPersonaje1_3:
 *           type: string
 *         VidaPersonaje1_3:
 *           type: integer
 *         ID_Equipo2:
 *           type: integer
 *         AliasPersonaje2_1:
 *           type: string
 *         VidaPersonaje2_1:
 *           type: integer
 *         AliasPersonaje2_2:
 *           type: string
 *         VidaPersonaje2_2:
 *           type: integer
 *         AliasPersonaje2_3:
 *           type: string
 *         VidaPersonaje2_3:
 *           type: integer
 *     EnfrentamientoInput:
 *       type: object
 *       properties:
 *         ID_Equipo1:
 *           type: integer
 *         ID_Equipo2:
 *           type: integer
 */
import express from "express";
import enfrentamientoService from "../services/enfrentamientoService.js";

const router = express.Router();

// GET - Mostrar Enfrentamientos
router.get("/", async (req, res) => {
    try {
        const username = req.user?.username;
        if (!username) return res.status(401).json({ error: 'No autenticado' });
        const enfrentamientos = await enfrentamientoService.getAllEnfrentamientos(username);
        // Convertir a objeto plano usando toJSON para aplicar el transform del schema
        const cleanEnfrentamientos = enfrentamientos.map(e => {
            const obj = e.toJSON ? e.toJSON() : e;
            const { _id, __v, ...rest } = obj;
            return rest;
        });
        res.json(cleanEnfrentamientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Agregar Enfrentamiento
router.post("/", async (req, res) => {
    try {
        const username = req.user?.username;
        if (!username) return res.status(401).json({ error: 'No autenticado' });
        const data = req.body;
        const newEnfrentamiento = await enfrentamientoService.addEnfrentamiento(data, username);
        res.status(201).json(newEnfrentamiento);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Eliminar Enfrentamiento por ID
router.delete("/:id", async (req, res) => {
    try {
        const username = req.user?.username;
        if (!username) return res.status(401).json({ error: 'No autenticado' });
        const { id } = req.params;
        const result = await enfrentamientoService.deleteEnfrentamiento(id, username);
        if (result && result.message) {
            res.json({ mensaje: result.message });
        } else {
            res.status(403).json({ error: "No tienes permiso para eliminar este enfrentamiento o no existe" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
