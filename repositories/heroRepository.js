import fs from 'fs-extra';
import Hero from '../models/heroModel.js';

const filePath = './data/superheroes.json'; // Verifica la ruta según tu estructura

async function getHeroes() {
    try {
        const data = await fs.readJson(filePath);
        return data.map(hero => new Hero(
            hero.id, hero.name, hero.alias, hero.city, hero.team,
            hero.golpeBasico1, hero.golpeBasico2, hero.golpeBasico3, hero.danoCrit, hero.probCrit, hero.nombreHabilidad, hero.danoHabilidad, hero.poder, hero.defensa
        ));
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function saveHeroes(heroes) {
    try {
        await fs.writeJson(filePath, heroes);
    } catch (error) {
        console.error(error);
    }
}

export default {
    getHeroes,
    saveHeroes
};
