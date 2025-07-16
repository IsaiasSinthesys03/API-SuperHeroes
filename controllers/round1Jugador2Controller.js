import express from 'express';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();
const accionFile = path.resolve('./data/AccionRound1.json');
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

/**
 * @swagger
 * /round1jugador2/estados-vida:
 *   get:
 *     summary: Estados de Vida Jugador 2
 *     description: Muestra el estado de vida de los personajes del round 1 para el jugador 2.
 *     tags: [Round1Jugador2]
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
router.get('/round1jugador2/estados-vida', async (req, res) => {
  try {
    const enf = await obtenerEnfrentamientoActivo();
    // ...existing code...
    res.json({
      TuPersonaje: enf.AliasPersonaje2_1,
      Tuvida: enf.VidaPersonaje2_1,
      TuEnemigo: enf.AliasPersonaje1_1,
      VidaEnemigo: enf.VidaPersonaje1_1
    });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el estado de vida.' });
  }
});

/**
 * @swagger
 * /round1jugador2/acciones:
 *   get:
 *     summary: Registro de Acciones Jugador 2
 *     description: Muestra todas las acciones registradas por el jugador 2 en el round 1.
 *     tags: [Round1Jugador2]
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
router.get('/round1jugador2/acciones', async (req, res) => {
  try {
    const acciones = await fs.readJson(accionFile);
    // Opcional: filtrar solo las acciones del jugador 2 si se requiere
    res.json(acciones);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el registro de acciones.' });
  }
});

/**
 * @swagger
 * /round1jugador2/atacar:
 *   post:
 *     summary: ATACAR Jugador 2
 *     description: Registra una acción de ataque o habilidad en el round 1 para el jugador 2.
 *     tags: [Round1Jugador2]
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
router.post('/round1jugador2/atacar', async (req, res) => {
  try {
    const { AccionRound1 } = req.body;
    if (!['Golpear', 'Usar habilidad'].includes(AccionRound1)) {
      return res.status(400).json({ error: 'Error, Accion no valida, solo se aceptan Golpear y Usar habilidad, intentelo de nuevo' });
    }
    // Cargar datos
    const enf = await obtenerEnfrentamientoActivo();
    const acciones = await fs.readJson(accionFile);
    // Si el jugador 2 ya perdió, mostrar mensaje YOU LOSE
    if (enf.VidaPersonaje2_1 === 0) {
      return res.status(400).json({ mensaje: 'YOU LOSE', detalle: 'El Round 1 a concluido, Para seguir peleando valla al Round 2' });
    }
    // Si el jugador 1 ya perdió, mostrar mensaje YOU WIN
    if (enf.VidaPersonaje1_1 === 0) {
      return res.status(400).json({ mensaje: 'YOU WIN', detalle: 'El Round 1 a concluido, Para seguir peleando valla al Round 2' });
    }
    // RESTRICCIÓN: Si el round ya terminó, no permitir más acciones
    if (enf.VidaPersonaje1_1 === 0) {
      return res.status(400).json({ error: 'El Round 1 a concluido, Para seguir peleando valla al Round 2' });
    }
    // Restricción de turnos: alternancia
    if (acciones.length > 0 && acciones[acciones.length - 1].jugador === 2) {
      return res.status(400).json({ error: 'No es tu turno, espera a que el primer jugador realice su turno' });
    }
    const alias2 = enf.AliasPersonaje2_1;
    const alias1 = enf.AliasPersonaje1_1;
    const personaje2 = await buscarPersonajePorAlias(alias2);
    const personaje1 = await buscarPersonajePorAlias(alias1);
    if (!personaje2) {
      return res.status(400).json({ error: `No se encontró el personaje con alias '${alias2}' en superheroes.json ni villains.json` });
    }
    if (!personaje1) {
      return res.status(400).json({ error: `No se encontró el personaje enemigo con alias '${alias1}' en superheroes.json ni villains.json` });
    }
    // Lógica de golpes y habilidad (idéntica pero usando personaje2 como atacante y personaje1 como defensor)
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
    if (AccionRound1 === 'Usar habilidad') {
      if (golpesDesdeUltimaHabilidad < 3) {
        return res.status(400).json({ error: 'No se puede utilizar habilidad si no se han realizado 3 golpes basicos, una vez ya hecho 3 golpes basicos entonces ya pude utilizar la habilidad pero tendra que realizar 3 golpes basicos de nuevo para volver a usarla' });
      }
    }
    // Determinar daño base
    let golpeIndex = acciones.filter(a => a.ID_Equipo1 === enf.ID_Equipo1 && a.jugador === 2 && a.AccionRound1 === 'Golpear').length % 3;
    let danoBase = 0;
    let mensaje = '';
    if (AccionRound1 === 'Golpear') {
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
    let defensaPorcentaje = defensaEnemigo / 20;
    let vidaRestada = danoConPoder - (danoConPoder * defensaPorcentaje);
    vidaRestada = Math.round(vidaRestada);
    // Actualizar vida del enemigo en enfrentamientos.json
    enf.VidaPersonaje1_1 = Math.max(0, enf.VidaPersonaje1_1 - vidaRestada);
    // Guardar acción
    const nuevaAccion = {
      TurnoRound1: acciones.length + 1,
      ID_Equipo1: enf.ID_Equipo1,
      AccionRound1,
      DañoRealizadoRound1: Math.round(danoConPoder),
      VidaRestadaEnemigoRound1: vidaRestada,
      jugador: 2
    };
    acciones.push(nuevaAccion);
    await fs.writeJson(accionFile, acciones);
    // Guardar nueva vida en enfrentamientos.json
    const enfrentamientos = await fs.readJson(enfrentamientosFile);
    enfrentamientos[0].VidaPersonaje1_1 = enf.VidaPersonaje1_1;
    await fs.writeJson(enfrentamientosFile, enfrentamientos);
    // RESTRICCIÓN: Si la vida del enemigo llegó a 0, mostrar mensajes de fin de round SOLO para el ganador
    if (enf.VidaPersonaje1_1 === 0) {
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
 *         jugador:
 *           type: integer
 */

export default router;
