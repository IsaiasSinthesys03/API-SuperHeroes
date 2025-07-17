import express from 'express';
import fs from 'fs-extra';
import path from 'path';


const router = express.Router();
const accionFile = path.resolve('./data/AccionRound2.json');
const peleasFile = path.resolve('./data/Peleas.json');
const enfrentamientosFile = path.resolve('./data/enfrentamientos.json');
const heroesFile = path.resolve('./data/superheroes.json');
const villainsFile = path.resolve('./data/villains.json');

// Utilidad para buscar personaje por alias en ambos json (case-insensitive)
async function buscarPersonajePorAlias(alias) {
  const heroes = await fs.readJson(heroesFile);
  const villains = await fs.readJson(villainsFile);
  return heroes.concat(villains).find(p => p.alias.toLowerCase() === alias.toLowerCase());
}

// Utilidad para obtener el enfrentamiento activo (primer registro)
async function obtenerEnfrentamientoActivo() {
  const enfrentamientos = await fs.readJson(enfrentamientosFile);
  return enfrentamientos[0];
}

// Utilidad para saber si ya hay ganador en el round 1
async function ganadorRound1() {
  const enf = await obtenerEnfrentamientoActivo();
  if (enf.VidaPersonaje1_1 === 0) return { ganador: 'Jugador 2', perdedor: 'Jugador 1' };
  if (enf.VidaPersonaje2_1 === 0) return { ganador: 'Jugador 1', perdedor: 'Jugador 2' };
  return null;
}

// Registrar resultado de round 2 en Peleas.json
async function registrarGanadorRound2() {
  const enf = await obtenerEnfrentamientoActivo();
  const peleas = await fs.readJson(peleasFile);
  let pelea = peleas.find(p => p.id === enf.id);
  if (!pelea) return; // No hay registro de round 1
  if (enf.VidaPersonaje1_2 === 0 && pelea.Round2_J1) return; // Ya registrado
  if (enf.VidaPersonaje2_2 === 0 && pelea.Round2_J2) return; // Ya registrado
  if (enf.VidaPersonaje1_2 === 0) {
    pelea.Round2_J1 = 'You Lose';
    pelea.Round2_J2 = 'You Win';
  } else if (enf.VidaPersonaje2_2 === 0) {
    pelea.Round2_J1 = 'You Win';
    pelea.Round2_J2 = 'You Lose';
  } else {
    return;
  }
  await fs.writeJson(peleasFile, peleas);
}

/**
 * @swagger
 * /round2jugador2/estados-vida:
 *   get:
 *     summary: Estados de Vida Jugador 2 Round 2
 *     description: Muestra el estado de vida de los personajes del round 2 para el jugador 2.
 *     tags: [Round2Jugador2]
 *     responses:
 *       200:
 *         description: Estados de vida actuales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 TuPersonaje:
 *                   type: string
 *                 Tuvida:
 *                   type: integer
 *                 TuEnemigo:
 *                   type: string
 *                 VidaEnemigo:
 *                   type: integer
 */
router.get('/round2jugador2/estados-vida', async (req, res) => {
  try {
    const enf = await obtenerEnfrentamientoActivo();
    // Restricción: solo si hay ganador en round 1
    if (!await ganadorRound1()) {
      return res.status(400).json({ error: 'No se puede usar esta accion hasta establecer un ganador en el Round 1' });
    }
    // Registro automático de resultado si la vida llega a 0 en round 2
    if (enf.VidaPersonaje1_2 === 0 || enf.VidaPersonaje2_2 === 0) {
      let Round2_J1, Round2_J2;
      if (enf.VidaPersonaje1_2 === 0) {
        Round2_J1 = 'You Lose';
        Round2_J2 = 'You Win';
      } else {
        Round2_J1 = 'You Win';
        Round2_J2 = 'You Lose';
      }

    }
    // Registro automático de resultado si la vida llega a 0 en round 2
    if (enf.VidaPersonaje1_2 === 0 || enf.VidaPersonaje2_2 === 0) {
      let round2_j1, round2_j2;
      if (enf.VidaPersonaje1_2 === 0) {
        round2_j1 = 'You Lose';
        round2_j2 = 'You Win';
      } else {
        round2_j1 = 'You Win';
        round2_j2 = 'You Lose';
      }
      const peleasService = await import('../services/peleasService.js');
      await peleasService.default.registrarRound({
        id: enf.id,
        round2: (round2_j2 === 'You Win') ? 'Jugador 2' : 'Jugador 1'
      });
    }
    res.json({
      TuPersonaje: enf.AliasPersonaje2_2,
      Tuvida: enf.VidaPersonaje2_2,
      TuEnemigo: enf.AliasPersonaje1_2,
      VidaEnemigo: enf.VidaPersonaje1_2
    });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el estado de vida.' });
  }
});

/**
 * @swagger
 * /round2jugador2/acciones:
 *   get:
 *     summary: Registro de Acciones Jugador 2 Round 2
 *     description: Muestra todas las acciones registradas por el jugador 2 en el round 2.
 *     tags: [Round2Jugador2]
 *     responses:
 *       200:
 *         description: Acciones registradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AccionRound1'
 */
router.get('/round2jugador2/acciones', async (req, res) => {
  try {
    const acciones = await fs.readJson(accionFile);
    res.json(acciones);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el registro de acciones.' });
  }
});

/**
 * @swagger
 * /round2jugador2/atacar:
 *   post:
 *     summary: ATACAR Jugador 2 Round 2
 *     description: Registra una acción de ataque o habilidad en el round 2 para el jugador 2.
 *     tags: [Round2Jugador2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               AccionRound1:
 *                 type: string
 *                 enum: [Golpear, Usar habilidad]
 *                 description: Acción a realizar (solo 'Golpear' o 'Usar habilidad')
 *     responses:
 *       201:
 *         description: Acción registrada
 *       400:
 *         description: Error en la acción
 */
router.post('/round2jugador2/atacar', async (req, res) => {
  try {
    // Restricción: solo si hay ganador en round 1
    if (!await ganadorRound1()) {
      return res.status(400).json({ error: 'No se puede usar esta accion hasta establecer un ganador en el Round 1' });
    }
    const enf = await obtenerEnfrentamientoActivo();
    const acciones = await fs.readJson(accionFile);
    // Si el jugador 2 ya perdió, mostrar mensaje YOU LOSE
    if (enf.VidaPersonaje2_2 === 0) {
      return res.status(400).json({ mensaje: 'YOU LOSE', detalle: 'El Round 2 ha concluido, Para seguir peleando valla al Round 3' });
    }
    // Si el jugador 1 ya perdió, mostrar mensaje YOU WIN
    if (enf.VidaPersonaje1_2 === 0) {
      return res.status(400).json({ mensaje: 'YOU WIN', detalle: 'El Round 2 ha concluido, Para seguir peleando valla al Round 3' });
    }
    // Restricción de turnos: alternancia
    if (acciones.length > 0 && acciones[acciones.length - 1].jugador === 2) {
      return res.status(400).json({ error: 'No es tu turno, espera a que el primer jugador realice su turno' });
    }
    // Restricción: si el round 2 ya terminó
    if (enf.VidaPersonaje1_2 === 0 || enf.VidaPersonaje2_2 === 0) {
      await registrarGanadorRound2();
      return res.status(400).json({ error: 'El Round 2 ha concluido, Para seguir peleando valla al Round 3' });
    }
    const alias2 = enf.AliasPersonaje2_2;
    const alias1 = enf.AliasPersonaje1_2;
    const personaje2 = await buscarPersonajePorAlias(alias2);
    const personaje1 = await buscarPersonajePorAlias(alias1);
    if (!personaje2) {
      return res.status(400).json({ error: `No se encontró el personaje con alias '${alias2}' en superheroes.json ni villains.json` });
    }
    if (!personaje1) {
      return res.status(400).json({ error: `No se encontró el personaje enemigo con alias '${alias1}' en superheroes.json ni villains.json` });
    }
    // Lógica de golpes y habilidad (idéntica a round 1 pero usando personaje2_2 como atacante y personaje1_2 como defensor)
    // Restricción de habilidad: solo cada 3 golpes básicos
    let lastHabilidadIndex = -1;
    for (let i = acciones.length - 1; i >= 0; i--) {
      if (acciones[i].ID_Equipo1 === enf.ID_Equipo1 && acciones[i].jugador === 2 && acciones[i].AccionRound1 === 'Usar habilidad') {
        lastHabilidadIndex = i;
        break;
      }
    }
    let golpesDesdeUltimaHabilidad = 0;
    for (let i = acciones.length - 1; i > lastHabilidadIndex; i--) {
      if (acciones[i].ID_Equipo1 === enf.ID_Equipo1 && acciones[i].jugador === 2 && acciones[i].AccionRound1 === 'Golpear') {
        golpesDesdeUltimaHabilidad++;
      }
    }
    if (req.body.AccionRound1 === 'Usar habilidad') {
      if (golpesDesdeUltimaHabilidad < 3) {
        return res.status(400).json({ error: 'No se puede utilizar habilidad si no se han realizado 3 golpes basicos, una vez ya hecho 3 golpes basicos entonces ya pude utilizar la habilidad pero tendra que realizar 3 golpes basicos de nuevo para volver a usarla' });
      }
    }
    // Determinar daño base
    let golpeIndex = acciones.filter(a => a.ID_Equipo1 === enf.ID_Equipo1 && a.jugador === 2 && a.AccionRound1 === 'Golpear').length % 3;
    let danoBase = 0;
    let mensaje = '';
    if (req.body.AccionRound1 === 'Golpear') {
      const golpes = [personaje2.golpeBasico1, personaje2.golpeBasico2, personaje2.golpeBasico3];
      danoBase = golpes[golpeIndex];
      mensaje = 'Se ha golpeado al enemigo';
    } else {
      danoBase = personaje2.danoHabilidad;
      mensaje = `Se ha activado la habilidad ${personaje2.nombreHabilidad}`;
    }
    // Proceso 2: Probabilidad de crítico
    let danoCritico = danoBase;
    if (Math.random() * 100 < personaje2.probCrit) {
      danoCritico += danoBase * (personaje2.danoCrit / 100);
    }
    // Proceso 3: Multiplicador de poder
    let danoConPoder = danoCritico + (danoCritico * (personaje2.poder / 10));
    // Proceso 4: Defensa del enemigo
    let defensaEnemigo = personaje1.defensa || 0;
    let defensaPorcentaje = defensaEnemigo / 20; // 10 = 50%
    let vidaRestada = danoConPoder - (danoConPoder * defensaPorcentaje);
    vidaRestada = Math.round(vidaRestada);
    // Actualizar vida del enemigo en enfrentamientos.json
    enf.VidaPersonaje1_2 = Math.max(0, enf.VidaPersonaje1_2 - vidaRestada);
    // Guardar acción
    const nuevaAccion = {
      TurnoRound1: acciones.length + 1,
      ID_Equipo1: enf.ID_Equipo1,
      AccionRound1: req.body.AccionRound1,
      DañoRealizadoRound1: Math.round(danoConPoder),
      VidaRestadaEnemigoRound1: vidaRestada,
      jugador: 2
    };
    acciones.push(nuevaAccion);
    await fs.writeJson(accionFile, acciones);
    // Guardar nueva vida en enfrentamientos.json
    const enfrentamientos = await fs.readJson(enfrentamientosFile);
    enfrentamientos[0].VidaPersonaje1_2 = enf.VidaPersonaje1_2;
    await fs.writeJson(enfrentamientosFile, enfrentamientos);
    // Si la vida del enemigo llegó a 0, registrar resultado y mostrar mensajes de fin de round SOLO para el ganador
    if (enf.VidaPersonaje1_2 === 0) {
      const peleasService = await import('../services/peleasService.js');
      await peleasService.default.registrarRound({
        id: enf.id,
        round2: 'Jugador 2'
      });
      return res.status(201).json({ mensaje: 'YOU WIN', detalle: 'El Round 2 ha concluido, Para seguir peleando valla al Round 3', accion: nuevaAccion });
    }
    res.status(201).json({ mensaje, accion: nuevaAccion });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar la acción', detalle: e.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     AccionRound1:
 *       type: object
 *       properties:
 *         TurnoRound1:
 *           type: integer
 *         ID_Equipo1:
 *           type: integer
 *         AccionRound1:
 *           type: string
 *         DañoRealizadoRound1:
 *           type: number
 *         VidaRestadaEnemigoRound1:
 *           type: number
 *         jugador:
 *           type: integer
 */

export default router;
