
import peleaRepository from '../repositories/peleaRepository.js';

async function registrarRound({ id, round1, round2, round3, GanadorRound1 }) {
  await peleaRepository.upsertPelea({ id, round1, round2, round3, GanadorRound1 });
}

export default {
  registrarRound
};
