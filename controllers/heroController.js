/**
 * @swagger
 * /heroes:
 *   get:
 *     summary: Obtiene todos los héroes
 *     tags: [Héroes]
 *     responses:
 *       200:
 *         description: Lista de héroes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hero'
 *   post:
 *     summary: Agrega un nuevo héroe
 *     tags: [Héroes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HeroInput'
 *     responses:
 *       201:
 *         description: Héroe creado
 *       400:
 *         description: Datos inválidos
 *
 * /heroes/city/{city}:
 *   get:
 *     summary: Busca héroes por ciudad
 *     tags: [Héroes]
 *     parameters:
 *       - in: path
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: Ciudad a buscar
 *     responses:
 *       200:
 *         description: Lista de héroes de la ciudad
 *       404:
 *         description: Ciudad No Encontrada, Intentelo de Nuevo
 *
 * /heroes/{id}:
 *   put:
 *     summary: Actualiza un héroe
 *     tags: [Héroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del héroe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HeroInput'
 *     responses:
 *       200:
 *         description: Héroe actualizado
 *       404:
 *         description: Héroe no encontrado
 *   delete:
 *     summary: Elimina un héroe
 *     tags: [Héroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del héroe
 *     responses:
 *       200:
 *         description: Héroe eliminado
 *       404:
 *         description: Héroe no encontrado
 *
 * /heroes/{id}/enfrentar:
 *   post:
 *     summary: Enfrenta a un héroe con un villano
 *     tags: [Héroes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del héroe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               villainId:
 *                 type: integer
 *                 description: ID del villano
 *     responses:
 *       200:
 *         description: Resultado del enfrentamiento
 *       404:
 *         description: Héroe o villano no encontrado
 *
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
 *
 * components:
 *   schemas:
 *     Hero:
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
 *         danoCrit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         probCrit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         nombreHabilidad:
 *           type: string
 *           description: Nombre único de la habilidad especial del personaje. No puede repetirse entre héroes o villanos.
 *         danoHabilidad:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           description: Daño de la habilidad especial, debe estar entre 1 y 50.
 *         poder:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Poder del personaje, debe estar entre 1 y 10.
 *         defensa:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Defensa del personaje, debe estar entre 1 y 10.
 *     HeroInput:
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
 *         danoCrit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         probCrit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         nombreHabilidad:
 *           type: string
 *           description: Nombre único de la habilidad especial del personaje. No puede repetirse entre héroes o villanos.
 *         danoHabilidad:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           description: Daño de la habilidad especial, debe estar entre 1 y 50.
 *         poder:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Poder del personaje, debe estar entre 1 y 10.
 *         defensa:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Defensa del personaje, debe estar entre 1 y 10.
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
 *         danoCrit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         probCrit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         nombreHabilidad:
 *           type: string
 *           description: Nombre único de la habilidad especial del personaje. No puede repetirse entre héroes o villanos.
 *         danoHabilidad:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           description: Daño de la habilidad especial, debe estar entre 1 y 50.
 *         poder:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Poder del personaje, debe estar entre 1 y 10.
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
 *         danoCrit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         probCrit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         nombreHabilidad:
 *           type: string
 *           description: Nombre único de la habilidad especial del personaje. No puede repetirse entre héroes o villanos.
 *         danoHabilidad:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           description: Daño de la habilidad especial, debe estar entre 1 y 50.
 *         poder:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Poder del personaje, debe estar entre 1 y 10.
 */

import express from "express";
import { check, validationResult } from 'express-validator';
import heroService from "../services/heroService.js";
import Hero from "../models/heroModel.js";

const router = express.Router();

router.get("/heroes", async (req, res) => {
    try {
        const heroes = await heroService.getAllHeroes();
        res.json(heroes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/heroes",
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
            const { name, alias, city, team, golpeBasico1, golpeBasico2, golpeBasico3, danoCrit, probCrit, nombreHabilidad, danoHabilidad, poder, defensa } = req.body;
            const newHero = new Hero(null, name, alias, city, team, golpeBasico1, golpeBasico2, golpeBasico3, danoCrit, probCrit, nombreHabilidad, danoHabilidad, poder, defensa);
            const addedHero = await heroService.addHero(newHero);

            res.status(201).json(addedHero);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

router.put("/heroes/:id", async (req, res) => {
    try {
        const updatedHero = await heroService.updateHero(req.params.id, req.body);
        res.json(updatedHero);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.delete('/heroes/:id', async (req, res) => {
    try {
        const result = await heroService.deleteHero(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.get('/heroes/city/:city', async (req, res) => {
  try {
    const heroes = await heroService.findHeroesByCity(req.params.city);
    if (heroes.length === 0) {
      return res.status(404).json({ error: 'Ciudad No Encontrada, Intentelo de Nuevo' });
    }
    res.json(heroes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/heroes/:id/enfrentar', async (req, res) => {
  try {
    const result = await heroService.faceVillain(req.params.id, req.body.villainId);
    res.json({ message: result });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
