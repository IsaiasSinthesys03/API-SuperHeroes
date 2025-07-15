import express from 'express';
import fs from 'fs-extra';
import { obtenerEnfrentamientoActivo, buscarPersonajePorAlias, ganadorRound2, registrarGanadorRound3 } from '../services/roundService.js';
const router = express.Router();
const accionFile = './data/AccionRound3.json';
const enfrentamientosFile = './data/enfrentamientos.json';

/**
 * @swagger
 * /round3jugador2/estados-vida:
 *   get:
 *     summary: Estado de vida del personaje 3 del Jugador 2
 *     responses:
 *       200:
 *         description: Estado de vida actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alias:
 *                   type: string
 *                 vida:
 *                   type: integer
 *
 * /round3jugador2/acciones:
 *   get:
 *     summary: Acciones del Jugador 2 en Round 3
 *     responses:
 *       200:
 *         description: Lista de acciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *
 * /round3jugador2/atacar:
 *   post:
 *     summary: Atacar en Round 3 (Jugador 2)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AccionRound3:
 *                 type: string
 *                 enum: [Golpear, Usar habilidad]
 *     responses:
 *       201:
 *         description: Acción registrada o mensaje de victoria/derrota
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 */

router.get('/round3jugador2/estados-vida', async (req, res) => {
  const enf = await obtenerEnfrentamientoActivo();
  res.json({
    alias: enf.AliasPersonaje2_3,
    vida: enf.VidaPersonaje2_3
  });
});

router.get('/round3jugador2/acciones', async (req, res) => {
  const acciones = await fs.readJson(accionFile);
  res.json(acciones.filter(a => a.jugador === 2));
});

router.post('/round3jugador2/atacar', async (req, res) => {
  try {
    if (!await ganadorRound2()) {
      return res.status(400).json({ error: 'No se puede usar esta accion hasta establecer un ganador en el Round 2' });
    }
    const enf = await obtenerEnfrentamientoActivo();
    const acciones = await fs.readJson(accionFile);
    if (enf.VidaPersonaje2_3 === 0) {
      return res.status(400).json({ mensaje: 'YOU LOSE', detalle: 'El Round 3 ha concluido, Fin de la pelea.' });
    }
    if (enf.VidaPersonaje1_3 === 0) {
      return res.status(400).json({ mensaje: 'YOU WIN', detalle: 'El Round 3 ha concluido, Fin de la pelea.' });
    }
    if (acciones.length > 0 && acciones[acciones.length - 1].jugador === 2) {
      return res.status(400).json({ error: 'No es tu turno, espera a que el primer jugador realice su turno' });
    }
    const alias2 = enf.AliasPersonaje2_3;
    const alias1 = enf.AliasPersonaje1_3;
    const personaje2 = await buscarPersonajePorAlias(alias2);
    const personaje1 = await buscarPersonajePorAlias(alias1);
    if (!personaje2 || !personaje1) {
      return res.status(400).json({ error: 'No se encontró el personaje en superheroes.json ni villains.json' });
    }
    let lastHabilidadIndex = -1;
    for (let i = acciones.length - 1; i >= 0; i--) {
      if (acciones[i].ID_Equipo1 === enf.ID_Equipo1 && acciones[i].jugador === 2 && acciones[i].AccionRound3 === 'Usar habilidad') {
        lastHabilidadIndex = i;
        break;
      }
    }
    let golpesDesdeUltimaHabilidad = 0;
    for (let i = acciones.length - 1; i > lastHabilidadIndex; i--) {
      if (acciones[i].ID_Equipo1 === enf.ID_Equipo1 && acciones[i].jugador === 2 && acciones[i].AccionRound3 === 'Golpear') {
        golpesDesdeUltimaHabilidad++;
      }
    }
    if (req.body.AccionRound3 === 'Usar habilidad') {
      if (golpesDesdeUltimaHabilidad < 3) {
        return res.status(400).json({ error: 'No se puede utilizar habilidad si no se han realizado 3 golpes basicos.' });
      }
    }
    let golpeIndex = acciones.filter(a => a.ID_Equipo1 === enf.ID_Equipo1 && a.jugador === 2 && a.AccionRound3 === 'Golpear').length % 3;
    let danoBase = 0;
    let mensaje = '';
    if (req.body.AccionRound3 === 'Golpear') {
      const golpes = [personaje2.golpeBasico1, personaje2.golpeBasico2, personaje2.golpeBasico3];
      danoBase = golpes[golpeIndex];
      mensaje = 'Se ha golpeado al enemigo';
    } else {
      danoBase = personaje2.danoHabilidad;
      mensaje = `Se ha activado la habilidad ${personaje2.nombreHabilidad}`;
    }
    let danoCritico = danoBase;
    if (Math.random() * 100 < personaje2.probCrit) {
      danoCritico += danoBase * (personaje2.danoCrit / 100);
    }
    let danoConPoder = danoCritico + (danoCritico * (personaje2.poder / 10));
    let defensaEnemigo = personaje1.defensa || 0;
    let defensaPorcentaje = defensaEnemigo / 20;
    let vidaRestada = danoConPoder - (danoConPoder * defensaPorcentaje);
    vidaRestada = Math.round(vidaRestada);
    enf.VidaPersonaje1_3 = Math.max(0, enf.VidaPersonaje1_3 - vidaRestada);
    const nuevaAccion = {
      TurnoRound3: acciones.length + 1,
      ID_Equipo1: enf.ID_Equipo1,
      AccionRound3: req.body.AccionRound3,
      DañoRealizadoRound3: Math.round(danoConPoder),
      VidaRestadaEnemigoRound3: vidaRestada,
      jugador: 2
    };
    acciones.push(nuevaAccion);
    await fs.writeJson(accionFile, acciones);
    const enfrentamientos = await fs.readJson(enfrentamientosFile);
    enfrentamientos[0].VidaPersonaje1_3 = enf.VidaPersonaje1_3;
    await fs.writeJson(enfrentamientosFile, enfrentamientos);
    if (enf.VidaPersonaje1_3 === 0) {
      await registrarGanadorRound3(2);
      return res.status(201).json({ mensaje: 'YOU WIN', detalle: 'El Round 3 ha concluido, Fin de la pelea.', accion: nuevaAccion });
    }
    res.status(201).json({ mensaje, accion: nuevaAccion });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar la acción', detalle: e.message });
  }
});

export default router;
