import fs from 'fs-extra';
import Battle from '../models/battleModel.js';

const filePath = './data/battles.json';

async function getBattles() {
    try {
        const data = await fs.readJson(filePath);
        return data.map(battle => new Battle(
            battle.id, battle.heroAlias, battle.villainAlias
        ));
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveBattles(battles) {
    try {
        await fs.writeJson(filePath, battles);
    } catch (error) {
        console.error(error);
    }
}

export default {
    getBattles,
    saveBattles
};
