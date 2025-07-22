import villainRepository from '../repositories/villainRepository.js';

async function getAllVillains(username) {
    const villains = await villainRepository.getVillainsByUsername(username);
    return villains.map(v => ({
        ...v,
        golpeBasico1: v.golpeBasico1,
        golpeBasico2: v.golpeBasico2,
        golpeBasico3: v.golpeBasico3,
        defensa: v.defensa
    }));
}

async function addVillain(villain, username) {
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
    // Validar nombre de habilidad único (por usuario)
    const userVillains = await villainRepository.getVillainsByUsername(username);
    if (userVillains.some(v => v.nombreHabilidad && v.nombreHabilidad.toLowerCase() === villain.nombreHabilidad.toLowerCase())) {
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
    if (userVillains.some(v => v.alias.toLowerCase() === villain.alias.toLowerCase())) {
        throw new Error("El alias ya esta en uso, Intento con otro Nuevo");
    }
    // Eliminar _id si viene en el body para evitar duplicados
    if ('_id' in villain) delete villain._id;
    // Obtener todos los villanos globalmente para asignar id único
    const allVillains = await villainRepository.getVillains();
    const newId = allVillains.length > 0 ? Math.max(...allVillains.map(v => v.id)) + 1 : 1;
    const newVillain = { ...villain, id: newId };
    const savedVillain = await villainRepository.saveVillain(newVillain);
    return savedVillain;
}

async function updateVillain(id, updatedVillain) {
    if ('id' in updatedVillain) delete updatedVillain.id;
    if ('_id' in updatedVillain) delete updatedVillain._id;
    const result = await villainRepository.updateVillainById(id, updatedVillain);
    if (result.matchedCount === 0) {
        throw new Error('Villano no encontrado');
    }
    const villains = await villainRepository.getVillains();
    return villains.find(villain => villain.id === parseInt(id));
}

async function deleteVillain(id) {
    const result = await villainRepository.deleteVillainById(id);
    if (result.deletedCount === 0) {
        throw new Error('Villano no encontrado');
    }
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
