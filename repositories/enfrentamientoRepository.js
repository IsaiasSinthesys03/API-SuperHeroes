
import Enfrentamiento from '../models/enfrentamientoSchema.js';

async function getEnfrentamientos() {
    try {
        return await Enfrentamiento.find().lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveEnfrentamiento(enfrentamientoData) {
    try {
        const enfrentamiento = new Enfrentamiento(enfrentamientoData);
        return await enfrentamiento.save();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default {
    getEnfrentamientos,
    saveEnfrentamiento
};
