import fs from 'fs-extra';
import Equipo from '../models/equipoModel.js';

const filePath = './data/equipos.json';

async function getEquipos() {
    try {
        const data = await fs.readJson(filePath);
        return data.map(equipo => new Equipo(
            equipo.id,
            equipo.Heroe_O_Villano1,
            equipo.AliasPersonaje1,
            equipo.Heroe_O_Villano2,
            equipo.AliasPersonaje2,
            equipo.Heroe_O_Villano3,
            equipo.AliasPersonaje3
        ));
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveEquipos(equipos) {
    try {
        await fs.writeJson(filePath, equipos);
    } catch (error) {
        console.error(error);
    }
}

export default {
    getEquipos,
    saveEquipos
};
