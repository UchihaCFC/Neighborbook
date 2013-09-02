var mongoose = require('mongoose');
var schema= mongoose.Schema;
var librosPropuestos = new schema({
	libro: { type: mongoose.Schema.Types.ObjectId, ref: 'libros'},
	sala: { type: mongoose.Schema.Types.ObjectId, ref: 'salas'},
	votos: {type: Number, default: 0},
	usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios'}
});
module.exports=mongoose.model( 'librosPropuestos', librosPropuestos);