import Pelea from '../models/peleaModel.js';

export default {
  async getPeleaById(id) {
    return await Pelea.findOne({ id });
  },
  async upsertPelea({ id, round1, round2, round3, GanadorRound1 }) {
    return await Pelea.findOneAndUpdate(
      { id },
      { $set: { round1, round2, round3, GanadorRound1 } },
      { upsert: true, new: true }
    );
  },
  async getAll() {
    return await Pelea.find();
  }
};
