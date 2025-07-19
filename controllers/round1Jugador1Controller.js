import express from 'express';
import accionRound1Repository from '../repositories/accionRound1Repository.js';
import enfrentamientoRepository from '../repositories/enfrentamientoRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';
import path from 'path';

const router = express.Router();
const enfrentamientosFile = path.resolve('./data/enfrentamientos.json');
const heroesFile = path.resolve('./data/superheroes.json');
const villainsFile = path.resolve('./data/villains.json');

// Utilidad para buscar personaje por alias en MongoDB (case-insensitive)
async function buscarPersonajePorAlias(alias) {
  const [heroes, villains] = await Promise.all([
    heroRepository.getHeroes(),
    villainRepository.getVillains()
  ]);
  return heroes.concat(villains).find(p => p.alias && p.alias.toLowerCase() === alias.toLowerCase());
}

// Utilidad para obtener el enfrentamiento activo (primer registro) desde MongoDB
async function obtenerEnfrentamientoActivo() {
  const enfrentamientos = await enfrentamientoRepository.getEnfrentamientos();
  return enfrentamientos[0];
}

/**
 * @swagger
 * /round1/estados-vida:
 *   get:
 *     summary: Estados de Vida
 *     description: Muestra el estado de vida de los personajes del round 1.
 *     tags: [Round1Jugador1]
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
router.get('/round1/estados-vida', async (req, res) => {
  try {
    const enf = await obtenerEnfrentamientoActivo();
    // Registro automático de resultado si la vida llega a 0
    if (enf.VidaPersonaje1_1 === 0 || enf.VidaPersonaje2_1 === 0) {
      let ganadorFinal, perdedorFinal, round1_j1, round1_j2;
      if (enf.VidaPersonaje1_1 === 0) {
        ganadorFinal = 'Jugador 2';
        perdedorFinal = 'Jugador 1';
        round1_j1 = 'You Lose';
        round1_j2 = 'You Win';
      } else {
        ganadorFinal = 'Jugador 1';
        perdedorFinal = 'Jugador 2';
        round1_j1 = 'You Win';
        round1_j2 = 'You Lose';
      }
      const peleasService = await import('../services/peleasService.js');
      await peleasService.default.registrarRound({
        id: enf.id,
        round1: (round1_j1 === 'You Win') ? 'Jugador 1' : 'Jugador 2'
      });
    }
    // ...existing code...
    res.json({
      TuPersonaje: enf.AliasPersonaje1_1,
      Tuvida: enf.VidaPersonaje1_1,
      TuEnemigo: enf.AliasPersonaje2_1,
      VidaEnemigo: enf.VidaPersonaje2_1
    });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el estado de vida.' });
  }
});

/**
 * @swagger
 * /round1/acciones:
 *   get:
 *     summary: Registro de Acciones
 *     description: Muestra todas las acciones registradas en el round 1.
 *     tags: [Round1Jugador1]
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
router.get('/round1/acciones', async (req, res) => {
  try {
    // Obtener todas las acciones desde MongoDB
    const acciones = await accionRound1Repository.getAll();
    res.json(acciones);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el registro de acciones.' });
  }
});

/**
 * @swagger
 * /round1/atacar:
 *   post:
 *     summary: ATACAR
 *     description: Registra una acción de ataque o habilidad en el round 1.
 *     tags: [Round1Jugador1]
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
router.post('/round1/atacar', async (req, res) => {
  try {
    const { AccionRound1 } = req.body;
    if (!['Golpear', 'Usar habilidad'].includes(AccionRound1)) {
      return res.status(400).json({ error: 'Error, Accion no valida, solo se aceptan Golpear y Usar habilidad, intentelo de nuevo' });
    }
    // Cargar datos
    const enf = await obtenerEnfrentamientoActivo();
    // Obtener acciones de este equipo desde MongoDB
    const acciones = await accionRound1Repository.getByEquipoYJugador(enf.ID_Equipo1);
    // Si el jugador 1 ya perdió, mostrar mensaje YOU LOSE
    if (enf.VidaPersonaje1_1 === 0) {
      return res.status(400).json({ mensaje: 'YOU LOSE', detalle: 'El Round 1 a concluido, Para seguir peleando valla al Round 2' });
    }
    // Si el jugador 2 ya perdió, mostrar mensaje YOU WIN
    if (enf.VidaPersonaje2_1 === 0) {
      return res.status(400).json({ mensaje: 'YOU WIN', detalle: 'El Round 1 a concluido, Para seguir peleando valla al Round 2' });
    }
    // RESTRICCIÓN: Si el round ya terminó, no permitir más acciones
    if (enf.VidaPersonaje2_1 === 0) {
      return res.status(400).json({ error: 'El Round 1 a concluido, Para seguir peleando valla al Round 2' });
    }
    const alias1 = enf.AliasPersonaje1_1;
    const alias2 = enf.AliasPersonaje2_1;
    const personaje1 = await buscarPersonajePorAlias(alias1);
    const personaje2 = await buscarPersonajePorAlias(alias2);
    if (!personaje1) {
      return res.status(400).json({ error: `No se encontró el personaje con alias '${alias1}' en superheroes.json ni villains.json` });
    }
    if (!personaje2) {
      return res.status(400).json({ error: `No se encontró el personaje enemigo con alias '${alias2}' en superheroes.json ni villains.json` });
    }
    let golpeIndex = acciones.filter(a => a.AccionRound1 === 'Golpear').length % 3;
    let habilidadUsada = acciones.filter(a => a.AccionRound1 === 'Usar habilidad').length;
    // Restricción de habilidad
    // Buscar el índice del último uso de habilidad
    let lastHabilidadIndex = -1;
    for (let i = acciones.length - 1; i >= 0; i--) {
      if (acciones[i].AccionRound1 === 'Usar habilidad') {
        lastHabilidadIndex = i;
        break;
      }
    }
    // Contar golpes básicos desde el último uso de habilidad
    let golpesDesdeUltimaHabilidad = 0;
    for (let i = acciones.length - 1; i > lastHabilidadIndex; i--) {
      if (acciones[i].AccionRound1 === 'Golpear') {
        golpesDesdeUltimaHabilidad++;
      }
    }
    if (AccionRound1 === 'Usar habilidad') {
      if (golpesDesdeUltimaHabilidad < 3) {
        return res.status(400).json({ error: 'No se puede utilizar habilidad si no se han realizado 3 golpes basicos, una vez ya hecho 3 golpes basicos entonces ya pude utilizar la habilidad pero tendra que realizar 3 golpes basicos de nuevo para volver a usarla' });
      }
    }
    // Restricción de turnos: alternancia
    if (acciones.length > 0 && acciones[acciones.length - 1].jugador === 1) {
      return res.status(400).json({ error: 'No es tu turno, espera a que el segundo jugador realice su turno' });
    }
    // Determinar daño base
    let danoBase = 0;
    let mensaje = '';
    // Asegurar que todos los valores sean numéricos
    const golpes = [
      Number(personaje1.golpeBasico1),
      Number(personaje1.golpeBasico2),
      Number(personaje1.golpeBasico3)
    ];
    const danoHabilidad = Number(personaje1.danoHabilidad);
    const poder = Number(personaje1.poder);
    const danoCrit = Number(personaje1.danoCrit);
    const probCrit = Number(personaje1.probCrit);
    const defensaEnemigo = Number(personaje2.defensa) || 0;
    if (AccionRound1 === 'Golpear') {
      danoBase = golpes[golpeIndex];
      mensaje = 'Se ha golpeado al enemigo';
    } else {
      danoBase = danoHabilidad;
      mensaje = `Se ha activado la habilidad ${personaje1.nombreHabilidad}`;
    }
    // Proceso 2: Probabilidad de crítico
    let danoCritico = danoBase;
    if (Math.random() * 100 < probCrit) {
      danoCritico += danoBase * (danoCrit / 100);
    }
    // Proceso 3: Multiplicador de poder
    let danoConPoder = danoCritico + (danoCritico * (poder / 10));
    // Proceso 4: Defensa del enemigo
    let defensaPorcentaje = defensaEnemigo / 20;
    let vidaRestada = danoConPoder - (danoConPoder * defensaPorcentaje);
    vidaRestada = Math.round(vidaRestada);
    // Actualizar vida del enemigo en enfrentamientos.json
    enf.VidaPersonaje2_1 = Math.max(0, enf.VidaPersonaje2_1 - vidaRestada);
    // Guardar acción en MongoDB (autoincremental TurnoRound1)
    const nuevaAccion = {
      ID_Equipo1: enf.ID_Equipo1,
      AccionRound1,
      DañoRealizadoRound1: Math.round(danoConPoder),
      VidaRestadaEnemigoRound1: vidaRestada,
      jugador: 1
    };
    await accionRound1Repository.addAccion(nuevaAccion);
    // Guardar nueva vida en MongoDB
    await enfrentamientoRepository.updateVidaPersonaje2_1(enf.id, enf.VidaPersonaje2_1);
    // RESTRICCIÓN: Si la vida del enemigo llegó a 0, registrar resultado y mostrar mensajes de fin de round SOLO para el ganador
    if (enf.VidaPersonaje2_1 === 0) {
      const peleasService = await import('../services/peleasService.js');
      await peleasService.default.registrarRound({
        id: enf.id,
        round1: 'Jugador 1'
      });
      return res.status(201).json({ mensaje: 'YOU WIN', detalle: 'El Round 1 a concluido, Para seguir peleando valla al Round 2', accion: nuevaAccion });
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
 */

export default router;
