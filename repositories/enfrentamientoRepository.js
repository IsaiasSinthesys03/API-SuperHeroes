
import Enfrentamiento from '../models/enfrentamientoSchema.js';

async function getEnfrentamientos() {
    try {
        return await Enfrentamiento.find();
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
    ,
    async deleteEnfrentamientoById(id) {
        try {
            return await Enfrentamiento.deleteOne({ id: parseInt(id) });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};
