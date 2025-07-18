import heroRepository from '../repositories/heroRepository.js';

async function getAllHeroes() {
    const heroes = await heroRepository.getHeroes();
    // Asegura que los golpes básicos estén presentes en la respuesta
    return heroes.map(h => ({
        ...h,
        golpeBasico1: h.golpeBasico1,
        golpeBasico2: h.golpeBasico2,
        golpeBasico3: h.golpeBasico3,
        defensa: h.defensa
    }));
}

async function addHero(hero) {
    if (!hero.name || !hero.alias) {
        throw new Error("El héroe debe tener un nombre y un alias.");
    }
    // Validar golpes básicos
    const golpes = [hero.golpeBasico1, hero.golpeBasico2, hero.golpeBasico3];
    for (const golpe of golpes) {
        if (golpe < 0) {
            throw new Error("No se aceptan numeros Negativos, Intentelo Nuevamente");
        }
        if (golpe > 15) {
            throw new Error("No se aceptan valores mayores de 15, Intentelo Nuevamente");
        }
    }
    // Validar daño crítico
    if (hero.danoCrit < 0) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (hero.danoCrit > 100) {
        throw new Error("No se aceptan valores mayores 100, Intentelo Nuevamente");
    }
    // Validar probabilidad crítica
    if (hero.probCrit < 0) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (hero.probCrit > 100) {
        throw new Error("No se aceptan valores mayores 100, Intentelo Nuevamente");
    }
    // Validar nombre de habilidad único
    const heroes = await heroRepository.getHeroes();
    if (heroes.some(h => h.nombreHabilidad && h.nombreHabilidad.toLowerCase() === hero.nombreHabilidad.toLowerCase())) {
        throw new Error("La habilidad ya es existente, Intentelo de nuevo con otro nombre");
    }
    // Validar daño habilidad
    if (hero.danoHabilidad < 0) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (hero.danoHabilidad > 50) {
        throw new Error("No se aceptan valores mayores de 50, Intentelo Nuevamente");
    }
    // Validar poder
    if (hero.poder < 0) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (hero.poder > 10) {
        throw new Error("No se aceptan valores mayores de 10, Intentelo Nuevamente");
    }
    // Validar defensa
    if (hero.defensa < 1) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (hero.defensa > 10) {
        throw new Error("No se aceptan valores mayores de 10, Intentelo Nuevamente");
    }
    // Verificar si el alias ya existe (case-insensitive)
    if (heroes.some(h => h.alias.toLowerCase() === hero.alias.toLowerCase())) {
        throw new Error("El alias ya esta en uso, Intento con otro Nuevo");
    }
    // Eliminar solo _id si viene en el body para evitar duplicados
    if ('_id' in hero) delete hero._id;
    // Usar la declaración existente de heroes (ya está arriba en la función)
    let newId = 1;
    if (heroes.length > 0) {
        newId = Math.max(...heroes.map(h => h.id)) + 1;
    }
    hero.id = newId;
    const savedHero = await heroRepository.saveHero(hero);
    return savedHero;
}

async function updateHero(id, updatedHero) {
    const heroes = await heroRepository.getHeroes();
    const index = heroes.findIndex(hero => hero.id === parseInt(id));

    if (index === -1) {
        throw new Error('Héroe no encontrado');
    }


    // No permitir modificar el id ni el _id
    if ('id' in updatedHero) delete updatedHero.id;
    if ('_id' in updatedHero) delete updatedHero._id;
    const result = await heroRepository.updateHeroById(id, updatedHero);
    if (result.matchedCount === 0) {
        throw new Error('Héroe no encontrado');
    }
    // Retornar el héroe actualizado
    const updatedHeroes = await heroRepository.getHeroes();
    return updatedHeroes.find(hero => hero.id === parseInt(id));
}

async function deleteHero(id) {
    const result = await heroRepository.deleteHeroById(id);
    if (result.deletedCount === 0) {
        throw new Error('Héroe no encontrado');
    }
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
    for (const battle of battles) {
        await battleRepository.saveBattle(battle);
    }
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
