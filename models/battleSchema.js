import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';


const AutoIncrement = mongooseSequence(mongoose);

const battleSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  heroAlias: String,
  villainAlias: String,
  username: { type: String, required: true } // Multiusuario
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
});

battleSchema.plugin(AutoIncrement, { inc_field: 'id', start_seq: 1, id: 'battle_id_counter' });

export default mongoose.model('Battle', battleSchema);
