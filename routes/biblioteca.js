module.exports = function(app, rutas, usuarios, libros, salas) {
	app.get(rutas.biblioteca.biblioteca, function (req, res){
		if(req.session.usuario)
		{
			usuario=req.session.usuario;
			//sacar libros leyendo leidos y leer
			condicion={"usuario": usuario};
			usuarios.find().populate('leyendo leidos leer').find(condicion, function (err, usuario){
				if(err) throw err;
				res.render('biblioteca/biblioteca', {usuario: usuario[0]});
			});
		}else{
			res.redirect('/');
		}
	});
}