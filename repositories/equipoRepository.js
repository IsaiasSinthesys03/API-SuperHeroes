import Equipo from '../models/equipoSchema.js';

async function getEquipos() {
    try {
        return await Equipo.find().lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveEquipo(equipoData) {
    try {
        const equipo = new Equipo(equipoData);
        return await equipo.save();
    } catch (error) {
        console.error(error);
        throw error;
    }
}
async function deleteEquipo(id) {
    try {
        return await Equipo.deleteOne({ id: parseInt(id) });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
async function getEquiposByUsername(username) {
    try {
        return await Equipo.find({ username: { $regex: new RegExp('^' + username + '$', 'i') } }).lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function deleteEquipoByIdAndUsername(id, username) {
    try {
        return await Equipo.deleteOne({ id: parseInt(id), username: { $regex: new RegExp('^' + username + '$', 'i') } });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default {
    getEquipos,
    saveEquipo,
    deleteEquipo,
    getEquiposByUsername,
    deleteEquipoByIdAndUsername
};
