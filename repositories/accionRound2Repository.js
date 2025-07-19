import db from '../db.js';

const coleccion = () => db.collection('acciones_round2');

export default {
  // Eliminar todas las acciones asociadas a un ID_Equipo2 en la colección
  async deleteByEquipoId(equipoId) {
    await coleccion().deleteMany({ ID_Equipo2: equipoId });
  },
  // Obtener todas las acciones del round 2
  async getAll() {
    return await coleccion().find({}).toArray();
  },

  // Obtener acciones por ID_Equipo2 y/o jugador
  async getByEquipoYJugador(ID_Equipo2, jugador) {
    const filtro = { ID_Equipo2 };
    if (typeof jugador !== 'undefined' && jugador !== null) filtro.jugador = jugador;
    return await coleccion().find(filtro).toArray();
  },

  // Agregar una nueva acción (autoincremental manual)
  async addAccion(accion) {
    // Obtener el ID más alto
    const last = await coleccion().find().sort({ TurnoRound2: -1 }).limit(1).toArray();
    const nextTurno = last.length > 0 ? last[0].TurnoRound2 + 1 : 1;
    accion.TurnoRound2 = nextTurno;
    await coleccion().insertOne(accion);
    return accion;
  },
};
