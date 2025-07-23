

import peleaRepository from '../repositories/peleaRepository.js';

async function registrarRound({ id, Round1, Round2, Round3, Ganador, username }) {
  await peleaRepository.upsertPelea({ id, Round1, Round2, Round3, Ganador, username });
}

async function getPeleaByIdAndUsername(id, username) {
  return await peleaRepository.getPeleaByIdAndUsername(id, username);
}

export default {
  registrarRound,
  getPeleaByIdAndUsername
};
