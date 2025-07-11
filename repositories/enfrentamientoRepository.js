import fs from 'fs-extra';
import Enfrentamiento from '../models/enfrentamientoModel.js';

const filePath = './data/enfrentamientos.json';

async function getEnfrentamientos() {
    try {
        const data = await fs.readJson(filePath);
        return data.map(e => new Enfrentamiento(
            e.id,
            e.ID_Equipo1,
            e.AliasPersonaje1_1,
            e.VidaPersonaje1_1,
            e.AliasPersonaje1_2,
            e.VidaPersonaje1_2,
            e.AliasPersonaje1_3,
            e.VidaPersonaje1_3,
            e.ID_Equipo2,
            e.AliasPersonaje2_1,
            e.VidaPersonaje2_1,
            e.AliasPersonaje2_2,
            e.VidaPersonaje2_2,
            e.AliasPersonaje2_3,
            e.VidaPersonaje2_3
        ));
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveEnfrentamientos(enfrentamientos) {
    try {
        await fs.writeJson(filePath, enfrentamientos);
    } catch (error) {
        console.error(error);
    }
}

export default {
    getEnfrentamientos,
    saveEnfrentamientos
};
