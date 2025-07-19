import mongoose from 'mongoose';

const peleaSchema = new mongoose.Schema({}, { strict: false, collection: 'peleas' });
const Pelea = mongoose.models.Pelea || mongoose.model('Pelea', peleaSchema);

async function getAllPeleas() {
  return await Pelea.find({}).lean();
}

async function deleteAllPeleas() {
  await Pelea.deleteMany({});
}

export default {
  getAllPeleas,
  deleteAllPeleas
};
