import express from 'express';

import accionRound2Repository from '../repositories/accionRound2Repository.js';
import enfrentamientoRepository from '../repositories/enfrentamientoRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';


const router = express.Router();


// Utilidad para buscar personaje por alias en MongoDB (case-insensitive, solo consulta directa)
async function buscarPersonajePorAlias(alias) {
  // Buscar primero en héroes
  let personaje = await heroRepository.getHeroByAlias(alias);
  if (personaje) return personaje;
  // Si no es héroe, buscar en villanos
  personaje = await villainRepository.getVillainByAlias(alias);
  return personaje;
}

// Utilidad para obtener el enfrentamiento activo (primer registro) desde MongoDB
async function obtenerEnfrentamientoActivo() {
  const enfrentamientos = await enfrentamientoRepository.getEnfrentamientos();
  return enfrentamientos[0];
}

// Utilidad para saber si ya hay ganador en el round 1
async function ganadorRound1() {
  const enf = await obtenerEnfrentamientoActivo();
  if (enf.VidaPersonaje1_1 === 0) return { ganador: 'Jugador 2', perdedor: 'Jugador 1' };
  if (enf.VidaPersonaje2_1 === 0) return { ganador: 'Jugador 1', perdedor: 'Jugador 2' };
  return null;
}

// Registrar resultado de round 2 en la base de datos (implementar si es necesario)
async function registrarGanadorRound2() {
  // TODO: Implementar registro de ganador en la colección de peleas en MongoDB si es necesario
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
router.get('/estados-vida', async (req, res) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: 'No autenticado' });
    // Buscar enfrentamiento solo del usuario
    const enfrentamientos = await enfrentamientoRepository.getEnfrentamientosByUsername(username);
    const enf = enfrentamientos[0];
    if (!enf) return res.status(404).json({ error: 'No se encontró enfrentamiento para el usuario' });
    // RESTRICCIÓN: solo si hay ganador en round 1
    if (!(enf.VidaPersonaje1_1 === 0 || enf.VidaPersonaje2_1 === 0)) {
      return res.status(403).json({ error: 'Error, No se puede jugar este round hasta terminar el round anterior' });
    }
    // Registro automático de resultado si la vida llega a 0 en round 2
    if (enf.VidaPersonaje1_2 === 0 || enf.VidaPersonaje2_2 === 0) {
      const peleasService = await import('../services/peleasService.js');
      const { calcularGanador } = await import('../utils/ganadorPelea.js');
      // Determinar ganador del round 2
      let round2Winner = enf.VidaPersonaje2_2 === 0 ? 'Jugador 1' : 'Jugador 2';
      // Recuperar pelea actual
      const peleaActual = await peleasService.default.getPeleaByIdAndUsername(enf.id, username);
      let round1 = peleaActual?.Round1 || null;
      let round3 = peleaActual?.Round3 || null;
      // Calcular ganador general
      let ganador = calcularGanador(round1, round2Winner, round3);
      await peleasService.default.registrarRound({
        id: enf.id,
        Round1: round1,
        Round2: round2Winner,
        Round3: round3,
        Ganador: ganador,
        username
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
router.get('/acciones', async (req, res) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: 'No autenticado' });
    const acciones = await accionRound2Repository.getAllByUsername(username);
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
 *               AccionRound2:
 *                 type: string
 *                 enum: [Golpear, Usar habilidad]
 *                 description: Acción a realizar (solo 'Golpear' o 'Usar habilidad')
 *     responses:
 *       201:
 *         description: Acción registrada
 *       400:
 *         description: Error en la acción
 */
router.post('/atacar', async (req, res) => {
  try {
    // Restricción: solo si hay ganador en round 1
    if (!await ganadorRound1()) {
      return res.status(400).json({ error: 'No se puede usar esta accion hasta establecer un ganador en el Round 1' });
    }
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: 'No autenticado' });
    // Obtener el enfrentamiento solo del usuario actual
    const enfArr = await enfrentamientoRepository.getEnfrentamientosByUsername(username);
    const enf = enfArr[0];
    if (!enf) {
      return res.status(404).json({ error: 'No se encontró enfrentamiento para el usuario.' });
    }
    // Obtener solo las acciones del usuario actual
    const acciones = await accionRound2Repository.getAllByUsername(username);
    
    // Obtener acciones SOLO del jugador 2 para validación de habilidad
    const accionesJugador2 = acciones.filter(a => a.jugador === 2 && a.ID_Equipo2 === enf.ID_Equipo2);
    
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
      // Aquí podrías registrar el ganador en la colección de peleas si lo deseas
      return res.status(400).json({ error: 'El Round 2 ha concluido, Para seguir peleando valla al Round 3' });
    }
    const alias2 = enf.AliasPersonaje2_2;
    const alias1 = enf.AliasPersonaje1_2;
    const personaje2 = await buscarPersonajePorAlias(alias2);
    const personaje1 = await buscarPersonajePorAlias(alias1);
    if (!personaje2) {
      return res.status(400).json({ error: `No se encontró el personaje con alias '${alias2}' en la base de datos.` });
    }
    if (!personaje1) {
      return res.status(400).json({ error: `No se encontró el personaje enemigo con alias '${alias1}' en la base de datos.` });
    }
    // Lógica de golpes y habilidad (idéntica a round 1 pero usando personaje2_2 como atacante y personaje1_2 como defensor)
    // Restricción de habilidad: solo cada 3 golpes básicos del jugador 2
    let lastHabilidadIndex = -1;
    for (let i = accionesJugador2.length - 1; i >= 0; i--) {
      if (accionesJugador2[i].AccionRound2 === 'Usar habilidad') {
        lastHabilidadIndex = i;
        break;
      }
    }
    let golpesDesdeUltimaHabilidad = 0;
    for (let i = accionesJugador2.length - 1; i > lastHabilidadIndex; i--) {
      if (accionesJugador2[i].AccionRound2 === 'Golpear') {
        golpesDesdeUltimaHabilidad++;
      }
    }
    if (req.body.AccionRound2 === 'Usar habilidad') {
      if (golpesDesdeUltimaHabilidad < 3) {
        return res.status(400).json({ error: 'No se puede utilizar habilidad si no se han realizado 3 golpes basicos, una vez ya hecho 3 golpes basicos entonces ya pude utilizar la habilidad pero tendra que realizar 3 golpes basicos de nuevo para volver a usarla' });
      }
    }
    // Determinar daño base
    let golpeIndex = accionesJugador2.filter(a => a.AccionRound2 === 'Golpear').length % 3;
    let danoBase = 0;
    let mensaje = '';
    if (req.body.AccionRound2 === 'Golpear') {
      const golpes = [
        Number(personaje2.golpeBasico1),
        Number(personaje2.golpeBasico2),
        Number(personaje2.golpeBasico3)
      ];
      danoBase = golpes[golpeIndex];
      mensaje = 'Se ha golpeado al enemigo';
    } else {
      danoBase = Number(personaje2.danoHabilidad);
      mensaje = `Se ha activado la habilidad ${personaje2.nombreHabilidad}`;
    }
    // Proceso 2: Probabilidad de crítico
    let probCrit = Number(personaje2.probCrit);
    let danoCrit = Number(personaje2.danoCrit);
    let danoCritico = danoBase;
    if (Math.random() * 100 < probCrit) {
      danoCritico += danoBase * (danoCrit / 100);
    }
    // Proceso 3: Multiplicador de poder
    let poder = Number(personaje2.poder);
    let danoConPoder = danoCritico + (danoCritico * (poder / 10));
    // Proceso 4: Defensa del enemigo
    let defensaEnemigo = Number(personaje1.defensa) || 0;
    let defensaPorcentaje = defensaEnemigo / 20; // 10 = 50%
    let vidaRestada = danoConPoder - (danoConPoder * defensaPorcentaje);
    vidaRestada = Math.round(vidaRestada);
    // Actualizar vida del enemigo en la base de datos (MongoDB)
    enf.VidaPersonaje1_2 = Math.max(0, enf.VidaPersonaje1_2 - vidaRestada);
    await enfrentamientoRepository.updateVidaPersonaje1_2(enf.id, enf.VidaPersonaje1_2);
    // Calcular el turno por usuario
    const accionesUsuario = acciones.filter(a => a.username === username);
    const nuevaAccion = {
      ID_Equipo2: enf.ID_Equipo2,
      AccionRound2: req.body.AccionRound2,
      DañoRealizadoRound2: Math.round(danoConPoder),
      VidaRestadaEnemigoRound2: vidaRestada,
      jugador: 2,
      TurnoUsuarioRound2: accionesUsuario.length + 1
    };
    await accionRound2Repository.addAccionUsuario(nuevaAccion, username);
    // Si la vida del enemigo llegó a 0, registrar resultado y mostrar mensajes de fin de round SOLO para el ganador
    if (enf.VidaPersonaje1_2 === 0) {
      const peleasService = await import('../services/peleasService.js');
      const { calcularGanador } = await import('../utils/ganadorPelea.js');
      // Recuperar pelea actual
      const peleaActual = await peleasService.default.getPeleaByIdAndUsername(enf.id, username);
      let round1 = peleaActual?.Round1 || null;
      let round3 = peleaActual?.Round3 || null;
      let ganador = calcularGanador(round1, 'Jugador 2', round3);
      await peleasService.default.registrarRound({
        id: enf.id,
        Round1: round1,
        Round2: 'Jugador 2',
        Round3: round3,
        Ganador: ganador,
        username
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
 *         ID_Equipo2:
 *           type: integer
 *         AccionRound2:
 *           type: string
 *         DañoRealizadoRound2:
 *           type: number
 *         VidaRestadaEnemigoRound2:
 *           type: number
 *         jugador:
 *           type: integer
 *         TurnoUsuarioRound2:
 *           type: integer
 *           description: Número de turno realizado por el usuario en el round 2
 */

export default router;
