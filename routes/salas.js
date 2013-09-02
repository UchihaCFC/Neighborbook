module.exports = function(app, rutas, usuarios, libros, salas, crypto, nodemailer,comentarios, notificaciones, librosPropuestos) {
	//salas virtuales
	app.get(rutas.salas.salasVirtuales, function (req, res){
		if(req.session.usuario)
		{
			usuario=req.session.usuario;
			condicion={"usuario":usuario};
			//sacar las salas del usuario
			usuarios.findOne(condicion, {"salas":1, "_id":1}, function (err, salasUsuario){
				if(err) throw err;
				//sacar el id de las salas
				id_usuario=salasUsuario["_id"];
				condicion={'nombre': {$in: salasUsuario["salas"]}};
				salas.find().populate('libroActual librosLeidos').find(condicion, function (err, registros){
					id_salas=[];
					if(registros.length>0)
					{
						for(i=0; i<registros.length;i++)
						{
							id_salas.push(registros[i]["_id"]);
						}
						//contar notificaciones de cada sala
						condicion={'sala': {$in: id_salas}, 'vistopor': {$nin: [salasUsuario]}};
						notificaciones.find(condicion,'nombreSala', function (err, nots){
							tamano=nots.length;
					        notificacionesUsuario=[];
					        salaActual="";
					        num=0;//notificaciones
					         for(i=0; i<tamano; i++)
					       	 {
					          	if(nots[i]["nombreSala"]==salaActual || salaActual=="")
					          	{
					          		salaActual=nots[i]["nombreSala"];
					          		num++;
					          		ultimaSala=nots[i]["nombreSala"];
					          	}else{
					          		notificacionesUsuario.push({"sala": salaActual, "num": num});
					          		salaActual=nots[i]["nombreSala"];
					          		num=1;
					          	}
					         }

					         notificacionesUsuario.push({"sala": salaActual, "num": num});//añadir ultima sala
							res.render('salas/salasvirtuales', {salas: registros, usuario:usuario, notificaciones: notificacionesUsuario});
						});			
					}else{
						res.render('salas/salasvirtuales', {salas: registros, usuario:usuario, notificaciones: 0});
					}
				});
			});
			
		}else{
			res.redirect('/');
		}
	});

	//visitar sala
	app.get(rutas.salas.visitarSala, function (req, res){
		if(req.session.usuario)
		{
			sala=req.params.sala;
			condicion={url: sala};
			salas.find().populate('libroActual librosLeidos').find(condicion, function (err, registro){
			// salas.findOne(condicion, function (err, registro){
				//saber si el usuario que entra a la sala pertenece a la sala
				usuarioActual=req.session.usuario;
				id_sala=registro[0]["_id"];
				condicion={'usuario': usuarioActual, 'salas': {$in: [registro[0]["nombre"]]}};
				usuarios.count(condicion, function (err, num){
					if(err) throw err;
					//envido num como variable activo, si es 1 es que el usuario esta unido a la sala
					condicion={'usuario':usuarioActual};
					usuarios.findOne(condicion,{'usuario':1, '_id':1}, function (err, registroUsuario){
						//enviamos tb los comentarios relacionados a esta sala
						condicion={'sala':id_sala};
						usuarioActualId=registroUsuario["_id"];
						comentarios.find().populate('usuario').sort('-fecha').skip(0).limit(3).find(condicion, function (err, comentariosSala){
							if(err) throw err;
							usuario=registroUsuario;
							if(comentariosSala.length==0)
							{
								comentariosSala=0;
							}
							condicion={'vistopor': {$nin: [usuarioActualId]}};
							notificaciones.update(condicion, { $push: { vistopor: usuarioActualId }}, { multi: true }, function (err, filasafectadas){
								if(err) throw err;
								//sacar los libros propuestos
								condicion={"sala": id_sala};
								librosPropuestos.find().populate('libro').find(condicion, function (err, librosSala){
									res.render('salas/sala', {sala: registro[0], activo: num, usuario:usuario, comentarios: comentariosSala, librosPropuestos: librosSala});
								});
								
							});
							
						});
						
					});
				});
			});
		}else{
			res.redirect('/');
		}
	});

	//unirse sala
	app.get(rutas.salas.unirse, function (req, res){
		if(req.session.usuario)
		{
			sala=req.params.sala;
			condicion={url: sala};
			salas.findOne(condicion, function (err, registro){
				if(err) throw err;
				usuario=req.session.usuario;
				nombreSala=registro["nombre"];
				//sacar el usuario que quiere unirse a la sala
				condicion={usuario:usuario};
				usuarios.findOne(condicion, function (err, usuarioActual){
					usuarioActual["salas"].push(nombreSala);
					usuarioActual.save(function (err){
						if(err) throw err;
						res.redirect('/salas-virtuales/'+sala);
					});
				});
			});
		}else{
			res.redirect('/');
		}
	});

	//abandonar sala
	app.get(rutas.salas.abandonar, function (req, res){
		if(req.session.usuario)
		{
			sala=req.params.sala;
			condicion={url: sala};
			salas.findOne(condicion, function (err, registro){
				if(err) throw err;
				usuario=req.session.usuario;
				nombreSala=registro["nombre"];
				//sacar el usuario que quiere abandonar a la sala
				condicion={usuario:usuario};
				usuarios.findOne(condicion, function (err, usuarioActual){
					usuarioActual["salas"].remove(nombreSala);
					usuarioActual.save(function (err){
						if(err) throw err;
						res.redirect('/salas-virtuales/'+sala);
					});
				});
			});
		}else{
			res.redirect('/');
		}
	});


}