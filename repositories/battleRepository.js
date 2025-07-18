
import Battle from '../models/battleSchema.js';

async function getBattles() {
    try {
        return await Battle.find().lean();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveBattle(battleData) {
    try {
        const battle = new Battle(battleData);
        return await battle.save();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export default {
    getBattles,
    saveBattle
};
