var mongoose = require('mongoose');
var schema= mongoose.Schema;
var comentarios = new schema({
	usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios'},
	sala: { type: mongoose.Schema.Types.ObjectId, ref: 'salas'},
	texto: String,
	comentario: Number,
	pregunta: Number,
	cita: Number,
	respuestas: [],
	fecha: {
        type: Date,
        default: Date.now
    }
});
module.exports=mongoose.model( 'comentarios', comentarios);