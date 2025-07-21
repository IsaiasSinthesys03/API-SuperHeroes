import express from "express";
import { check, validationResult } from 'express-validator';
import villainService from "../services/villainService.js";
import Villain from "../models/villainModel.js";

const router = express.Router();

/**
 * @swagger
 * /villains:
 *   get:
 *     summary: Obtiene todos los villanos
 *     tags: [Villanos]
 *     responses:
 *       200:
 *         description: Lista de villanos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Villain'
 *   post:
 *     summary: Agrega un nuevo villano
 *     tags: [Villanos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VillainInput'
 *     responses:
 *       201:
 *         description: Villano creado
 *       400:
 *         description: Datos inválidos
 *
 * /villains/city/{city}:
 *   get:
 *     summary: Busca villanos por ciudad
 *     tags: [Villanos]
 *     parameters:
 *       - in: path
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: Ciudad a buscar
 *     responses:
 *       200:
 *         description: Lista de villanos de la ciudad
 *       404:
 *         description: Ciudad No Encontrada, Intentelo de Nuevo
 *
 * /villains/{id}:
 *   put:
 *     summary: Actualiza un villano
 *     tags: [Villanos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del villano
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VillainInput'
 *     responses:
 *       200:
 *         description: Villano actualizado
 *       404:
 *         description: Villano no encontrado
 *   delete:
 *     summary: Elimina un villano
 *     tags: [Villanos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del villano
 *     responses:
 *       200:
 *         description: Villano eliminado
 *       404:
 *         description: Villano no encontrado
 *
 * components:
 *   schemas:
 *     Villain:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         alias:
 *           type: string
 *         city:
 *           type: string
 *         team:
 *           type: string
 *         golpeBasico1:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         golpeBasico2:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         golpeBasico3:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         defensa:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Defensa del personaje, debe estar entre 1 y 10
 *     VillainInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         alias:
 *           type: string
 *         city:
 *           type: string
 *         team:
 *           type: string
 *         golpeBasico1:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         golpeBasico2:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         golpeBasico3:
 *           type: integer
 *           minimum: 0
 *           maximum: 15
 *         defensa:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Defensa del personaje, debe estar entre 1 y 10
 */

router.get("/", async (req, res) => {
    try {
        const villains = await villainService.getAllVillains();
        // Eliminar manualmente _id y __v de cada villano
        const cleanVillains = villains.map(v => {
            const { _id, __v, ...rest } = v;
            return rest;
        });
        res.json(cleanVillains);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/",
    [
        check('name').not().isEmpty().withMessage('El nombre es requerido'),
        check('alias').not().isEmpty().withMessage('El alias es requerido')
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ error : errors.array() });
        }

        try {
            let { name, alias, city, team, golpeBasico1, golpeBasico2, golpeBasico3, danoCrit, probCrit, nombreHabilidad, danoHabilidad, poder, defensa, vida } = req.body;
            // Si no se especifica vida, poner 100 por defecto
            if (typeof vida === 'undefined' || vida === null) vida = 100;
            // Limitar vida máxima a 200
            if (vida > 200) vida = 200;
            const newVillain = new Villain(null, name, alias, city, team, golpeBasico1, golpeBasico2, golpeBasico3, danoCrit, probCrit, nombreHabilidad, danoHabilidad, poder, defensa, vida);
            const addedVillain = await villainService.addVillain(newVillain);

            res.status(201).json(addedVillain);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedVillain = await villainService.updateVillain(req.params.id, req.body);
        res.json(updatedVillain);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await villainService.deleteVillain(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.get('/city/:city', async (req, res) => {
  try {
    const villains = await villainService.findVillainsByCity(req.params.city);
    if (villains.length === 0) {
      return res.status(404).json({ error: 'Ciudad No Encontrada, Intentelo de Nuevo' });
    }
    res.json(villains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
