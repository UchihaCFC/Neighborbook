var mongoose = require('mongoose');
var schema= mongoose.Schema;
var usuarios = new schema({
	usuario: String,
	pass: String,
	email: String,
	activado: Number,//0 no ha activado su cuenta y 1 si ya la tiene activada
	enlace: String,//enlace que enviamos para activar su cuenta
	localizacion: String,
	sexo: String,
	gustos:[],
	salas:[],
	imagen: String,
	conectado: Number,
	leyendo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'libros'}],//el libro que se esta leyendo actualmente
	leidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'libros'}],//libros que se han leido
	leer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'libros'}],//libros para leer
});
module.exports=mongoose.model( 'usuarios', usuarios);