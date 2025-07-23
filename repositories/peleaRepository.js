import Pelea from '../models/peleaModel.js';

export default {
  async deletePeleaByIdAndUsername(id, username) {
    return await Pelea.deleteMany({ id, username });
  },
  async getPeleaByIdAndUsername(id, username) {
    return await Pelea.findOne({ id, username });
  },
  async getPeleaById(id) {
    return await Pelea.findOne({ id });
  },
  async upsertPelea({ id, Round1, Round2, Round3, Ganador, username }) {
    return await Pelea.findOneAndUpdate(
      { id, username },
      { $set: { Round1, Round2, Round3, Ganador, username } },
      { upsert: true, new: true }
    );
  },
  async getAll() {
    return await Pelea.find();
  }
};
