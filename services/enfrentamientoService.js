import enfrentamientoRepository from '../repositories/enfrentamientoRepository.js';
import equipoRepository from '../repositories/equipoRepository.js';
import fs from 'fs-extra';

async function getAllEnfrentamientos() {
    return await enfrentamientoRepository.getEnfrentamientos();
}

async function addEnfrentamiento({ ID_Equipo1, ID_Equipo2 }) {
    const equipos = await equipoRepository.getEquipos();
    const equipo1 = equipos.find(e => e.id === parseInt(ID_Equipo1));
    const equipo2 = equipos.find(e => e.id === parseInt(ID_Equipo2));
    if (!equipo1 || !equipo2) {
        throw new Error("Error, ID del equipo no existente, Intentelo de nuevo");
    }
    // Obtener enfrentamientos existentes
    const enfrentamientos = await enfrentamientoRepository.getEnfrentamientos();
    // Calcular el id autoincremental
    let nextId = 1;
    if (enfrentamientos.length > 0) {
        nextId = Math.max(...enfrentamientos.map(e => e.id || 0)) + 1;
    }
    // Construir el enfrentamiento con alias y vida 100
    const newEnfrentamiento = {
        id: nextId,
        ID_Equipo1: equipo1.id,
        AliasPersonaje1_1: equipo1.AliasPersonaje1,
        VidaPersonaje1_1: 100,
        AliasPersonaje1_2: equipo1.AliasPersonaje2,
        VidaPersonaje1_2: 100,
        AliasPersonaje1_3: equipo1.AliasPersonaje3,
        VidaPersonaje1_3: 100,
        ID_Equipo2: equipo2.id,
        AliasPersonaje2_1: equipo2.AliasPersonaje1,
        VidaPersonaje2_1: 100,
        AliasPersonaje2_2: equipo2.AliasPersonaje2,
        VidaPersonaje2_2: 100,
        AliasPersonaje2_3: equipo2.AliasPersonaje3,
        VidaPersonaje2_3: 100
    };
    await enfrentamientoRepository.saveEnfrentamiento(newEnfrentamiento);
    return newEnfrentamiento;
}

async function deleteEnfrentamiento(id) {
    // Buscar el enfrentamiento en la base de datos
    const enfrentamientos = await enfrentamientoRepository.getEnfrentamientos();
    const index = enfrentamientos.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
        throw new Error('Enfrentamiento no encontrado');
    }
    // Obtener el ID_Equipo1 y ID_Equipo2 del enfrentamiento a eliminar
    const { ID_Equipo1, ID_Equipo2 } = enfrentamientos[index];
    // Eliminar enfrentamiento en MongoDB
    const deleteResult = await enfrentamientoRepository.deleteEnfrentamientoById(id);
    if (deleteResult.deletedCount === 0) {
        throw new Error('No se pudo eliminar el enfrentamiento de la base de datos');
    }
    // Eliminar acciones asociadas en AccionRound1.json, AccionRound2.json y AccionRound3.json
    const accionRound1Path = './data/AccionRound1.json';
    const accionRound2Path = './data/AccionRound2.json';
    const accionRound3Path = './data/AccionRound3.json';
    let accionesRound1 = await fs.readJson(accionRound1Path);
    let accionesRound2 = await fs.readJson(accionRound2Path);
    let accionesRound3 = await fs.readJson(accionRound3Path);
    // Filtrar acciones por ID_Equipo1 e ID_Equipo2 del enfrentamiento eliminado
    accionesRound1 = accionesRound1.filter(a => a.ID_Equipo1 !== ID_Equipo1 && a.ID_Equipo1 !== ID_Equipo2);
    accionesRound2 = accionesRound2.filter(a => a.ID_Equipo1 !== ID_Equipo1 && a.ID_Equipo1 !== ID_Equipo2);
    accionesRound3 = accionesRound3.filter(a => a.ID_Equipo1 !== ID_Equipo1 && a.ID_Equipo1 !== ID_Equipo2 && a.ID_Equipo2 !== ID_Equipo1 && a.ID_Equipo2 !== ID_Equipo2);
    await fs.writeJson(accionRound1Path, accionesRound1);
    await fs.writeJson(accionRound2Path, accionesRound2);
    await fs.writeJson(accionRound3Path, accionesRound3);

    // Eliminar todo el contenido de Peleas.json
    const peleasPath = './data/Peleas.json';
    await fs.writeJson(peleasPath, []);
    return { message: 'Enfrentamiento, acciones asociadas y resultados eliminados' };
}

export default {
    getAllEnfrentamientos,
    addEnfrentamiento,
    deleteEnfrentamiento
};
