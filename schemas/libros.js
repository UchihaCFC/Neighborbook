var mongoose = require('mongoose');
var schema= mongoose.Schema;
var libros = new schema({
	titulo: String,
	autor: String,
	descripcion: String,
	fecha_publicacion: Date,
	urlamazon: String,
	categoria: String,
	votos: {type: Number, default: 0},
	media: Number,
	imagen: String,
	comentarios:[]
});
module.exports=mongoose.model( 'libros', libros);