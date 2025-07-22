async function updateVillainById(id, updateData) {
    try {
        if ('_id' in updateData) delete updateData._id;
        if ('id' in updateData) delete updateData.id;
        return await Villain.updateOne({ id: parseInt(id) }, { $set: updateData });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
import Villain from '../models/villainSchema.js';

async function getVillainsByUsername(username) {
    try {
        return await Villain.find({ username: { $regex: new RegExp('^' + username + '$', 'i') } }).lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}
async function getVillainsByCityAndUsername(city, username) {
    try {
        return await Villain.find({
            city: { $regex: new RegExp('^' + city + '$', 'i') },
            username: { $regex: new RegExp('^' + username + '$', 'i') }
        }).lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveVillain(villainData) {
    try {
        const villain = new Villain(villainData);
        return await villain.save();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function deleteVillainById(id) {
    try {
        return await Villain.deleteOne({ id: parseInt(id) });
    } catch (error) {
        console.error(error);
        throw error;
    }
}
// Buscar un villano por alias (case-insensitive) en MongoDB
async function getVillainByAlias(alias) {
    try {
        return await Villain.findOne({ alias: { $regex: new RegExp('^' + alias + '$', 'i') } });
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getVillains() {
    try {
        return await Villain.find({}).lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default {
    getVillainsByUsername,
    getVillainByAlias,
    saveVillain,
    deleteVillainById,
    updateVillainById,
    getVillainsByCityAndUsername,
    getVillains // <-- Agregado para uso global
};
