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

async function getEnfrentamientosByUsername(username) {
    try {
        return await Enfrentamiento.find({ username: { $regex: new RegExp('^' + username + '$', 'i') } });
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default {
    getEnfrentamientos,
    saveEnfrentamiento,
    async deleteEnfrentamientoById(id) {
        try {
            return await Enfrentamiento.deleteOne({ id: parseInt(id) });
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    async updateVidaPersonaje1_1(id, nuevaVida) {
        try {
            return await Enfrentamiento.updateOne(
                { id: parseInt(id) },
                { $set: { VidaPersonaje1_1: nuevaVida } }
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    async updateVidaPersonaje2_1(id, nuevaVida) {
        try {
            return await Enfrentamiento.updateOne(
                { id: parseInt(id) },
                { $set: { VidaPersonaje2_1: nuevaVida } }
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    async updateVidaPersonaje1_2(id, nuevaVida) {
        try {
            return await Enfrentamiento.updateOne(
                { id: parseInt(id) },
                { $set: { VidaPersonaje1_2: nuevaVida } }
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    async updateVidaPersonaje2_2(id, nuevaVida) {
        try {
            return await Enfrentamiento.updateOne(
                { id: parseInt(id) },
                { $set: { VidaPersonaje2_2: nuevaVida } }
            );
        } catch (error) {
            console.error(error);
            throw error;
        }

    },
    async updateVidaPersonaje1_3(id, nuevaVida) {
        try {
            return await Enfrentamiento.updateOne(
                { id: parseInt(id) },
                { $set: { VidaPersonaje1_3: nuevaVida } }
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    async updateVidaPersonaje2_3(id, nuevaVida) {
        try {
            return await Enfrentamiento.updateOne(
                { id: parseInt(id) },
                { $set: { VidaPersonaje2_3: nuevaVida } }
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    deleteEnfrentamientoByIdAndUsername: async function (id, username) {
        try {
            return await Enfrentamiento.deleteOne({ id: parseInt(id), username: { $regex: new RegExp('^' + username + '$', 'i') } });
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    getEnfrentamientosByUsername
};
