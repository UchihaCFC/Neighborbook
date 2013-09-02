var mongoose = require('mongoose');
var schema= mongoose.Schema;
var admin = new schema({
	usuario: String,
	pass: String
});
module.exports=mongoose.model( 'admin', admin);