import villainRepository from '../repositories/villainRepository.js';

async function getAllVillains() {
    const villains = await villainRepository.getVillains();
    // Asegura que los golpes básicos estén presentes en la respuesta
    return villains.map(v => ({
        ...v,
        golpeBasico1: v.golpeBasico1,
        golpeBasico2: v.golpeBasico2,
        golpeBasico3: v.golpeBasico3,
        defensa: v.defensa
    }));
}

async function addVillain(villain) {
    if (!villain.name || !villain.alias) {
        throw new Error("El villano debe tener un nombre y un alias.");
    }
    // Validar golpes básicos
    const golpes = [villain.golpeBasico1, villain.golpeBasico2, villain.golpeBasico3];
    for (const golpe of golpes) {
        if (golpe < 0) {
            throw new Error("No se aceptan numeros Negativos, Intentelo Nuevamente");
        }
        if (golpe > 15) {
            throw new Error("No se aceptan valores mayores de 15, Intentelo Nuevamente");
        }
    }
    // Validar daño crítico
    if (villain.danoCrit < 0) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (villain.danoCrit > 100) {
        throw new Error("No se aceptan valores mayores 100, Intentelo Nuevamente");
    }
    // Validar probabilidad crítica
    if (villain.probCrit < 0) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (villain.probCrit > 100) {
        throw new Error("No se aceptan valores mayores 100, Intentelo Nuevamente");
    }
    // Validar nombre de habilidad único
    const villains = await villainRepository.getVillains();
    if (villains.some(v => v.nombreHabilidad && v.nombreHabilidad.toLowerCase() === villain.nombreHabilidad.toLowerCase())) {
        throw new Error("La habilidad ya es existente, Intentelo de nuevo con otro nombre");
    }
    // Validar daño habilidad
    if (villain.danoHabilidad < 0) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (villain.danoHabilidad > 50) {
        throw new Error("No se aceptan valores mayores de 50, Intentelo Nuevamente");
    }
    // Validar poder
    if (villain.poder < 0) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (villain.poder > 10) {
        throw new Error("No se aceptan valores mayores de 10, Intentelo Nuevamente");
    }
    // Validar defensa
    if (villain.defensa < 1) {
        throw new Error("No se aceptan numeros negativos, Intentelo Nuevamente");
    }
    if (villain.defensa > 10) {
        throw new Error("No se aceptan valores mayores de 10, Intentelo Nuevamente");
    }
    if (villains.some(v => v.alias.toLowerCase() === villain.alias.toLowerCase())) {
        throw new Error("El alias ya esta en uso, Intento con otro Nuevo");
    }
    const newId = villains.length > 0 ? Math.max(...villains.map(v => v.id)) + 1 : 1;
    const newVillain = { ...villain, id: newId };

    villains.push(newVillain);
    await villainRepository.saveVillains(villains);

    return newVillain;
}

async function updateVillain(id, updatedVillain) {
    const villains = await villainRepository.getVillains();
    const index = villains.findIndex(villain => villain.id === parseInt(id));

    if (index === -1) {
        throw new Error('Villano no encontrado');
    }

    if ('id' in updatedVillain) {
        delete updatedVillain.id;
    }
    villains[index] = { ...villains[index], ...updatedVillain };

    await villainRepository.saveVillains(villains);
    return villains[index];
}

async function deleteVillain(id) {
    const villains = await villainRepository.getVillains();
    const index = villains.findIndex(villain => villain.id === parseInt(id));

    if (index === -1) {
        throw new Error('Villano no encontrado');
    }

    const filteredVillains = villains.filter(villain => villain.id !== parseInt(id));
    await villainRepository.saveVillains(filteredVillains);
    return { message: 'Villano eliminado' };
}

async function findVillainsByCity(city) {
    const villains = await villainRepository.getVillains();
    return villains.filter(villain => villain.city && villain.city.toLowerCase() === city.toLowerCase());
}

export default {
    getAllVillains,
    addVillain,
    updateVillain,
    deleteVillain,
    findVillainsByCity
};
