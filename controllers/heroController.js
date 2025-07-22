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

// GET / - Solo los del usuario
router.get('/', async (req, res) => {
  try {
    const username = req.user?.username;
    console.log('GET /heroes username:', username);
    if (!username) return res.status(401).json({ error: 'No autenticado' });
    const heroes = await heroService.getAllHeroes(username);
    console.log('GET /heroes resultado:', heroes);
    res.json(heroes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /heroes - Asociar al usuario
router.post('/heroes', async (req, res) => {
  try {
    const username = req.user.username;
    const heroData = { ...req.body, username };
    const hero = await heroRepository.saveHero(heroData);
    res.status(201).json(hero);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
    try {
        const heroes = await heroService.getAllHeroes();
        // Eliminar manualmente _id y __v de cada héroe
        const cleanHeroes = heroes.map(h => {
            const { _id, __v, ...rest } = h;
            return rest;
        });
        res.json(cleanHeroes);
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
            if (typeof vida === 'undefined' || vida === null) vida = 100;
            if (vida > 200) vida = 200;
            // Agregar el username del usuario autenticado
            const username = req.user?.username;
            if (!username) return res.status(401).json({ error: 'No autenticado' });
            const heroData = { name, alias, city, team, golpeBasico1, golpeBasico2, golpeBasico3, danoCrit, probCrit, nombreHabilidad, danoHabilidad, poder, defensa, vida };
            const addedHero = await heroService.addHero(heroData, username);
            res.status(201).json(addedHero);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

router.put('/:id', async (req, res) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: 'No autenticado' });
    // Buscar el héroe por id y username
    const heroes = await heroService.getAllHeroes(username);
    const hero = heroes.find(h => h.id === parseInt(req.params.id));
    if (!hero) {
      return res.status(403).json({ error: 'No tienes permiso para editar este héroe.' });
    }
    const updatedHero = await heroService.updateHero(req.params.id, req.body);
    res.json(updatedHero);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: 'No autenticado' });
    // Buscar el héroe por id y username
    const heroes = await heroService.getAllHeroes(username);
    const hero = heroes.find(h => h.id === parseInt(req.params.id));
    if (!hero) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este héroe.' });
    }
    const result = await heroService.deleteHero(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/city/:city', async (req, res) => {
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

router.post('/:id/enfrentar', async (req, res) => {
  try {
    const result = await heroService.faceVillain(req.params.id, req.body.villainId);
    res.json({ message: result });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
