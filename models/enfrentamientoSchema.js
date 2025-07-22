import mongoose from 'mongoose';


const enfrentamientoSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  ID_Equipo1: Number,
  AliasPersonaje1_1: String,
  VidaPersonaje1_1: Number,
  AliasPersonaje1_2: String,
  VidaPersonaje1_2: Number,
  AliasPersonaje1_3: String,
  VidaPersonaje1_3: Number,
  ID_Equipo2: Number,
  AliasPersonaje2_1: String,
  VidaPersonaje2_1: Number,
  AliasPersonaje2_2: String,
  VidaPersonaje2_2: Number,
  AliasPersonaje2_3: String,
  VidaPersonaje2_3: Number,
  username: { type: String, required: true } // Multiusuario
  // Puedes agregar más campos si lo necesitas
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});



export default mongoose.model('Enfrentamiento', enfrentamientoSchema);
