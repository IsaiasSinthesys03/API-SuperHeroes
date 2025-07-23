import mongoose from 'mongoose';

const peleaSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  Round1: { type: String, enum: ['Jugador 1', 'Jugador 2', null], default: null },
  Round2: { type: String, enum: ['Jugador 1', 'Jugador 2', null], default: null },
  Round3: { type: String, enum: ['Jugador 1', 'Jugador 2', null], default: null },
  Ganador: { type: String, enum: ['Jugador 1', 'Jugador 2', 'Empate', null], default: null },
  username: { type: String, required: true }
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índice compuesto para multiusuario
peleaSchema.index({ id: 1, username: 1 }, { unique: true });

export default mongoose.model('Pelea', peleaSchema);
