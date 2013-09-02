module.exports = function(app, rutas, admin, usuarios, libros, salas, librosPropuestos, notificaciones) {
	//home administrador
	app.get(rutas.admin.administrador, function (req, res) {
		//
		if(req.session.admin)
		{
			res.redirect(rutas.admin.panel);
		}else{
			res.render('admin/administrador', {title: "Administrador"});
		}
		
	});

	//login administrador
	app.post(rutas.admin.login, function (req, res){
		condicion={"usuario": req.body.usuario, "pass": req.body.pass};
		admin.findOne(condicion).exec(function (err, usuario) { 
			if(err) throw err;
			req.session.admin=req.body.usuario;
			res.redirect('administrador/panel');
	  });
	});

	//entrar al panel
	app.get(rutas.admin.panel, function (req, res){
		if(req.session.admin)
		{
			res.render('admin/panel', {title: "Panel de Administración"});
		}else{
			res.redirect('/administrador');
		}
	});

	//listado de salas
	app.get(rutas.admin.salas.listado, function (req, res){
		if(req.session.admin)
		{
			salasvirtuales=0;//lo inicializo para que exista la variable en caso de que no encuentre nada en la base de datos
			salas.find(function (err, salasvirtuales){
				if(err) throw err;
				categorias=0;//lo inicializo para que exista la variable en caso de que no encuentre nada en la base de datos
				if(typeof(salasvirtuales["libroActual"])=="undefined"){
					salasvirtuales["libroActual"]=0;
				}
				libros.find().distinct('categoria', function (err, categorias){
					//sacar libros propuestos de cada sala
					res.render('admin/salas', {title: "Salas Virtuales", salas: salasvirtuales, categorias: categorias});	
				});
			});	
		}else{
			res.redirect('/administrador');
		}
	});



	//nueva sala
	app.post(rutas.admin.salas.nueva, function (req, res){
		if(req.session.admin)
		{
			nombre=req.body.nombre;
			salaCategorias=req.body.categorias;
			nuevaSala=new salas;
			nuevaSala.nombre=nombre;
			nuevaSala.categorias=salaCategorias;
			//crear url
			url = nombre;
			url = url.replace(/[\s]/gi, '-');
			url = url.toLowerCase();
		    url = url.replace(/[àáâãäå]/g,"a");
		    url = url.replace(/[æ]/g,"ae");
		    url = url.replace(/[ç]/g,"c");
		    url = url.replace(/[èéêë]/g,"e");
		    url = url.replace(/[ìíîï]/g,"i");
		    url = url.replace(/[ñ]/g,"n");                
		    url = url.replace(/[òóôõö]/g,"o");
		    url = url.replace(/[œ]/g,"oe");
		    url = url.replace(/[ùúûü]/g,"u");
		    url = url.replace(/[ýÿ]/g,"y");
		    url = url.replace(/[ñ]/g,"n");
		    url = url.replace(/[=();:.{},"\[\]\/]/g,"");  
			nuevaSala.url=url;
			nuevaSala.save();
			res.redirect(rutas.admin.salas.listado);
		}else{
			res.redirect('/administrador');
		}
	});

	//sala
	app.get(rutas.admin.salas.sala, function (req, res){
		if(req.session.admin)
		{
			url=req.params.sala;
			//sacar id de la sala para sacar los libros y votos correspondientes
			condicion={"url":url};
			salas.findOne(condicion, function (err, registro){
				if(err) throw err;
				id_sala=registro["_id"];
				sala=registro["nombre"];
				//condicion para sacar los libros propuestos
				condicion={"sala": id_sala};
				librosPropuestos.find().populate("libro").find(condicion, function (err, registros){
					res.render('admin/sala', {title: sala, libros: registros});	
				});
			});
		}else{
			res.redirect('/administrador');
		}
	});

	//establecer libro
	app.post(rutas.admin.salas.establecerLibro, function (req, res){
		if(req.session.admin)
		{
			sala=req.body.sala;
			id_libro=req.body.id_libro;
			//sacar la sala para meter el nuevo libro
			condicion={"nombre":sala};
			salas.findOne(condicion, function (err, registro){
				libroActual=registro["libroActual"];
				id_sala=registro["_id"];
				url=registro["url"];
				if(libroActual.length==0)
				{
					registro["libroActual"].push(id_libro);
				}else{
					//el libro actual pasa a un libro ya leido
					libroLeido=registro["libroActual"][0];
					registro["libroActual"]=[];
					registro["libroActual"].push(id_libro);
					registro["librosLeidos"].push(libroLeido);
				}
				registro.save(function (err){
					if(err) throw err;
					//borrar todos los libros propuestos de la sala ciencia ficción
					condicion={"sala": id_sala};
					librosPropuestos.remove(condicion, function (err, num){
						if(err) throw err;
						//agregar notificacion
						nuevaNotificacion= new notificaciones;
		                nuevaNotificacion.sala=id_sala;
		                nuevaNotificacion.nombreSala=sala;
		                nuevaNotificacion.url="/salas-virtuales/"+url;
		                nuevaNotificacion.accion="Ha establecido un nuevo libro";
		                //sacar el nombre del libro
		                condicion={"_id": id_libro};
		                libros.findOne(condicion, {"titulo":1}, function (err, registro){
		                	nuevaNotificacion.texto=registro["titulo"].substring(0,20)+"...";
			                nuevaNotificacion.save(function (err){
			                if(err) throw err;
				                res.redirect('/administrador/salas-virtuales/'+url);
			                });
		                })
		                
						
					});
				});
			});
		}else{
			res.redirect('/administrador');
		}
	});
	
};