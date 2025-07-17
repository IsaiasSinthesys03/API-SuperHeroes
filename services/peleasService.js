import fs from 'fs-extra';
const peleasPath = './data/Peleas.json';

async function registrarRound({ id, round1, round2, round3 }) {
  let peleas = await fs.readJson(peleasPath);
  let pelea = peleas.find(p => p.id === id);
  if (!pelea) {
    pelea = { id, round1: null, round2: null, round3: null };
    peleas.push(pelea);
  }
  if (round1) pelea.round1 = round1;
  if (round2) pelea.round2 = round2;
  if (round3) pelea.round3 = round3;
  // Elimina cualquier propiedad extra
  Object.keys(pelea).forEach(key => {
    if (!['id', 'round1', 'round2', 'round3'].includes(key)) {
      delete pelea[key];
    }
  });
  await fs.writeJson(peleasPath, peleas);
}

export default {
  registrarRound
};
