import enfrentamientoRepository from '../repositories/enfrentamientoRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villainRepository from '../repositories/villainRepository.js';
import peleasService from './peleasService.js';

// Obtener el enfrentamiento activo desde MongoDB
export async function obtenerEnfrentamientoActivo() {
  const enfrentamientos = await enfrentamientoRepository.getEnfrentamientos();
  return enfrentamientos[0];
}

// Buscar personaje por alias en MongoDB
export async function buscarPersonajePorAlias(alias) {
  let personaje = await heroRepository.getHeroByAlias(alias);
  if (personaje) return personaje;
  personaje = await villainRepository.getVillainByAlias(alias);
  return personaje;
}

// Validar si hay ganador en round 2 (usando datos de MongoDB)
export async function ganadorRound2() {
  const enf = await obtenerEnfrentamientoActivo();
  if (!enf || enf.VidaPersonaje1_2 === undefined || enf.VidaPersonaje2_2 === undefined) {
    return false;
  }
  return enf.VidaPersonaje1_2 === 0 || enf.VidaPersonaje2_2 === 0;
}

// Registrar ganador del round 3 en la colección de peleas (MongoDB)
export async function registrarGanadorRound3(jugador) {
  // Asume que peleasService tiene un método para registrar el round
  await peleasService.registrarRound({ round: 3, ganador: jugador });
}
