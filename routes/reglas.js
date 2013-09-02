module.exports = function(app, rutas, usuarios, libros, salas, crypto, nodemailer, notificaciones) {
	//reglas
	app.get(rutas.reglas.reglas, function (req, res) {
		if(req.session.usuario)
		{
			condicion={"usuario":req.session.usuario};
			usuarios.findOne(condicion, function (err, registro){
				if(err) throw err;
				res.render('reglas/reglas', { title: 'Reglas', usuario:usuario});	
			});
		}else{
			res.redirect('/');
		}
	});
}