import Pelea from '../models/peleaModel.js';

async function getAllPeleas() {
  return await Pelea.find().lean();
}

async function deleteAllPeleas() {
  await Pelea.deleteMany({});
}

export default {
  getAllPeleas,
  deleteAllPeleas
};
