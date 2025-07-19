
import express from 'express';
import accionRound2Repository from '../repositories/accionRound2Repository.js';
const router = express.Router();
import enfrentamientoRepository from '../repositories/enfrentamientoRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';

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

// Registrar resultado de round 1 en la base de datos (implementar si es necesario)
async function registrarGanadorRound1() {
  // TODO: Implementar registro de ganador en la colección de peleas en MongoDB si es necesario
}

/**
 * @swagger
 * /round2jugador1/estados-vida:
 *   get:
 *     summary: Estados de Vida Jugador 1 Round 2
 *     description: Muestra el estado de vida de los personajes del round 2 para el jugador 1.
 *     tags: [Round2Jugador1]
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
router.get('/round2jugador1/estados-vida', async (req, res) => {
  try {
    const enf = await obtenerEnfrentamientoActivo();
    // Restricción: solo si hay ganador en round 1
    if (!await ganadorRound1()) {
      return res.status(400).json({ error: 'No se puede usar esta accion hasta establecer un ganador en el Round 1' });
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
        round2: (round2_j1 === 'You Win') ? 'Jugador 1' : 'Jugador 2'
      });
    }
    res.json({
      TuPersonaje: enf.AliasPersonaje1_2,
      Tuvida: enf.VidaPersonaje1_2,
      TuEnemigo: enf.AliasPersonaje2_2,
      VidaEnemigo: enf.VidaPersonaje2_2
    });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el estado de vida.' });
  }
});

/**
 * @swagger
 * /round2jugador1/acciones:
 *   get:
 *     summary: Registro de Acciones Jugador 1 Round 2
 *     description: Muestra todas las acciones registradas por el jugador 1 en el round 2.
 *     tags: [Round2Jugador1]
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
router.get('/round2jugador1/acciones', async (req, res) => {
  try {
    const enf = await obtenerEnfrentamientoActivo();
    const acciones = await accionRound2Repository.getByEquipoYJugador(enf.ID_Equipo2);
    res.json(acciones);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el registro de acciones.' });
  }
});

/**
 * @swagger
 * /round2jugador1/atacar:
 *   post:
 *     summary: ATACAR Jugador 1 Round 2
 *     description: Registra una acción de ataque o habilidad en el round 2 para el jugador 1.
 *     tags: [Round2Jugador1]
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
router.post('/round2jugador1/atacar', async (req, res) => {
  try {
    // Restricción: solo si hay ganador en round 1
    if (!await ganadorRound1()) {
      return res.status(400).json({ error: 'No se puede usar esta accion hasta establecer un ganador en el Round 1' });
    }
    const enf = await obtenerEnfrentamientoActivo();
    // Obtener todas las acciones del equipo desde MongoDB
    const acciones = await accionRound2Repository.getByEquipoYJugador(enf.ID_Equipo2);
    // Si el jugador 1 ya perdió, mostrar mensaje YOU LOSE
    if (enf.VidaPersonaje1_2 === 0) {
      return res.status(400).json({ mensaje: 'YOU LOSE', detalle: 'El Round 2 ha concluido, Para seguir peleando valla al Round 3' });
    }
    // Si el jugador 2 ya perdió, mostrar mensaje YOU WIN
    if (enf.VidaPersonaje2_2 === 0) {
      return res.status(400).json({ mensaje: 'YOU WIN', detalle: 'El Round 2 ha concluido, Para seguir peleando valla al Round 3' });
    }
    // Restricción de turnos: alternancia
    if (acciones.length > 0 && acciones[acciones.length - 1].jugador === 1) {
      return res.status(400).json({ error: 'No es tu turno, espera a que el segundo jugador realice su turno' });
    }
    // Restricción: si el round 2 ya terminó
    if (enf.VidaPersonaje1_2 === 0 || enf.VidaPersonaje2_2 === 0) {
      // Aquí podrías registrar el ganador en la colección de peleas si lo deseas
      return res.status(400).json({ error: 'El Round 2 ha concluido, Para seguir peleando valla al Round 3' });
    }
    const alias1 = enf.AliasPersonaje1_2;
    const alias2 = enf.AliasPersonaje2_2;
    const personaje1 = await buscarPersonajePorAlias(alias1);
    const personaje2 = await buscarPersonajePorAlias(alias2);
    if (!personaje1) {
      return res.status(400).json({ error: `No se encontró el personaje con alias '${alias1}' en la base de datos.` });
    }
    if (!personaje2) {
      return res.status(400).json({ error: `No se encontró el personaje enemigo con alias '${alias2}' en la base de datos.` });
    }
    // Lógica de golpes y habilidad (idéntica a round 1 pero usando personaje1_2 y personaje2_2)
    // Restricción de habilidad: solo cada 3 golpes básicos
    let lastHabilidadIndex = -1;
    for (let i = acciones.length - 1; i >= 0; i--) {
      if (acciones[i].ID_Equipo2 === enf.ID_Equipo2 && acciones[i].jugador === 1 && acciones[i].AccionRound2 === 'Usar habilidad') {
        lastHabilidadIndex = i;
        break;
      }
    }
    let golpesDesdeUltimaHabilidad = 0;
    for (let i = acciones.length - 1; i > lastHabilidadIndex; i--) {
      if (acciones[i].ID_Equipo2 === enf.ID_Equipo2 && acciones[i].jugador === 1 && acciones[i].AccionRound2 === 'Golpear') {
        golpesDesdeUltimaHabilidad++;
      }
    }
    if (req.body.AccionRound2 === 'Usar habilidad') {
      if (golpesDesdeUltimaHabilidad < 3) {
        return res.status(400).json({ error: 'No se puede utilizar habilidad si no se han realizado 3 golpes basicos, una vez ya hecho 3 golpes basicos entonces ya pude utilizar la habilidad pero tendra que realizar 3 golpes basicos de nuevo para volver a usarla' });
      }
    }
    // Determinar daño base
    let golpeIndex = acciones.filter(a => a.ID_Equipo2 === enf.ID_Equipo2 && a.jugador === 1 && a.AccionRound2 === 'Golpear').length % 3;
    let danoBase = 0;
    let mensaje = '';
    if (req.body.AccionRound2 === 'Golpear') {
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
    // Proceso 2: Probabilidad de crítico
    let probCrit = Number(personaje1.probCrit);
    let danoCrit = Number(personaje1.danoCrit);
    let danoCritico = danoBase;
    if (Math.random() * 100 < probCrit) {
      danoCritico += danoBase * (danoCrit / 100);
    }
    // Proceso 3: Multiplicador de poder
    let poder = Number(personaje1.poder);
    let danoConPoder = danoCritico + (danoCritico * (poder / 10));
    // Proceso 4: Defensa del enemigo
    let defensaEnemigo = Number(personaje2.defensa) || 0;
    let defensaPorcentaje = defensaEnemigo / 20; // 10 = 50%
    let vidaRestada = danoConPoder - (danoConPoder * defensaPorcentaje);
    vidaRestada = Math.round(vidaRestada);
    // Actualizar vida del enemigo en la base de datos (MongoDB)
    enf.VidaPersonaje2_2 = Math.max(0, enf.VidaPersonaje2_2 - vidaRestada);
    await enfrentamientoRepository.updateVidaPersonaje2_2(enf.id, enf.VidaPersonaje2_2);
    // Guardar acción en MongoDB
    const nuevaAccion = {
      ID_Equipo2: enf.ID_Equipo2,
      AccionRound2: req.body.AccionRound2,
      DañoRealizadoRound2: Math.round(danoConPoder),
      VidaRestadaEnemigoRound2: vidaRestada,
      jugador: 1
    };
    await accionRound2Repository.addAccion(nuevaAccion);
    // Si la vida del enemigo llegó a 0, registrar resultado y mostrar mensajes de fin de round SOLO para el ganador
    if (enf.VidaPersonaje2_2 === 0) {
      // Aquí podrías registrar el ganador en la colección de peleas si lo deseas
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
