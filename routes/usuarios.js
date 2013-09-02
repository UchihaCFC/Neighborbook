module.exports = function(app, rutas, usuarios, libros, salas, crypto, nodemailer, notificaciones) {
	//login
	app.post(rutas.usuario.login, function (req, res) {
		usuario=req.body.usuariologin;
		pass=req.body.passlogin;
		hmac1 = crypto.createHmac("md5", 'auth secret');
		hmac1.update(pass);
		pass = hmac1.digest("hex");
		condicion={"usuario":usuario, "pass": pass};
		usuarios.count(condicion, function (err, num){
			if(err) throw err;
			if(num==0)
			{
				res.render('errorLogin',{title:"Usuario o Password erróneas"});
			}else{
				req.session.usuario=usuario;
				usuarios.findOne(condicion,{"conectado":1}, function (err, usuarioActual){
					usuarioActual["conectado"]=1;
					usuarioActual.save(function (err){
						if(err) throw err;
						if(req.body.recordar)
						{
							res.cookie('usuario', usuario, { expires: new Date(Date.now() + 604800000), httpOnly: true });
						}else{
							//si existe la cookie y esta desmarcada no cerrar sesión
							if(req.cookies.usuario)
							{
								res.clearCookie('usuario');
							}
						}
						res.redirect('/');
					});
				});
				
			}
		});

	});

	//registrarse
	app.post(rutas.usuario.registrarse, function (req, res) {
		usuario=req.body.usuarioregistrar;
		pass=req.body.passregistrar;
		email=req.body.emailregistrar;
		libros.find().distinct('categoria', function (err, registros){
			if(err) throw err;
			usuarios.count({"usuario":usuario}, function (err, num){
				if(err) throw err;
				errorUsuario=0;
				errorEmail=0;
				if(num>0)
				{
					errorUsuario=1;
				}
				usuarios.count({"email":email}, function (err, num){
					if(err) throw err;
					if(num>0)
					{
						errorEmail=1;
					}
					res.render('registrarse', {title: 'Neighborbook - Finalizar registro', usuario: usuario, pass : pass, email: email, categorias: registros, errorEmail: errorEmail, errorUsuario: errorUsuario});
				});
			});
		});
		
	});

	//finalizar registro
	app.post(rutas.usuario.finalizarRegistro, function (req, res) {
		usuario=req.body.usuario;
		pass=req.body.pass;
		email=req.body.email;
		libro=req.body.libro;
	    hmac1 = crypto.createHmac("md5", 'auth secret');
		hmac1.update(pass);
		pass = hmac1.digest("hex");
		gustos=req.body.gustos;
		hmac2 = crypto.createHmac("md5", 'auth secret');
		hmac2.update(pass);
		enlace = hmac2.digest("hex");
		//envio del mail
		var smtpTransport = nodemailer.createTransport("SMTP",{
		    service: "Gmail",
		    auth: {
		        user: "xxxxxx@gmail.com",
		        pass: "xxxxxxxxx"
		    }
		});
		mensaje="<h1>Bienvenid@  Neighborbook</h1> <h2>Bienvenid@ a la otra forma de leer</h2>. <p>Pincha en el siguiente enlace y empieza a disfrutar de esta plataforma.</p><p><a href='http://localhost:3000/activar-usuario/"+enlace+"' title='Activar cuenta'>Activar Cuenta</a></p><p style='text-align:center'><img src='http://www.seaquake-club.es/img/neighborbook-registro.png' alt='Neighborbook, la otra forma de leer'/></p>";
		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: "Nodejsnpm <nodejsnpm@gmail.com>", // sender address
		    to: req.body.email, // list of receivers
		    subject: "Bienvenido a Neighborbook", // Subject line
		    generateTextFromHTML: true,
		    html: mensaje
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){
		    if(error){
		        res.render('error',{title: "Error al enviar el Mail"});
		    }else{
		    	nuevoUsuario=new usuarios;
				nuevoUsuario.usuario=usuario;
				nuevoUsuario.pass=pass;
				nuevoUsuario.email=email;
				nuevoUsuario.activado=0;
				nuevoUsuario.gustos=gustos;
				nuevoUsuario.enlace=enlace;
				nuevoUsuario.imagen="default.jpg";
				nuevoUsuario.conectado=0;
				//sacar el libro que hemos metido
				condicion={"titulo":libro}
				libros.find(condicion, function (err, registro){
					if(err) throw err;
					nuevoUsuario.leyendo=registro;
					nuevoUsuario.save();
		        	res.redirect(rutas.usuario.registroEnviado);
				});
		    }
				
		});
	});

	//si el usuario se ha registrado, pantalla de que se le ha enviado un mail
	app.get(rutas.usuario.registroEnviado, function (req, res){
		res.render('registroEnviado', {title: 'Registro - Paso final'});
	});

	//activar usuario
	app.get(rutas.usuario.activarUsuario, function (req, res){
		enlace=req.params.enlace;
		//si se encuentra ese enlace se cambia el valor de activado a 1, si no se carga una página de error
		usuarios.count({"enlace":enlace}, function (err, num){
			if(err) throw err;
			if(num==0)
			{
				res.render('error', {title: 'Página no encontrada'});
			}else{
				usuarios.update({"enlace":enlace}, {"activado": 1, "enlace": "activado"}, function (err, num){
					res.render('usuarioActivado', {title: 'Bienvenid@ a Neighborbook'});
				});
			}
		});

	});

	//recuperar contraseña
	app.get(rutas.usuario.recuperar, function (req, res) {
		res.render('recuperarContrasena', { title: 'Recuperar Contraseña' });
	});

	//enviar mail apra restablecer contrasena
	app.post(rutas.usuario.recuperar, function (req, res) {
		email=req.body.email;
		condicion={"email":email};
		usuarios.count(condicion, function (err, num){
			if(err) throw err;
			//si es igual a 0 no existe ningun usuario con ese email
			if(num==0)
			{
				res.render('error', {title: 'Acción inválida: El email no esta asociado a ningún usuario'});
			}else if(num==1){//si es igual a uno, md5 al correo y usuario concatenados y actualizo el enlace del usuario 
				usuarios.findOne(condicion,{'_id':0, 'email':1, 'usuario':1}, function (err, registro){
					enlace=registro["email"]+registro["usuario"];
					hmac1 = crypto.createHmac("md5", 'auth secret');
					hmac1.update(enlace);
					enlace = hmac1.digest("hex");
					usuarios.update(condicion,{"enlace":enlace}, function (err, sum){
						if(err) throw err;
						if(sum==1)//si es uno se procede a enviar el email con el enlace para restablecer la contraseña
						{
							//envio del mail
							var smtpTransport = nodemailer.createTransport("SMTP",{
							    service: "Gmail",
							    auth: {
							        user: "xxxxxxxx@gmail.com",
							        pass: "xxxxxxxx"
							    }
							});
							mensaje="<h1>Recuperar Contraseña</h1> <h2>Leer mejora la memoria</h2> <p>Pincha en el siguiente enlace para restablecer contraseña.</p><p><a href='http://localhost:3000/restablecer-contrasena/"+enlace+"' title='Restablecer Contraseña'>Restablecer Contraseña</a></p><p style='text-align:center'><img src='http://www.seaquake-club.es/img/neighborbook-recuperar.png' alt='Neighborbook, la otra forma de leer'/></p>";
							// setup e-mail data with unicode symbols
							var mailOptions = {
							    from: "Nodejsnpm <nodejsnpm@gmail.com>", // sender address
							    to: req.body.email, // list of receivers
							    subject: "Restablecer Contraseña", // Subject line
							    generateTextFromHTML: true,
							    html: mensaje
							}

							// send mail with defined transport object
							smtpTransport.sendMail(mailOptions, function(error, response){
							    if(error){
							        res.render('error',{title: "Error al enviar el Mail"});
							    }else{
							        res.redirect(rutas.usuario.registroEnviado);
							    }
									
							});
							//pantalla donde muestra que el enlace para restablecer la contraseña ha sido enviada
							res.render('contrasenaEnviada', {title:'Restablecer contraseña'});
						}else{
							res.render('error', {title: 'Acción inválida: Pruebe a realizar más tarde'});
						}
					});
				});
				
			}
		})
	});

	//paso final para restablecer la contraseña
	app.get(rutas.usuario.restablecerContrasena, function (req, res){
		enlace=req.params.enlace;
		condicion={"enlace": enlace};
		//si es uno es correcto y se carga la plantilla con el formulario para enviar la nueva password
		usuarios.count(condicion, function (err, num){
			if(num==1)
			{
				//saco el email del usuario para mostrarlo en un campo input hidden
				usuarios.findOne(condicion, {'_id':0, 'email':1}, function (err, registro){
					email=registro["email"];
					res.render('nuevaContrasena', {title: 'Restablecer Contraseña', email: email});
				});
			}else{
				res.render('error', {title: 'Acción inválida'});
			}
		});
	});

	//finalizar restablecer contraseña
	app.post(rutas.usuario.finalizarRestablecerContrasena, function (req, res){
		email=req.body.email;
		pass=req.body.pass;
		hmac1 = crypto.createHmac("md5", 'auth secret');
		hmac1.update(pass);
		pass = hmac1.digest("hex");
		condicion={"email":email};
		usuarios.update(condicion, {"enlace":"activado", "pass": pass}, function (err, num){
			if(err) throw err;
			res.render('contrasenaRestablecida', {title: "Contraseña Restablecida"});
		});
	});

	//inicio
	app.get(rutas.usuario.inicio, function (req, res) {
		if(req.session.usuario)
		{
			//Salas Virtuales
			usuario=req.session.usuario;
			condicion={"usuario":usuario};
			usuarios.find().populate('leyendo leidos leer').find(condicion, function (err, registros){
				if(err) throw err;
				salasvirtuales=registros[0]["salas"];
				gustos=registros[0]["gustos"];
				usuario=registros[0];
				if(salasvirtuales.length==0)//si no hay salas virtuales
				{
					salasvirtuales=0;
					//sacar salas virtuales relacionadas con sus gustos
					condicion={'categorias': {$in: gustos}};
					//sacar 2 salas virtuales que puedan interesar al usuario aleatoriamente entre sus gustos
					salas.count(condicion, function (err, num){
						aleatorio=Math.floor((Math.random()*num)+1)-1;
						salas.find().skip(aleatorio).limit(1).populate('libroActual').find(condicion, function (err, relacionadas){
							if(err) throw err;
							if(relacionadas.length==0) relacionadas=0; // si no hya relacionadas
							//sacar libros recomendados
							condicion={'categoria': {$in: gustos}};
							libros.count(condicion, function (err, num){
								if(err) throw err;
								aleatorio=Math.floor((Math.random()*num)+1)-1;
								libros.find().skip(aleatorio).limit(4).find(function (err, librosrelacionados){
									res.render('usuario/index', { title: 'Inicio', salas: salasvirtuales, relacionadas: relacionadas, usuario:usuario, notificaciones:0, id_salas: 0, recomendados: librosrelacionados});
								});
							});
						});
					});	
				}else{
					//sacar salas virtuales relacionadas con sus gustos
					condicion={'categorias': {$in: gustos}};
					salas.count(condicion, function (err, num){
						aleatorio=Math.floor((Math.random()*num)+1)-1;
						salas.find().skip(aleatorio).limit(1).populate('libroActual').find(condicion, function (err, relacionadas){
							if(err) throw err;
							if(relacionadas.length==0) relacionadas=0; // si no hya relacionadas
							condicion={'nombre': {$in: salasvirtuales}};
							//saco los ids de las diferentes salas para sacar sus notificaciones
							salas.find(condicion, {"_id":1},function (err, registros){
								if(err) throw err;
								id_salas=[]
								for(i=0; i<registros.length;i++)
								{
									id_salas.push(registros[i]["_id"]);
								};
								//saco las notificaciones de las salas
								condicion={'sala': {$in: id_salas}};
								notificaciones.find().populate('usuario').sort('-fecha').skip(0).limit(4).find(condicion, function (err, notificaciones){
									if(err) throw err;
									//sacar libros recomendados
									condicion={'categoria': {$in: gustos}};
									libros.count(condicion, function (err, num){
										if(err) throw err;
										aleatorio=Math.floor((Math.random()*num)+1)-1;
										libros.find().skip(aleatorio).limit(4).find(function (err, librosrelacionados){
											res.render('usuario/index', { title: 'Inicio', salas: salasvirtuales, relacionadas: relacionadas, usuario:usuario, notificaciones:notificaciones, id_salas: id_salas, recomendados: librosrelacionados});
										});
									});
								});
							});
						});
					});
				}
				
			});
			
		}else{
			res.redirect('/');
		}
		
	});
	//perfil
	app.get(rutas.usuario.perfil, function (req, res){
		if(req.session.usuario)
		{
			libros.find().distinct('categoria', function (err, registros){
				if(err) throw err;
				usuarios.findOne({"usuario":req.session.usuario}, function (err, usuario){
					if(err) throw err;
					res.render('usuario/perfil', {categorias: registros, usuario:usuario});
				});
			});
		}else{
			res.redirect('/');
		}
	});

	app.get(rutas.usuario.baja, function (req, res){
		if(req.session.usuario)
		{
			res.render('usuario/baja', {title: "Darse de baja"});
		}else{
			res.redirect('/');
		}
	});

	app.get(rutas.usuario.confirmarBaja, function (req, res){
		if(req.session.usuario){
			//eliminar perfil
			condicion={usuario: req.session.usuario};
			usuarios.remove(condicion, function (err, num){
				if(err) throw err;
				delete req.session.usuario;
				if(req.cookies.usuario)
				{
					res.clearCookie('usuario');
				}
				res.redirect('/');
			})
		}else{
			res.redirect('/');
		}
	});

	//salir
	app.get(rutas.usuario.salir, function (req, res) {
		delete req.session.usuario;
		if(req.cookies.usuario)
		{
			res.clearCookie('usuario');
		}
		res.redirect('/');
	});
};