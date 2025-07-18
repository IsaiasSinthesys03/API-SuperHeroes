import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';


const AutoIncrement = mongooseSequence(mongoose);

const heroSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  alias: String,
  city: String,
  team: String,
  golpeBasico1: String,
  golpeBasico2: String,
  golpeBasico3: String,
  danoCrit: Number,
  probCrit: Number,
  nombreHabilidad: String,
  danoHabilidad: Number,
  poder: Number,
  defensa: Number,
  vida: { type: Number, default: 100 }
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
});


export default mongoose.model('Hero', heroSchema);
