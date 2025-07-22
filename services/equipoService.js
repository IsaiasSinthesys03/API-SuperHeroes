import equipoRepository from '../repositories/equipoRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';

async function getAllEquipos(username) {
    return await equipoRepository.getEquiposByUsername(username);
}

async function addEquipo(equipo, username) {
    const equipos = await equipoRepository.getEquiposByUsername(username);
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
            e.AliasPersonaje1?.toLowerCase(),
            e.AliasPersonaje2?.toLowerCase(),
            e.AliasPersonaje3?.toLowerCase()
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
    // Validar existencia de personajes SOLO del usuario
    const userHeroes = await heroRepository.getHeroesByUsername(username);
    const userVillains = await villainRepository.getVillainsByUsername(username);
    const checkHero = async (alias) => {
        if (!userHeroes.some(h => h.alias.toLowerCase() === alias.toLowerCase())) {
            throw new Error("Error, Solo puedes usar héroes que tú creaste");
        }
    };
    const checkVillain = async (alias) => {
        if (!userVillains.some(v => v.alias.toLowerCase() === alias.toLowerCase())) {
            throw new Error("Error, Solo puedes usar villanos que tú creaste");
        }
    };
    if (equipo.Heroe_O_Villano1.toLowerCase() === 'heroe') await checkHero(equipo.AliasPersonaje1);
    if (equipo.Heroe_O_Villano2.toLowerCase() === 'heroe') await checkHero(equipo.AliasPersonaje2);
    if (equipo.Heroe_O_Villano3.toLowerCase() === 'heroe') await checkHero(equipo.AliasPersonaje3);
    if (equipo.Heroe_O_Villano1.toLowerCase() === 'villano') await checkVillain(equipo.AliasPersonaje1);
    if (equipo.Heroe_O_Villano2.toLowerCase() === 'villano') await checkVillain(equipo.AliasPersonaje2);
    if (equipo.Heroe_O_Villano3.toLowerCase() === 'villano') await checkVillain(equipo.AliasPersonaje3);

    // Calcular el id autoincremental global
    const allEquipos = await equipoRepository.getEquipos();
    let newId = 1;
    if (allEquipos.length > 0) {
        newId = Math.max(...allEquipos.map(e => e.id || 0)) + 1;
    }
    // Solo guardar los campos requeridos y asociar username
    const equipoToSave = {
        id: newId,
        Heroe_O_Villano1: equipo.Heroe_O_Villano1,
        AliasPersonaje1: equipo.AliasPersonaje1,
        Heroe_O_Villano2: equipo.Heroe_O_Villano2,
        AliasPersonaje2: equipo.AliasPersonaje2,
        Heroe_O_Villano3: equipo.Heroe_O_Villano3,
        AliasPersonaje3: equipo.AliasPersonaje3,
        username
    };
    return await equipoRepository.saveEquipo(equipoToSave);
}

async function deleteEquipo(id, username) {
    // Solo eliminar si el equipo pertenece al usuario
    const equipos = await equipoRepository.getEquiposByUsername(username);
    const equipo = equipos.find(e => e.id === parseInt(id));
    if (!equipo) {
        throw new Error('No tienes permiso para eliminar este equipo.');
    }
    return await equipoRepository.deleteEquipoByIdAndUsername(id, username);
}

export default { getAllEquipos, addEquipo, deleteEquipo };
export { getAllEquipos, addEquipo, deleteEquipo };
