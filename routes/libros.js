module.exports = function(app, rutas, usuarios, libros, salas) {
	//busqueda de libros
	app.post(rutas.libros.busqueda, function (req, res){
		if(req.session.usuario)
		{
			usuario=req.session.usuario;
			buscar=req.body.buscar;
			categoria=req.body.categoria;
			switch (categoria){
				case "libro":
					condicion={"titulo": new RegExp(buscar, "i")};
					libros.count(condicion, function (err, num){
						libros.find().sort("titulo").skip(0).limit(9).find(condicion, function (err, registros){
							if(err) throw err;
							condicion={"usuario":usuario};
							usuarios.find().sort('titulo').populate('leer leyendo leidos').find(condicion, function (err, registro){
								res.render('busqueda/resultadoslibro', {resultados: registros, busqueda: buscar, title: "Buscar "+buscar, usuario: registro[0], campo: "titulo",totalresultados:num});
							});
							
						});
					});
					
					break;
				case "autor":
					condicion={"autor": new RegExp(buscar, "i")};
					libros.count(condicion, function (err, num){
						libros.find().sort("autor").skip(0).limit(9).find(condicion, function (err, registros){
							if(err) throw err;
							condicion={"usuario":usuario};
							usuarios.find().sort('autor').populate('leer leyendo leidos').find(condicion, function (err, registro){
								res.render('busqueda/resultadoslibro', {resultados: registros, busqueda: buscar, title: "Buscar "+buscar, usuario: registro[0], campo: "autor", totalresultados:num});
							});
						});
					});
					break;
				case "tematica":
					condicion={"categoria": new RegExp(buscar, "i")};
					libros.count(condicion, function (err, num){
						libros.find().sort("autor").skip(0).limit(9).find(condicion, function (err, registros){
							if(err) throw err;
							condicion={"usuario":usuario};
							usuarios.find().sort('autor').populate('leer leyendo leidos').find(condicion, function (err, registro){
								res.render('busqueda/resultadoslibro', {resultados: registros, busqueda: buscar, title: "Buscar "+buscar, usuario: registro[0], campo: "categoria", totalresultados:num});
							});
						});
					});
					break;
				case "salavirtual":
					condicion={"nombre": new RegExp(buscar, "i")};
					salas.count(condicion, function (err, num){
						salas.find().sort("nombre").skip(0).limit(8).populate('libroActual librosLeidos').find(condicion, function (err, registros){
							if(err) throw err;
							res.render('busqueda/resultadossalas', {resultados: registros, busqueda: buscar, title: "Buscar "+buscar, totalresultados:num})
						});
					});
					break;
				default:
					res.render("error", {title: "Acción inválida"});
			}
		}else{
			res.redirect('/');
		}
	});

	//ficha libro
	app.get(rutas.libros.libro, function (req, res){
		if(req.session.usuario)
		{
			id_libro=req.params.id;
			usuario=req.session.usuario;
			//ver si el libro lo tenemos añadido como leer leyendo o leido
			//leyendo
			condicion={'usuario':usuario, 'leyendo': {$in: [id_libro]}};
			usuarios.count(condicion, function (err, num){
				if(err) throw err;
				if(num==1){
					estado='leyendo';
					//sacar libro
					condicion={"_id": id_libro};
					libros.findOne(condicion, function (err, registro){
						if(err) throw err;
						//sacar usuario
						condicion={"usuario":usuario};
						usuarios.findOne(condicion, function (err, usuario){
							if(err) throw err;
							//sacar un usuario aleatorio para saber que libros se ha leido y ponerlo en recomendado
							condicion={'leidos': {$in: [id_libro]}};
							usuarios.count(condicion, function (err, num){
								if(err) throw err;
								aleatorio=Math.floor((Math.random()*num)+1)-1;
								usuarios.find().populate('leidos').skip(aleatorio).limit(1).find(function (err, usuarioaleatorio){
									librosrecomendados=usuarioaleatorio[0]["leidos"];
									if(librosrecomendados.length==0)
									{
										condicion={'categoria': {$in: usuarioaleatorio[0]["gustos"]}};
										libros.count(condicion, function (err, num){
											if(err) throw err;
											aleatorio=Math.floor((Math.random()*num)+1)-1;
											libros.find().skip(aleatorio).limit(3).find(function (err, librosrelacionados){
												res.render('libros/libro', {estado: estado, libro:registro, usuario:usuario, recomendados: librosrelacionados});
											});
										});
									}else{
										res.render('libros/libro', {estado: estado, libro:registro, usuario:usuario, recomendados: librosrecomendados});
									}
								});
							});
							
						});
						
					});
				}else{
					//no se ha encontrado en leyendo
					condicion={'usuario':usuario,'leer': {$in: [id_libro]}};
					usuarios.count(condicion, function (err, num){
						if(err) throw err;
						if(num==1){
							estado="leer";
							//sacar libro
							condicion={"_id": id_libro};
							libros.findOne(condicion, function (err, registro){
								if(err) throw err;
								//sacar usuario
								condicion={"usuario":usuario};
								usuarios.findOne(condicion, function (err, usuario){
									if(err) throw err;
									condicion={'leidos': {$in: [id_libro]}};
									usuarios.count(condicion, function (err, num){
										if(err) throw err;
										aleatorio=Math.floor((Math.random()*num)+1)-1;
										usuarios.find().populate('leidos').skip(aleatorio).limit(1).find(function (err, usuarioaleatorio){
											librosrecomendados=usuarioaleatorio[0]["leidos"];
											if(librosrecomendados.length==0)
											{
												condicion={'categoria': {$in: usuarioaleatorio[0]["gustos"]}};
												libros.count(condicion, function (err, num){
													if(err) throw err;
													aleatorio=Math.floor((Math.random()*num)+1)-1;
													libros.find().skip(aleatorio).limit(3).find(function (err, librosrelacionados){
														res.render('libros/libro', {estado: estado, libro:registro, usuario:usuario, recomendados: librosrelacionados});
													});
												});
											}else{
												res.render('libros/libro', {estado: estado, libro:registro, usuario:usuario, recomendados: librosrecomendados});
											}
										});
									});
								});
							});
						}else{
							//no se ha encontrado en leer
							condicion={'usuario':usuario,'leidos': {$in: [id_libro]}};
							usuarios.count(condicion, function (err, num){
								if(err) throw err;
								if(num==1){
									estado="leido";
									//sacar libro
									condicion={"_id": id_libro};
									libros.findOne(condicion, function (err, registro){
										if(err) throw err;
										//sacar usuario
										condicion={"usuario":usuario};
										usuarios.findOne(condicion, function (err, usuario){
											if(err) throw err;
											condicion={'leidos': {$in: [id_libro]}};
											usuarios.count(condicion, function (err, num){
												if(err) throw err;
												aleatorio=Math.floor((Math.random()*num)+1)-1;
												usuarios.find().populate('leidos').skip(aleatorio).limit(1).find(function (err, usuarioaleatorio){
													librosrecomendados=usuarioaleatorio[0]["leidos"];
													if(librosrecomendados.length==0)
													{
														condicion={'categoria': {$in: usuarioaleatorio[0]["gustos"]}};
														libros.count(condicion, function (err, num){
															if(err) throw err;
															aleatorio=Math.floor((Math.random()*num)+1)-1;
															libros.find().skip(aleatorio).limit(3).find(function (err, librosrelacionados){
																res.render('libros/libro', {estado: estado, libro:registro, usuario:usuario, recomendados: librosrelacionados});
															});
														});
													}else{
														res.render('libros/libro', {estado: estado, libro:registro, usuario:usuario, recomendados: librosrecomendados});
													}
												});
											});
										});
									});
								}else{
									estado="";
									//sacar libro
									condicion={"_id": id_libro};
									libros.findOne(condicion, function (err, registro){
										if(err) throw err;
										//sacar usuario
										condicion={"usuario":usuario};
										usuarios.findOne(condicion, function (err, usuario){
											if(err) throw err;
											condicion={'leidos': {$in: [id_libro]}};
											usuarios.count(condicion, function (err, num){
												if(err) throw err;
												aleatorio=Math.floor((Math.random()*num)+1)-1;
												usuarios.find().populate('leidos').skip(aleatorio).limit(1).find(function (err, usuarioaleatorio){
													librosrecomendados=usuarioaleatorio[0]["leidos"];
													if(librosrecomendados.length==0)
													{
														condicion={'categoria': {$in: usuarioaleatorio[0]["gustos"]}};
														libros.count(condicion, function (err, num){
															if(err) throw err;
															aleatorio=Math.floor((Math.random()*num)+1)-1;
															libros.find().skip(aleatorio).limit(3).find(function (err, librosrelacionados){
																res.render('libros/libro', {estado: estado, libro:registro, usuario:usuario, recomendados: librosrelacionados});
															});
														});
													}else{
														res.render('libros/libro', {estado: estado, libro:registro, usuario:usuario, recomendados: librosrecomendados});
													}
												});
											});
										});
									});
								}
							});
						}
					});
				}
			});
		}else{
			res.redirect('/');
		}
		
	});
}