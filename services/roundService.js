import fs from 'fs-extra';

export async function obtenerEnfrentamientoActivo() {
  const enfrentamientos = await fs.readJson('./data/enfrentamientos.json');
  return enfrentamientos[0];
}

export async function buscarPersonajePorAlias(alias) {
  const heroes = await fs.readJson('./data/superheroes.json');
  const villanos = await fs.readJson('./data/villains.json');
  return heroes.find(h => h.alias === alias) || villanos.find(v => v.alias === alias);
}

export async function ganadorRound2() {
  // Aquí deberías validar si hay un ganador en round 2
  // Por simplicidad, retorna true si VidaPersonaje1_2 o VidaPersonaje2_2 es 0
  const enf = await obtenerEnfrentamientoActivo();
  return enf.VidaPersonaje1_2 === 0 || enf.VidaPersonaje2_2 === 0;
}

export async function registrarGanadorRound3(jugador) {
  // Guarda el ganador del round 3 en Peleas.json
  const peleas = await fs.readJson('./data/Peleas.json');
  peleas.push({ round: 3, ganador: jugador });
  await fs.writeJson('./data/Peleas.json', peleas);
}
