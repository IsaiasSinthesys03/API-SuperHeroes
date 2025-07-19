// Eliminar todas las acciones asociadas a un ID_Equipo3 en la colección
async function deleteByEquipoId(equipoId) {
    try {
        await (await import('../models/accionRound3Schema.js')).default.deleteMany({ ID_Equipo3: equipoId });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

import AccionRound3 from '../models/accionRound3Schema.js';

// Obtener todas las acciones de Round 3
async function getAcciones() {
    try {
        return await AccionRound3.find().lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Obtener acciones por equipo y jugador
async function getByEquipoYJugador(idEquipo) {
    try {
        return await AccionRound3.find({ ID_Equipo3: idEquipo }).lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Guardar una nueva acción
async function saveAccion(accionData) {
    try {
        const accion = new AccionRound3(accionData);
        return await accion.save();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default {
    getAcciones,
    getByEquipoYJugador,
    saveAccion,
    deleteByEquipoId
};
