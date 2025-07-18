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

async function getVillains() {
    try {
        return await Villain.find();
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

export default {
    getVillains,
    saveVillain,
    deleteVillainById,
    updateVillainById
};
