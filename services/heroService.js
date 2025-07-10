import heroRepository from '../repositories/heroRepository.js';

async function getAllHeroes() {
    return await heroRepository.getHeroes();
}

async function addHero(hero) {
    if (!hero.name || !hero.alias) {
        throw new Error("El héroe debe tener un nombre y un alias.");
    }

    const heroes = await heroRepository.getHeroes();
    // Verificar si el alias ya existe (case-insensitive)
    if (heroes.some(h => h.alias.toLowerCase() === hero.alias.toLowerCase())) {
        throw new Error("El alias ya esta en uso, Intento con otro Nuevo");
    }
    const newId = heroes.length > 0 ? Math.max(...heroes.map(h => h.id)) + 1 : 1;
    const newHero = { ...hero, id: newId };

    heroes.push(newHero);
    await heroRepository.saveHeroes(heroes);

    return newHero;
}

async function updateHero(id, updatedHero) {
    const heroes = await heroRepository.getHeroes();
    const index = heroes.findIndex(hero => hero.id === parseInt(id));

    if (index === -1) {
        throw new Error('Héroe no encontrado');
    }

    // Eliminar el campo id si viene en el body para evitar que se modifique
    if ('id' in updatedHero) {
        delete updatedHero.id;
    }
    heroes[index] = { ...heroes[index], ...updatedHero };

    await heroRepository.saveHeroes(heroes);
    return heroes[index];
}

async function deleteHero(id) {
    const heroes = await heroRepository.getHeroes();
    const index = heroes.findIndex(hero => hero.id === parseInt(id));

    if (index === -1) {
        throw new Error('Héroe no encontrado');
    }

    const filteredHeroes = heroes.filter(hero => hero.id !== parseInt(id));
    await heroRepository.saveHeroes(filteredHeroes);
    return { message: 'Héroe eliminado' };
}

async function findHeroesByCity(city) {
    const heroes = await heroRepository.getHeroes();
    return heroes.filter(hero => hero.city && hero.city.toLowerCase() === city.toLowerCase());
}

async function faceVillain(heroId, villainId) {
    const heroes = await heroRepository.getHeroes();
    const hero = heroes.find(hero => hero.id === parseInt(heroId));
    if (!hero) {
        throw new Error('Héroe no encontrado');
    }
    // Buscar villano por id
    const villainRepository = (await import('../repositories/villainRepository.js')).default;
    const villains = await villainRepository.getVillains();
    const villain = villains.find(v => v.id === parseInt(villainId));
    if (!villain) {
        throw new Error('Villano no encontrado');
    }
    // Registrar batalla en battles.json
    const battleRepository = (await import('../repositories/battleRepository.js')).default;
    const battles = await battleRepository.getBattles();
    const newId = battles.length > 0 ? Math.max(...battles.map(b => b.id)) + 1 : 1;
    const newBattle = { id: newId, heroAlias: hero.alias, villainAlias: villain.alias };
    battles.push(newBattle);
    await battleRepository.saveBattles(battles);
    return `${hero.alias} enfrenta a ${villain.alias}`;
}

export default {
    getAllHeroes,
    addHero,
    updateHero,
    deleteHero,
    findHeroesByCity,
    faceVillain
};
