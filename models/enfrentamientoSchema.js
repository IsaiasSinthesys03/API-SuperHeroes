import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';


const AutoIncrement = mongooseSequence(mongoose);

const enfrentamientoSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  equipoHeroe: String, // nombre o id del equipo de héroes
  equipoVillano: String, // nombre o id del equipo de villanos
  resultado: String, // 'heroe', 'villano' o 'empate'
  fecha: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
});

enfrentamientoSchema.plugin(AutoIncrement, { inc_field: 'id', start_seq: 1, id: 'enfrentamiento_id_counter' });

export default mongoose.model('Enfrentamiento', enfrentamientoSchema);
