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
 * /round3jugador2/estados-vida:
 *   get:
 *     summary: Estados de Vida Jugador 2 Round 3
 *     description: Muestra el estado de vida del personaje 3 del jugador 2 en el round 3.
 *     tags: [Round3Jugador2]
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
router.get('/round3jugador2/estados-vida', async (req, res) => {
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
      TuPersonaje: enf.AliasPersonaje2_3,
      TuVida: enf.VidaPersonaje2_3,
      TuEnemigo: enf.AliasPersonaje1_3,
      VidaEnemigo: enf.VidaPersonaje1_3
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener el estado de vida.' });
  }
});

/**
 * @swagger
 * /round3jugador2/acciones:
 *   get:
 *     summary: Registro de Acciones Jugador 2 Round 3
 *     description: Muestra todas las acciones registradas por el jugador 2 en el round 3.
 *     tags: [Round3Jugador2]
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
router.get('/round3jugador2/acciones', async (req, res) => {
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
 * /round3jugador2/atacar:
 *   post:
 *     summary: Atacar en el round 3 (Jugador 2)
 *     description: Permite al Jugador 2 atacar usando su tercer personaje en el round 3. Solo se aceptan las acciones 'Golpear' y 'Usar habilidad'. El daño se calcula automáticamente según las estadísticas del personaje y las reglas del juego.
 *     tags: [Round3Jugador2]
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

router.post('/round3jugador2/atacar', async (req, res) => {
  try {
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
    // Cargar personajes
    const heroes = await fs.readJson('./data/superheroes.json');
    const villains = await fs.readJson('./data/villains.json');
    const todos = heroes.concat(villains);
    const alias2 = enf.AliasPersonaje2_3;
    const alias1 = enf.AliasPersonaje1_3;
    const personaje2 = todos.find(p => p.alias.toLowerCase() === alias2.toLowerCase());
    const personaje1 = todos.find(p => p.alias.toLowerCase() === alias1.toLowerCase());
    if (!personaje2) {
      return res.status(400).json({ error: `No se encontró el personaje con alias '${alias2}' en superheroes.json ni villains.json` });
    }
    if (!personaje1) {
      return res.status(400).json({ error: `No se encontró el personaje enemigo con alias '${alias1}' en superheroes.json ni villains.json` });
    }
    // Restricción de habilidad
    let lastHabilidadIndex = -1;
    for (let i = acciones.length - 1; i >= 0; i--) {
      if (acciones[i].ID_Equipo2 === enf.ID_Equipo2 && acciones[i].AccionRound3 === 'Usar habilidad') {
        lastHabilidadIndex = i;
        break;
      }
    }
    let golpesDesdeUltimaHabilidad = 0;
    for (let i = acciones.length - 1; i > lastHabilidadIndex; i--) {
      if (acciones[i].ID_Equipo2 === enf.ID_Equipo2 && acciones[i].AccionRound3 === 'Golpear') {
        golpesDesdeUltimaHabilidad++;
      }
    }
    if (AccionRound3 === 'Usar habilidad' && golpesDesdeUltimaHabilidad < 3) {
      return res.status(400).json({ error: 'No se puede usar habilidad si no se han realizado 3 golpes básicos desde el último uso.' });
    }
    // Determinar daño
    let golpeIndex = acciones.filter(a => a.ID_Equipo2 === enf.ID_Equipo2 && a.AccionRound3 === 'Golpear').length % 3;
    let danoBase = 0;
    let mensaje = '';
    if (AccionRound3 === 'Golpear') {
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
    // Crítico
    let probCrit = Number(personaje2.probCrit);
    let danoCrit = Number(personaje2.danoCrit);
    let danoCritico = danoBase;
    if (Math.random() * 100 < probCrit) {
      danoCritico += danoBase * (danoCrit / 100);
    }
    // Multiplicador de poder
    let poder = Number(personaje2.poder);
    let danoConPoder = danoCritico + (danoCritico * (poder / 10));
    // Defensa del enemigo
    let defensaEnemigo = Number(personaje1.defensa) || 0;
    let defensaPorcentaje = defensaEnemigo / 20;
    let vidaRestada = Math.round(danoConPoder - (danoConPoder * defensaPorcentaje));
    // Actualizar vida del enemigo
    enf.VidaPersonaje1_3 = Math.max(0, enf.VidaPersonaje1_3 - vidaRestada);
    // Guardar acción
    const nuevaAccion = {
      TurnoRound3: acciones.filter(a => a.jugador === 2).length + 1,
      ID_Equipo2: enf.ID_Equipo2,
      AccionRound3,
      DañoRealizadoRound3: Math.round(danoConPoder),
      VidaRestadaEnemigoRound3: vidaRestada,
      jugador: 2
    };
    acciones.push(nuevaAccion);
    await fs.writeJson(accionFile, acciones);
    // Guardar nueva vida en enfrentamientos.json
    const enfrentamientos = await fs.readJson(enfrentamientosFile);
    enfrentamientos[0].VidaPersonaje1_3 = enf.VidaPersonaje1_3;
    await fs.writeJson(enfrentamientosFile, enfrentamientos);
    // Mensaje de fin de round
    if (enf.VidaPersonaje1_3 === 0) {
      // Registrar resultado en Peleas.json
      try {
        const peleasService = await import('../services/peleasService.js');
        await peleasService.default.registrarRound({
          id: enf.id,
          round3: "Jugador 2"
        });
      } catch (err) {
        // Error de registro, pero no bloquea respuesta
      }
      return res.status(201).json({ mensaje: 'YOU WIN', detalle: 'El Round 3 ha concluido.', accion: nuevaAccion });
    }
    res.status(201).json({ mensaje, accion: nuevaAccion });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar la acción', detalle: e.message });
  }
});


export default router;
