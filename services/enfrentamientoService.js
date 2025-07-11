import enfrentamientoRepository from '../repositories/enfrentamientoRepository.js';
import equipoRepository from '../repositories/equipoRepository.js';

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
    // Construir el enfrentamiento con alias y vida 1000
    const newEnfrentamiento = {
        id: Date.now(),
        ID_Equipo1: equipo1.id,
        AliasPersonaje1_1: equipo1.AliasPersonaje1,
        VidaPersonaje1_1: 1000,
        AliasPersonaje1_2: equipo1.AliasPersonaje2,
        VidaPersonaje1_2: 1000,
        AliasPersonaje1_3: equipo1.AliasPersonaje3,
        VidaPersonaje1_3: 1000,
        ID_Equipo2: equipo2.id,
        AliasPersonaje2_1: equipo2.AliasPersonaje1,
        VidaPersonaje2_1: 1000,
        AliasPersonaje2_2: equipo2.AliasPersonaje2,
        VidaPersonaje2_2: 1000,
        AliasPersonaje2_3: equipo2.AliasPersonaje3,
        VidaPersonaje2_3: 1000
    };
    const enfrentamientos = await enfrentamientoRepository.getEnfrentamientos();
    enfrentamientos.push(newEnfrentamiento);
    await enfrentamientoRepository.saveEnfrentamientos(enfrentamientos);
    return newEnfrentamiento;
}

async function deleteEnfrentamiento(id) {
    const enfrentamientos = await enfrentamientoRepository.getEnfrentamientos();
    const index = enfrentamientos.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
        throw new Error('Enfrentamiento no encontrado');
    }
    const filtered = enfrentamientos.filter(e => e.id !== parseInt(id));
    await enfrentamientoRepository.saveEnfrentamientos(filtered);
    return { message: 'Enfrentamiento eliminado' };
}

export default {
    getAllEnfrentamientos,
    addEnfrentamiento,
    deleteEnfrentamiento
};
