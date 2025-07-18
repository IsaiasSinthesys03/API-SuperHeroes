import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function resetHeroIdCounter() {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('counters').updateOne(
    { _id: 'hero_id_counter' },
    { $set: { seq: 0 } }
  );
  console.log('Contador de id de héroes reiniciado a 0.');
  await mongoose.disconnect();
}

resetHeroIdCounter();
