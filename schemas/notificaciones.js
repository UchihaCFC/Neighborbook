var mongoose = require('mongoose');
var schema= mongoose.Schema;
var notificaciones = new schema({
	usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios'},
	sala: { type: mongoose.Schema.Types.ObjectId, ref: 'salas'},
	nombreSala: String,
	url: String,
	accion: String,
	texto: String,
	fecha: {
        type: Date,
        default: Date.now
    },
    span: String,
    vistopor:[{ type: mongoose.Schema.Types.ObjectId, ref: 'usuarios'}]
});
module.exports=mongoose.model( 'notificaciones', notificaciones);