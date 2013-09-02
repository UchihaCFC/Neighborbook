var mongoose = require('mongoose');
var schema= mongoose.Schema;
var salas = new schema({
	nombre: String,
	libroActual: [{ type: mongoose.Schema.Types.ObjectId, ref: 'libros'}],
	librosLeidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'libros'}],//se almacenan los libros que se vayan leyendo
	url: String,
	categorias: []//las categorias que tiene esta sala
});
module.exports=mongoose.model( 'salas', salas);