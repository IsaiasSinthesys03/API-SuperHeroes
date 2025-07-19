import mongoose from 'mongoose';


const AccionRound3Schema = new mongoose.Schema({
    ID_Equipo3: { type: Number, required: true },
    AccionRound3: { type: String, required: true },
    DañoRealizadoRound3: { type: Number, required: true },
    VidaRestadaEnemigoRound3: { type: Number, required: true },
    jugador: { type: Number, required: true }
});

export default mongoose.model('AccionRound3', AccionRound3Schema);
