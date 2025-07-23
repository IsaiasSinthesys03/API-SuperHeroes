// utils/ganadorPelea.js

/**
 * Calcula el ganador general de una pelea según los resultados de los rounds.
 * @param {string|null} round1 - Ganador del round 1 ('Jugador 1' o 'Jugador 2' o null)
 * @param {string|null} round2 - Ganador del round 2 ('Jugador 1' o 'Jugador 2' o null)
 * @param {string|null} round3 - Ganador del round 3 ('Jugador 1' o 'Jugador 2' o null)
 * @returns {string|null} - 'Jugador 1', 'Jugador 2' o null si no hay suficiente información
 */
export function calcularGanador(round1, round2, round3) {
  let j1 = [round1, round2, round3].filter(r => r === 'Jugador 1').length;
  let j2 = [round1, round2, round3].filter(r => r === 'Jugador 2').length;
  if (j1 > j2) return 'Jugador 1';
  if (j2 > j1) return 'Jugador 2';
  return null;
}
