
import mongoose from 'mongoose';


const equipoSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  Heroe_O_Villano1: String,
  AliasPersonaje1: String,
  Heroe_O_Villano2: String,
  AliasPersonaje2: String,
  Heroe_O_Villano3: String,
  AliasPersonaje3: String
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model('Equipo', equipoSchema);
