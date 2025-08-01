
import express from 'express';
import accionRound3Repository from '../repositories/accionRound3Repository.js';
import enfrentamientoRepository from '../repositories/enfrentamientoRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';
import { ganadorRound2 } from '../services/roundService.js';

const router = express.Router();

// Utilidad para obtener el enfrentamiento activo (primer registro) desde MongoDB
async function obtenerEnfrentamientoActivo() {
  const enfrentamientos = await enfrentamientoRepository.getEnfrentamientos();
  return enfrentamientos[0];
}

// Utilidad para buscar personaje por alias en MongoDB (case-insensitive)
async function buscarPersonajePorAlias(alias) {
  let personaje = await heroRepository.getHeroByAlias(alias);
  if (personaje) return personaje;
  personaje = await villainRepository.getVillainByAlias(alias);
  return personaje;
}

// Restricción: Verificar ganador en Round 1 y 2
async function puedeUsarRound3() {
  return await ganadorRound2();
}

/**
 * @swagger
 * /round3jugador1/estados-vida:
 *   get:
 *     summary: Estados de Vida Jugador 1 Round 3
 *     description: Muestra el estado de vida del personaje 3 del jugador 1 en el round 3.
 *     tags: [Round3Jugador1]
 *     responses:
 *       200:
 *         description: Estado de vida actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 personaje:
 *                   type: string
 *                 vida:
 *                   type: integer
 */
router.get('/estados-vida', async (req, res) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: 'No autenticado' });
    const enfrentamientos = await enfrentamientoRepository.getEnfrentamientosByUsername(username);
    const enf = enfrentamientos[0];
    if (!enf) return res.status(404).json({ error: 'No se encontró enfrentamiento para el usuario' });
    // RESTRICCIÓN: solo si hay ganador en round 2
    if (!(enf.VidaPersonaje1_2 === 0 || enf.VidaPersonaje2_2 === 0)) {
      return res.status(403).json({ error: 'Error, No se puede jugar este round hasta terminar el round anterior' });
    }
    // Registro automático de resultado si la vida llega a 0 en round 3
    if (enf.VidaPersonaje1_3 === 0 || enf.VidaPersonaje2_3 === 0) {
      const peleasService = await import('../services/peleasService.js');
      const { calcularGanador } = await import('../utils/ganadorPelea.js');
      // Determinar ganador del round 3
      let round3Winner = enf.VidaPersonaje1_3 === 0 ? 'Jugador 2' : 'Jugador 1';
      // Recuperar pelea actual
      const peleaActual = await peleasService.default.getPeleaByIdAndUsername(enf.id, username);
      let round1 = peleaActual?.Round1 || null;
      let round2 = peleaActual?.Round2 || null;
      // Calcular ganador general
      let ganador = calcularGanador(round1, round2, round3Winner);
      await peleasService.default.registrarRound({
        id: enf.id,
        Round1: round1,
        Round2: round2,
        Round3: round3Winner,
        Ganador: ganador,
        username
      });
    }
    res.json({
      TuPersonaje: enf.AliasPersonaje1_3,
      TuVida: enf.VidaPersonaje1_3,
      TuEnemigo: enf.AliasPersonaje2_3,
      VidaEnemigo: enf.VidaPersonaje2_3
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener el estado de vida.' });
  }
});

/**
 * @swagger
 * /round3jugador1/acciones:
 *   get:
 *     summary: Registro de Acciones Jugador 1 Round 3
 *     description: Muestra todas las acciones registradas por el jugador 1 en el round 3.
 *     tags: [Round3Jugador1]
 *     responses:
 *       200:
 *         description: Acciones registradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/acciones', async (req, res) => {
  try {
    // Obtener todas las acciones del usuario autenticado en el round 3 (por ambos equipos)
    const username_acciones = req.user?.username;
    if (!username_acciones) return res.status(401).json({ error: 'No autenticado' });
    const enfrentamientos = await enfrentamientoRepository.getEnfrentamientosByUsername(username_acciones);
    const enf = enfrentamientos[0];
    if (!enf) return res.status(400).json({ error: 'No hay enfrentamiento activo para el usuario.' });
    const accionesEquipo1 = await accionRound3Repository.getByEquipoYJugadorUsername(enf.ID_Equipo1, 1, username_acciones);
    const accionesEquipo2 = await accionRound3Repository.getByEquipoYJugadorUsername(enf.ID_Equipo2, 2, username_acciones);
    const acciones = [...accionesEquipo1, ...accionesEquipo2];
    acciones.sort((a, b) => (a.TurnoUsuarioRound3 || 0) - (b.TurnoUsuarioRound3 || 0));
    let contador = 1;
    const accionesTodos = acciones.map(a => ({ ...a, ID: contador++ }));
    res.json(accionesTodos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener el registro de acciones.' });
  }
});

/**
 * @swagger
 * /round3jugador1/atacar:
 *   post:
 *     summary: Atacar en el round 3 (Jugador 1)
 *     description: Permite al Jugador 1 atacar usando su tercer personaje en el round 3. Solo se aceptan las acciones 'Golpear' y 'Usar habilidad'. El daño se calcula automáticamente según las estadísticas del personaje y las reglas del juego.
 *     tags: [Round3Jugador1]
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
 *                 description: Acción a realizar (solo 'Golpear' o 'Usar habilidad')
 *     responses:
 *       201:
 *         description: Acción registrada
 *       400:
 *         description: Error en la acción o restricción de juego
 */
router.post('/atacar', async (req, res) => {
  if (!await puedeUsarRound3()) {
    return res.status(400).json({ error: 'No se puede usar esta acción hasta establecer un ganador en el Round 1 y 2' });
  }
  const { AccionRound3 } = req.body;
  if (!['Golpear', 'Usar habilidad'].includes(AccionRound3)) {
    return res.status(400).json({ error: 'Acción no válida, solo se aceptan Golpear y Usar habilidad.' });
  }
  // Cargar datos filtrando por usuario
  const username = req.user?.username;
  if (!username) return res.status(401).json({ error: 'No autenticado' });
  const enfrentamientos = await enfrentamientoRepository.getEnfrentamientosByUsername(username);
  const enf = enfrentamientos[0];
  if (!enf) {
    return res.status(404).json({ error: 'No se encontró enfrentamiento para el usuario.' });
  }
  // Validar campos requeridos
  const requiredFields = ['ID_Equipo1','AliasPersonaje1_3','AliasPersonaje2_3','VidaPersonaje1_3','VidaPersonaje2_3','id'];
  for (const field of requiredFields) {
    if (!(field in enf)) {
      return res.status(400).json({ error: `El enfrentamiento activo no tiene el campo requerido: ${field}` });
    }
  }
  // ...username ya fue declarado antes, no redeclarar...
  // Obtener todas las acciones de ambos equipos y ordenarlas por turno o fecha
  const accionesEquipo1 = await accionRound3Repository.getByEquipoYJugador(enf.ID_Equipo1);
  const accionesEquipo2 = await accionRound3Repository.getByEquipoYJugador(enf.ID_Equipo2);
  const acciones = [...accionesEquipo1, ...accionesEquipo2];
  acciones.sort((a, b) => (a.TurnoRound3 || a.turno || a._id?.toString().localeCompare(b._id?.toString())));
  // Obtener solo las acciones del usuario actual y jugador 1
  const accionesUsuario = await accionRound3Repository.getByEquipoYJugadorUsername(enf.ID_Equipo1, 1, username);
  // Validar vida antes de procesar el ataque
  if (enf.VidaPersonaje1_3 === 0) {
    return res.status(400).json({ mensaje: 'YOU LOSE', detalle: 'El Round 3 ha concluido.' });
  }
  if (enf.VidaPersonaje2_3 === 0) {
    return res.status(400).json({ mensaje: 'YOU WIN', detalle: 'El Round 3 ha concluido.' });
  }
  // Alternancia de turnos global: solo si el último turno no es del jugador contrario
  if (acciones.length > 0 && acciones[acciones.length - 1].jugador === 1) {
    return res.status(400).json({ error: 'No es tu turno, espera a que el segundo jugador realice su turno.' });
  }
  // Buscar personajes
  const alias1 = enf.AliasPersonaje1_3;
  const alias2 = enf.AliasPersonaje2_3;
  const personaje1 = await buscarPersonajePorAlias(alias1);
  const personaje2 = await buscarPersonajePorAlias(alias2);
  if (!personaje1) {
    return res.status(400).json({ error: `No se encontró el personaje con alias '${alias1}' en la base de datos.` });
  }
  if (!personaje2) {
    return res.status(400).json({ error: `No se encontró el personaje enemigo con alias '${alias2}' en la base de datos.` });
  }
  // Restricción de habilidad SOLO con acciones del usuario actual
  let lastHabilidadIndex = -1;
  for (let i = accionesUsuario.length - 1; i >= 0; i--) {
    if (accionesUsuario[i].ID_Equipo3 === enf.ID_Equipo1 && accionesUsuario[i].AccionRound3 === 'Usar habilidad') {
      lastHabilidadIndex = i;
      break;
    }
  }
  let golpesDesdeUltimaHabilidad = 0;
  for (let i = accionesUsuario.length - 1; i > lastHabilidadIndex; i--) {
    if (accionesUsuario[i].ID_Equipo3 === enf.ID_Equipo1 && accionesUsuario[i].AccionRound3 === 'Golpear') {
      golpesDesdeUltimaHabilidad++;
    }
  }
  if (AccionRound3 === 'Usar habilidad' && golpesDesdeUltimaHabilidad < 3) {
    return res.status(400).json({ error: 'No se puede usar habilidad si no se han realizado 3 golpes básicos desde el último uso.' });
  }
  // Determinar daño SOLO con acciones del usuario actual
  let golpeIndex = accionesUsuario.filter(a => a.ID_Equipo3 === enf.ID_Equipo1 && a.AccionRound3 === 'Golpear').length % 3;
  let danoBase = 0;
  let mensaje = '';
  if (AccionRound3 === 'Golpear') {
    const golpes = [
      Number(personaje1.golpeBasico1),
      Number(personaje1.golpeBasico2),
      Number(personaje1.golpeBasico3)
    ];
    danoBase = golpes[golpeIndex];
    mensaje = 'Se ha golpeado al enemigo';
  } else {
    danoBase = Number(personaje1.danoHabilidad);
    mensaje = `Se ha activado la habilidad ${personaje1.nombreHabilidad}`;
  }
  // Crítico
  let probCrit = Number(personaje1.probCrit);
  let danoCrit = Number(personaje1.danoCrit);
  let danoCritico = danoBase;
  if (Math.random() * 100 < probCrit) {
    danoCritico += danoBase * (danoCrit / 100);
  }
  // Multiplicador de poder
  let poder = Number(personaje1.poder);
  let danoConPoder = danoCritico + (danoCritico * (poder / 10));
  // Defensa del enemigo
  let defensaEnemigo = Number(personaje2.defensa) || 0;
  let defensaPorcentaje = defensaEnemigo / 20;
  let vidaRestada = Math.round(danoConPoder - (danoConPoder * defensaPorcentaje));
  // Actualizar vida del enemigo en la base de datos (MongoDB)
  enf.VidaPersonaje2_3 = Math.max(0, enf.VidaPersonaje2_3 - vidaRestada);
  await enfrentamientoRepository.updateVidaPersonaje2_3(enf.id, enf.VidaPersonaje2_3);
  // Guardar acción en MongoDB
  const accionesPorUsuario = acciones.filter(a => a.username === username);
  const nuevaAccion = {
    TurnoRound3: accionesUsuario.length + 1,
    TurnoUsuarioRound3: accionesPorUsuario.length + 1,
    ID_Equipo3: enf.ID_Equipo1,
    AccionRound3,
    DañoRealizadoRound3: Math.round(danoConPoder),
    VidaRestadaEnemigoRound3: vidaRestada,
    jugador: 1,
    username
  };
  await accionRound3Repository.saveAccionUsuario(nuevaAccion, username);
  // Mensaje de fin de round
  // Solo mostrar mensaje de fin de round si la vida llegó a 0 tras el ataque
  if (enf.VidaPersonaje2_3 === 0 && vidaRestada > 0) {
    try {
      const peleasService = await import('../services/peleasService.js');
      const { calcularGanador } = await import('../utils/ganadorPelea.js');
      // Recuperar pelea actual
      const peleaActual = await peleasService.default.getPeleaByIdAndUsername(enf.id, username);
      let round1 = peleaActual?.Round1 || null;
      let round2 = peleaActual?.Round2 || null;
      let ganador = calcularGanador(round1, round2, 'Jugador 1');
      await peleasService.default.registrarRound({
        id: enf.id,
        Round1: round1,
        Round2: round2,
        Round3: 'Jugador 1',
        Ganador: ganador,
        username
      });
    } catch (err) {
      // Error de registro, pero no bloquea respuesta
    }
    return res.status(201).json({ mensaje: 'YOU WIN', detalle: 'El Round 3 ha concluido.', accion: nuevaAccion });
  }
  res.status(201).json({ mensaje, accion: nuevaAccion });
});


export default router;
