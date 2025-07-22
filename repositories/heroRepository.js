async function deleteHeroById(id) {
    try {
        return await Hero.deleteOne({ id: parseInt(id) });
    } catch (error) {
        console.error(error);
        throw error;
    }
}


import Hero from '../models/heroSchema.js';

async function getHeroes() {
    try {
        return await Hero.find().lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function updateHeroById(id, updateData) {
    try {
        // No permitir modificar _id
        if ('_id' in updateData) delete updateData._id;
        return await Hero.updateOne({ id: parseInt(id) }, { $set: updateData });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function saveHero(heroData) {
    try {
        const hero = new Hero(heroData);
        return await hero.save();
    } catch (error) {
        console.error(error);
        throw error;
    }
}
// Buscar un héroe por alias (case-insensitive) en MongoDB
async function getHeroByAlias(alias) {
    try {
        return await Hero.findOne({ alias: { $regex: new RegExp('^' + alias + '$', 'i') } }).lean();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getHeroesByUsername(username) {
    try {
        // Buscar por username case-insensitive
        return await Hero.find({ username: { $regex: new RegExp('^' + username + '$', 'i') } }).lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default {
    getHeroes,
    getHeroByAlias,
    saveHero,
    deleteHeroById,
    updateHeroById,
    getHeroesByUsername
};
