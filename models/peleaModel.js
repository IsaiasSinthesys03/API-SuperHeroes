import mongoose from 'mongoose';

const peleaSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  round1: String,
  round2: String,
  round3: String,
  GanadorRound1: String,
  username: { type: String, required: true } // Multiusuario
});

export default mongoose.model('Pelea', peleaSchema);
