import express from 'express';
import fs from 'fs-extra';
import { ganadorRound2 } from '../services/roundService.js';


const router = express.Router();
const enfrentamientosFile = './data/enfrentamientos.json';
const accionFile = './data/AccionRound3.json';

// Utilidad para obtener el enfrentamiento activo (primer registro)
async function obtenerEnfrentamientoActivo() {
  const enfrentamientos = await fs.readJson(enfrentamientosFile);
  return enfrentamientos[0];
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
router.get('/round3jugador1/estados-vida', async (req, res) => {
  try {
    const enf = await obtenerEnfrentamientoActivo();
    // Registro automático de resultado si la vida llega a 0 en round 3
    if (enf.VidaPersonaje1_3 === 0 || enf.VidaPersonaje2_3 === 0) {
      let round3_j1, round3_j2, ganadorFinal, perdedorFinal;
      if (enf.VidaPersonaje1_3 === 0) {
        round3_j1 = 'You Lose';
        round3_j2 = 'You Win';
        ganadorFinal = 'Jugador 2';
        perdedorFinal = 'Jugador 1';
      } else {
        round3_j1 = 'You Win';
        round3_j2 = 'You Lose';
        ganadorFinal = 'Jugador 1';
        perdedorFinal = 'Jugador 2';
      }
      const peleasService = await import('../services/peleasService.js');
      await peleasService.default.registrarRound({
        id: enf.id,
        aliasPersonaje1_1: enf.AliasPersonaje1_1,
        round1_j1: null,
        aliasPersonaje2_1: enf.AliasPersonaje2_1,
        round1_j2: null,
        round2_j1: null,
        round2_j2: null,
        round3_j1,
        round3_j2,
        ganadorFinal,
        perdedorFinal
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
router.get('/round3jugador1/acciones', async (req, res) => {
  try {
    const acciones = await fs.readJson(accionFile);
    // Mostrar todas las acciones de ambos jugadores, ID autocontable
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
router.post('/round3jugador1/atacar', async (req, res) => {
  if (!await puedeUsarRound3()) {
    return res.status(400).json({ error: 'No se puede usar esta acción hasta establecer un ganador en el Round 1 y 2' });
  }
  const { AccionRound3 } = req.body;
  if (!['Golpear', 'Usar habilidad'].includes(AccionRound3)) {
    return res.status(400).json({ error: 'Acción no válida, solo se aceptan Golpear y Usar habilidad.' });
  }
  // Cargar datos
  const enf = await obtenerEnfrentamientoActivo();
  const acciones = await fs.readJson(accionFile);
  // Restricciones de vida
  if (enf.VidaPersonaje1_3 === 0) {
    return res.status(400).json({ mensaje: 'YOU LOSE', detalle: 'El Round 3 ha concluido.' });
  }
  if (enf.VidaPersonaje2_3 === 0) {
    return res.status(400).json({ mensaje: 'YOU WIN', detalle: 'El Round 3 ha concluido.' });
  }
  // Alternancia de turnos
  if (acciones.length > 0 && acciones[acciones.length - 1].jugador === 1) {
    return res.status(400).json({ error: 'No es tu turno, espera a que el segundo jugador realice su turno.' });
  }
  // Buscar personajes
  const alias1 = enf.AliasPersonaje1_3;
  const alias2 = enf.AliasPersonaje2_3;
  // Utilidad para buscar personaje en superheroes o villains
  async function buscarPersonajePorAlias(alias) {
    const heroes = await fs.readJson('./data/superheroes.json');
    const villains = await fs.readJson('./data/villains.json');
    const aliasLower = alias.toLowerCase();
    return heroes.find(p => p.alias && p.alias.toLowerCase() === aliasLower) || villains.find(p => p.alias && p.alias.toLowerCase() === aliasLower);
  }
  const personaje1 = await buscarPersonajePorAlias(alias1);
  const personaje2 = await buscarPersonajePorAlias(alias2);
  if (!personaje1) {
    return res.status(400).json({ error: `No se encontró el personaje con alias '${alias1}'.` });
  }
  if (!personaje2) {
    return res.status(400).json({ error: `No se encontró el personaje enemigo con alias '${alias2}'.` });
  }
  // Restricción de habilidad
  let lastHabilidadIndex = -1;
  for (let i = acciones.length - 1; i >= 0; i--) {
    if (acciones[i].ID_Equipo1 === enf.ID_Equipo1 && acciones[i].AccionRound3 === 'Usar habilidad') {
      lastHabilidadIndex = i;
      break;
    }
  }
  let golpesDesdeUltimaHabilidad = 0;
  for (let i = acciones.length - 1; i > lastHabilidadIndex; i--) {
    if (acciones[i].ID_Equipo1 === enf.ID_Equipo1 && acciones[i].AccionRound3 === 'Golpear') {
      golpesDesdeUltimaHabilidad++;
    }
  }
  if (AccionRound3 === 'Usar habilidad' && golpesDesdeUltimaHabilidad < 3) {
    return res.status(400).json({ error: 'No se puede usar habilidad si no se han realizado 3 golpes básicos desde el último uso.' });
  }
  // Determinar daño
  let golpeIndex = acciones.filter(a => a.ID_Equipo1 === enf.ID_Equipo1 && a.AccionRound3 === 'Golpear').length % 3;
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
  // Actualizar vida del enemigo
  enf.VidaPersonaje2_3 = Math.max(0, enf.VidaPersonaje2_3 - vidaRestada);
  // Guardar acción
  const nuevaAccion = {
    TurnoRound3: acciones.filter(a => a.jugador === 1).length + 1,
    ID_Equipo1: enf.ID_Equipo1,
    AccionRound3,
    DañoRealizadoRound3: Math.round(danoConPoder),
    VidaRestadaEnemigoRound3: vidaRestada,
    jugador: 1
  };
  acciones.push(nuevaAccion);
  await fs.writeJson(accionFile, acciones);
  // Guardar nueva vida en enfrentamientos.json
  const enfrentamientos = await fs.readJson(enfrentamientosFile);
  enfrentamientos[0].VidaPersonaje2_3 = enf.VidaPersonaje2_3;
  await fs.writeJson(enfrentamientosFile, enfrentamientos);
  // Mensaje de fin de round
  if (enf.VidaPersonaje2_3 === 0) {
    // Registrar resultado en Peleas.json
    try {
      const peleasService = await import('../services/peleasService.js');
      await peleasService.default.registrarRound({
        id: enf.id,
        round3: "Jugador 1"
      });
    } catch (err) {
      // Error de registro, pero no bloquea respuesta
    }
    return res.status(201).json({ mensaje: 'YOU WIN', detalle: 'El Round 3 ha concluido.', accion: nuevaAccion });
  }
  res.status(201).json({ mensaje, accion: nuevaAccion });
});


export default router;
