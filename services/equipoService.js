import equipoRepository from '../repositories/equipoRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';

async function getAllEquipos() {
    return await equipoRepository.getEquipos();
}

async function addEquipo(equipo) {
    const equipos = await equipoRepository.getEquipos();
    // Validar que no se repitan personajes
    const aliasSet = new Set([
        equipo.AliasPersonaje1,
        equipo.AliasPersonaje2,
        equipo.AliasPersonaje3
    ]);
    if (aliasSet.size < 3) {
        throw new Error("Error, No se pueden repetir los mismos personajes en el mismo equipo");
    }
    // Validar si ya existe un equipo con los mismos personajes (sin importar el orden)
    if (equipos.some(e => {
        const equipoActual = [
            e.AliasPersonaje1.toLowerCase(),
            e.AliasPersonaje2.toLowerCase(),
            e.AliasPersonaje3.toLowerCase()
        ].sort().join(',');
        const equipoNuevo = [
            equipo.AliasPersonaje1.toLowerCase(),
            equipo.AliasPersonaje2.toLowerCase(),
            equipo.AliasPersonaje3.toLowerCase()
        ].sort().join(',');
        return equipoActual === equipoNuevo;
    })) {
        throw new Error("Error, Este equipo ya existe");
    }
    // Validar existencia de personajes
    if (equipo.Heroe_O_Villano1.toLowerCase() === 'heroe') {
        const heroes = await heroRepository.getHeroes();
        if (!heroes.some(h => h.alias.toLowerCase() === equipo.AliasPersonaje1.toLowerCase())) {
            throw new Error("Error, Uno de los Heroes no existe");
        }
    } else if (equipo.Heroe_O_Villano1.toLowerCase() === 'villano') {
        const villains = await villainRepository.getVillains();
        if (!villains.some(v => v.alias.toLowerCase() === equipo.AliasPersonaje1.toLowerCase())) {
            throw new Error("Error, Uno de los villanos no existe");
        }
    }
    if (equipo.Heroe_O_Villano2.toLowerCase() === 'heroe') {
        const heroes = await heroRepository.getHeroes();
        if (!heroes.some(h => h.alias.toLowerCase() === equipo.AliasPersonaje2.toLowerCase())) {
            throw new Error("Error, Uno de los Heroes no existe");
        }
    } else if (equipo.Heroe_O_Villano2.toLowerCase() === 'villano') {
        const villains = await villainRepository.getVillains();
        if (!villains.some(v => v.alias.toLowerCase() === equipo.AliasPersonaje2.toLowerCase())) {
            throw new Error("Error, Uno de los villanos no existe");
        }
    }
    if (equipo.Heroe_O_Villano3.toLowerCase() === 'heroe') {
        const heroes = await heroRepository.getHeroes();
        if (!heroes.some(h => h.alias.toLowerCase() === equipo.AliasPersonaje3.toLowerCase())) {
            throw new Error("Error, Uno de los Heroes no existe");
        }
    } else if (equipo.Heroe_O_Villano3.toLowerCase() === 'villano') {
        const villains = await villainRepository.getVillains();
        if (!villains.some(v => v.alias.toLowerCase() === equipo.AliasPersonaje3.toLowerCase())) {
            throw new Error("Error, Uno de los villanos no existe");
        }
    }
    // Asignar ID
    const newId = equipos.length > 0 ? Math.max(...equipos.map(e => e.id)) + 1 : 1;
    const newEquipo = { ...equipo, id: newId };
    equipos.push(newEquipo);
    await equipoRepository.saveEquipos(equipos);
    return newEquipo;
}

async function deleteEquipo(id) {
    const equipos = await equipoRepository.getEquipos();
    const index = equipos.findIndex(equipo => equipo.id === parseInt(id));
    if (index === -1) {
        throw new Error('Equipo no encontrado');
    }
    const filteredEquipos = equipos.filter(equipo => equipo.id !== parseInt(id));
    await equipoRepository.saveEquipos(filteredEquipos);
    return { message: 'Equipo eliminado' };
}

export default {
    getAllEquipos,
    addEquipo,
    deleteEquipo
};
