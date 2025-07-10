import battleRepository from '../repositories/battleRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';

async function getAllBattles() {
    return await battleRepository.getBattles();
}

async function addBattle({ heroAlias, villainAlias }) {
    const heroes = await heroRepository.getHeroes();
    const villains = await villainRepository.getVillains();
    const hero = heroes.find(h => h.alias.toLowerCase() === heroAlias.toLowerCase());
    const villain = villains.find(v => v.alias.toLowerCase() === villainAlias.toLowerCase());
    if (!hero) throw new Error('Heroe no encontrado');
    if (!villain) throw new Error('Villano no encontrado');
    const battles = await battleRepository.getBattles();
    const newId = battles.length > 0 ? Math.max(...battles.map(b => b.id)) + 1 : 1;
    const newBattle = { id: newId, heroAlias: hero.alias, villainAlias: villain.alias };
    battles.push(newBattle);
    await battleRepository.saveBattles(battles);
    return newBattle;
}

async function updateBattle(id, { heroAlias, villainAlias }) {
    const battles = await battleRepository.getBattles();
    const index = battles.findIndex(b => b.id === parseInt(id));
    if (index === -1) throw new Error('Batalla no encontrada');
    const heroes = await heroRepository.getHeroes();
    const villains = await villainRepository.getVillains();
    const hero = heroes.find(h => h.alias.toLowerCase() === heroAlias.toLowerCase());
    const villain = villains.find(v => v.alias.toLowerCase() === villainAlias.toLowerCase());
    if (!hero) throw new Error('Heroe no encontrado');
    if (!villain) throw new Error('Villano no encontrado');
    battles[index] = { ...battles[index], heroAlias: hero.alias, villainAlias: villain.alias };
    await battleRepository.saveBattles(battles);
    return battles[index];
}

async function deleteBattle(id) {
    const battles = await battleRepository.getBattles();
    const index = battles.findIndex(b => b.id === parseInt(id));
    if (index === -1) throw new Error('Batalla no encontrada');
    const filteredBattles = battles.filter(b => b.id !== parseInt(id));
    await battleRepository.saveBattles(filteredBattles);
    return { message: 'Batalla eliminada' };
}

export default {
    getAllBattles,
    addBattle,
    updateBattle,
    deleteBattle
};
