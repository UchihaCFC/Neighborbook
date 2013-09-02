
/*
 * GET home page.
 */
module.exports = function(app, rutas) {
	app.get('/', function (req, res) {
		if(req.session.usuario || req.cookies.usuario)
		{
			res.redirect(rutas.usuario.inicio);
		}else{
			res.render('index', { title: 'Neighborbook, la otra forma de leer' });
		}
	});
};
