import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';


const AutoIncrement = mongooseSequence(mongoose);

const heroSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  alias: String,
  city: String,
  team: String,
  golpeBasico1: { type: Number, min: 0, max: 15 },
  golpeBasico2: { type: Number, min: 0, max: 15 },
  golpeBasico3: { type: Number, min: 0, max: 15 },
  danoCrit: Number,
  probCrit: Number,
  nombreHabilidad: String,
  danoHabilidad: Number,
  poder: Number,
  defensa: Number,
  vida: { type: Number, default: 100 },
  username: { type: String, required: true } // Multiusuario
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
});


export default mongoose.model('Hero', heroSchema);
