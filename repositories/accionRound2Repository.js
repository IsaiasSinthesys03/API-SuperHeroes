


import db from '../db.js';
const coleccion = () => db.collection('acciones_round2');

export default {
  async deleteByEquipoId(equipoId) {
    await coleccion().deleteMany({ ID_Equipo2: equipoId });
  },
  async getAll() {
    return await coleccion().find({}).toArray();
  },
  async getAllByUsername(username) {
    return await coleccion().find({ username: { $regex: new RegExp('^' + username + '$', 'i') } }).toArray();
  },
  async getByEquipoYJugador(ID_Equipo2, jugador) {
    const filtro = { ID_Equipo2 };
    if (typeof jugador !== 'undefined' && jugador !== null) filtro.jugador = jugador;
    return await coleccion().find(filtro).toArray();
  },
  async getByEquipoYJugadorUsername(ID_Equipo2, jugador, username) {
    const filtro = { ID_Equipo2, username: { $regex: new RegExp('^' + username + '$', 'i') } };
    if (typeof jugador !== 'undefined' && jugador !== null) filtro.jugador = jugador;
    return await coleccion().find(filtro).toArray();
  },
  async addAccion(accion) {
    const last = await coleccion().find().sort({ TurnoRound2: -1 }).limit(1).toArray();
    const nextTurno = last.length > 0 ? last[0].TurnoRound2 + 1 : 1;
    accion.TurnoRound2 = nextTurno;
    await coleccion().insertOne(accion);
    return accion;
  },
  async addAccionUsuario(accion, username) {
    const last = await coleccion().find().sort({ TurnoRound2: -1 }).limit(1).toArray();
    const nextTurno = last.length > 0 ? last[0].TurnoRound2 + 1 : 1;
    accion.TurnoRound2 = nextTurno;
    accion.username = username;
    await coleccion().insertOne(accion);
    return accion;
  },
};
