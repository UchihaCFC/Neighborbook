module.exports = function(io,libros,usuarios,salas, comentarios, notificaciones, librosPropuestos) {
  //finconfiguracion
  io.configure(function (){
    io.set('authorization', function (handshakeData, callback) {
      // findDatabyip is an async example function
      handshakeData.sala=[];
      callback(null, true); 
    });
  });
	io.sockets.on('connection', inicio);
  salasVirtuales=[];//contendra un array con los nombres de las salas y dentro los usuarios conectados
     function inicio(socket){
        hs=[];
        //login
        socket.on("joinSalas", function (usu){
          condicion={"usuario":usu};
          usuarios.count(condicion, function (err, num){
            if(err) throw err;
            if(num==1)
            {
              condicion={"usuario":usu};
              usuarios.findOne(condicion, function (err, registro){
                  if(err) throw err;
                  console.log(registro);
                  if (registro)
                  {
                    tamano=registro["salas"].length;
                    for(i=0;i<tamano;i++)
                    {
                      socket.join(registro["salas"][i]);
                    }
                  }
                  
                });
            }
          });
        });

        //proponer un libro se envia el listado
        socket.on("listadoLibros", function(){
          libros.find({},'titulo', function (err, registros){
               if(err) throw err;
               tamano=registros.length;
               listado=[];
               for(indice=0;indice<tamano;indice++)
               {
                    listado.push(registros[indice]["titulo"]);
               }
               socket.emit('listadoLibros', listado);
          });
        });

        //cuando entra para finalizar el registro
        socket.on("registrarse", function(){
          libros.find({},'titulo', function (err, registros){
               if(err) throw err;
               tamano=registros.length;
               listado=[];
               for(indice=0;indice<tamano;indice++)
               {
                    listado.push(registros[indice]["titulo"]);
               }
               socket.emit('listadoLibros', listado);
          });
        });
        
        //cuando pierde el foco el usuario se valida
        socket.on("validarUsuario", function (usuario){
          usuarios.count({"usuario":usuario}, function (err, num){
               if(err) throw err;
               if(num>0 || !usuario)
               {
                    //enviamos 0, no esta validado
                    socket.emit('validarUsuario', 0);
               }else{
                    socket.emit('validarUsuario', 1);
               }
          });
        });
        
        //cuando pierde el foco el email se valida
        socket.on("validarEmail", function (email){
          usuarios.count({"email":email}, function (err, num){
               if(err) throw err;
               if(num>0 || !email)
               {
                    //enviamos 0, no esta validado
                    socket.emit('validarEmail', 0);
               }else{
                    socket.emit('validarEmail', 1);
               }
          });
        });

        //cuando el usuario entra en un chat de una sala
        socket.on("entrarChat", function (sala,usuario){
          if(typeof(salasVirtuales[sala])=="undefined"){
            salasVirtuales[sala]=[];
          }
          usuario={"usuario":usuario, "id": socket.id};
          salasVirtuales[sala].push(usuario);
          socket.join("chat"+sala);
          io.sockets.in("chat"+sala).emit('nuevoUsuario', usuario, salasVirtuales[sala]);
          sala={"sala":sala, "id":socket.id};
          socket.handshake.sala.push(sala);
        });

        //enviar mensaje al chat
        socket.on("enviarMensaje", function (sala, usuario, mensaje){
          io.sockets.in("chat"+sala).emit('nuevoMensaje', usuario, mensaje);
        });

        //enviar comentario en el debate
        socket.on("enviarComentario", function(usuario, sala, texto, comentario, pregunta, cita){
          nuevoComentario= new comentarios;
          nuevoComentario.sala=sala;//id
          nuevoComentario.texto=texto;
          nuevoComentario.comentario=comentario;
          nuevoComentario.pregunta=pregunta;
          nuevoComentario.cita=cita;
          //condicion para sacar el nombre de usuario para mostrarlo en el lateral de las notificaciones
          condicion={"_id":usuario};
          usuarios.findOne(condicion,{"usuario":1, "imagen":1}, function (err, registro){
            if(err) throw err;
            nombreUsuario=registro["usuario"];
            nuevoComentario.usuario=usuario;
            nuevoComentario.save(function (err){
              if(err) throw err;
              categoria="sala";//para que aparezca con un borde rojo a la izquierda
              //nombre de la sala para emitir
              condicion={"_id": sala};
              id_sala=sala;
              salas.findOne(condicion, {"nombre":1, "url":1}, function (err, registro){
                  if(err) throw err;
                  sala=registro["nombre"];
                  url="/salas-virtuales/"+registro["url"];
                  nuevaNotificacion= new notificaciones;
                  nuevaNotificacion.usuario=usuario;
                  nuevaNotificacion.sala=id_sala;
                  nuevaNotificacion.nombreSala=sala;
                  nuevaNotificacion.url=url;
                  nuevaNotificacion.texto=texto.substring(0,20)+"...";
                  if(comentario==1)
                  {
                    nuevaNotificacion.accion="Ha realizado un comentario";
                    nuevaNotificacion.span="icon-comment";
                  }
                  if(cita==1)
                  {
                    nuevaNotificacion.accion="Ha realizado un cita";
                    nuevaNotificacion.span="icon-right-quote";
                  }
                  if(pregunta==1)
                  {
                    nuevaNotificacion.accion="Ha realizado una pregunta";
                    nuevaNotificacion.span="icon-question";
                  }
                  nuevaNotificacion.save(function (err){
                    if(err) throw err;
                    io.sockets.in(sala).emit('comentarioSala', url, nombreUsuario,categoria,sala);
                    socket.emit('redireccionar', url);
                  })
              });
              
            });
          });
        });

        socket.on("enviarRespuestaComentario", function (usuario, comentario, respuesta){
          condicion={"_id":usuario};
          usuarios.findOne(condicion,{"usuario":1, "imagen":1}, function (err, registro){
            if(err) throw err;
            nombreUsuario=registro["usuario"];
            nuevaRespuesta={
              "usuario": registro["usuario"],
              "imagen": registro["imagen"],
              "respuesta": respuesta
            };
            condicion={"_id":comentario}
            comentarios.findOne(condicion, function (err, registro){
              registro["respuestas"].push(nuevaRespuesta);
              registro.save(function (err){
                if(err) throw err;
                  id_sala=registro["sala"];
                  condicion={"_id": id_sala};
                  salas.findOne(condicion,{"nombre": 1, "url": 1}, function (err, registro){
                    url="/salas-virtuales/"+registro["url"];
                    nuevaNotificacion= new notificaciones;
                    nuevaNotificacion.usuario=usuario;
                    nuevaNotificacion.sala=id_sala;
                    nuevaNotificacion.nombreSala=registro["nombre"];
                    nuevaNotificacion.url=url;
                    nuevaNotificacion.accion="Ha respondido un comentario";
                    nuevaNotificacion.texto=respuesta.substring(0,20)+"...";
                    nuevaNotificacion.span="icon-reply";
                    nuevaNotificacion.save(function (err){
                      sala=registro["nombre"];
                      categoria="sala";//para que aparezca con un borde rojo a la izquierda
              //nombre de la sala para emitir
                      io.sockets.in(sala).emit('respuestaSala', url, nombreUsuario,categoria,sala);
                      socket.emit('redireccionar', url);
                    });  
                  });
              });
            });
          });
        });
        
        //proponer libro
        socket.on('insertarLibroPropuesto', function (id_sala, libro, id_usuario){
            //si el id_sala e id_usuario ya existen en un mismo documento no le dejaremos proponer
            condicion={"sala": id_sala, "usuario":id_usuario};
            librosPropuestos.count(condicion, function (err, num){
              if(err) throw err;
              if(num==1)
              {
                error="<span class='errorproponer'>Ya has propuesto un libro en esta sala</span>";
                socket.emit('errorProponer', error);
              }else{
                 //sacar id del libro
                condicion={"titulo": libro};
                libros.count(condicion, function (err, num){
                  if(err) throw err;
                  if(num==0)
                  {
                    error="<span class='errorproponer'>El libro no existe en nuestra base de datos.</span>";
                      socket.emit('errorProponer', error);
                  }else{
                    libros.findOne(condicion, {"_id":1}, function (err, registro){
                      if(err) throw err;
                        id_libro=registro["_id"];
                        //sacar url de la sala
                        condicion={"_id": id_sala};
                          //saber si existe en esa sala el libro que esta propuesto
                        condicion={"libro":id_libro, "sala":id_sala};
                        librosPropuestos.count(condicion, function (err, num){
                          if(err) throw err;
                          if(num==1)
                          {
                            error="<span class='errorproponer'>El libro ya ha sido propuesto</span>";
                            socket.emit('errorProponer', error);
                          }else{
                            nuevoLibroPropuesto= new librosPropuestos;
                            nuevoLibroPropuesto.sala=id_sala;
                            nuevoLibroPropuesto.libro=id_libro;
                            nuevoLibroPropuesto.votos=1;
                            nuevoLibroPropuesto.usuario=id_usuario;
                            nuevoLibroPropuesto.save(function (err){
                              //sacar nombre de usuario
                              condicion={"_id":id_usuario};
                              usuarios.findOne(condicion,{"usuario":1}, function (err, registro){
                                  nombreUsuario=registro["usuario"];
                                  //sacar datos de la sala
                                  condicion={"_id":id_sala};
                                  salas.findOne(condicion, {"nombre":1, "url":1}, function (err, registro){
                                    sala=registro["nombre"];
                                    url="/salas-virtuales/"+registro["url"];
                                    nuevaNotificacion= new notificaciones;
                                    nuevaNotificacion.usuario=id_usuario;
                                    nuevaNotificacion.sala=id_sala;
                                    nuevaNotificacion.nombreSala=sala;
                                    nuevaNotificacion.url=url;
                                    nuevaNotificacion.accion="Ha propuesto un nuevo libro";
                                    nuevaNotificacion.texto=libro.substring(0,20)+"...";
                                    nuevaNotificacion.span="icon-file";
                                    nuevaNotificacion.save(function (err){
                                      categoria="sala";
                                      io.sockets.in(sala).emit('nuevoLibroPropuesto', url, nombreUsuario,categoria,sala);  
                                      socket.emit('libroPropuestoOk');
                                    });
                                  });   
                              });
                            });
                          }
                        });
                      });
                    }
                });
              }
            });  
        });

        //votar libro
        socket.on("votarLibro", function(sala, libro, usuario){
          //comprobar primero que el usuario aún no ha votado ninguna vez en la sala
          condicion={"sala": sala, "usuario":usuario}
          librosPropuestos.count(condicion, function (err, num){
            if(err) throw err;
            if(num==1)
            {
              error="<span class='error'>Ya has votado un libro</span>";
              socket.emit('errorProponer', error);
            }else{
              condicion={"sala": sala, "libro":libro};
              //sacar el libro que se va a votar
              librosPropuestos.findOne(condicion, function (err, libro){
                if(err) throw err;
                votos=libro.votos;
                votos=votos+1;
                libro.votos=votos;
                libro.save(function (err){
                  if(err) throw err;
                  socket.emit('refrescar');
                })
              });
            }
          });  
        });

        socket.on('draggableLibroComo', function (id_libro, usuario, estado){
           //hay que comprobar si ese libro ya esta añadido, y si esta eliminarlo del estado en el que se encuentre
            switch (estado){
              case "droppableleyendo":
                //esta en libroleyendo
                condicion={'leyendo': {$in: [id_libro]}};
                usuarios.count(condicion, function (err, num){
                  if(err) throw err;
                  if(num==0)
                  {
                    //esta en librosleidos
                    condicion={'leidos': {$in: [id_libro]}};
                    usuarios.count(condicion, function (err, num){
                      if(err) throw err;
                      if(num==0)
                      {
                        //esta en leer
                        condicion={'leer': {$in: [id_libro]}};
                         usuarios.count(condicion, function (err, num){
                          if(err) throw err;
                          if(num==0)
                          { 
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leyendo"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }else{
                            //eliminar id_libro de la lista leer y añadirlo a librosleyendo
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leer"].remove(id_libro);
                              registro["leyendo"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }
                        });
                      }else{
                            //eliminar id_libro de leidos y añadir en leyendo
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leidos"].remove(id_libro);
                              registro["leyendo"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }
                        });
                      }else{
                        socket.emit('yaAnadido');//ya estaba añadido
                      }
                    });         
                break;
              case "droppableleer":
                 //esta en leer
                condicion={'leer': {$in: [id_libro]}};
                usuarios.count(condicion, function (err, num){
                  if(err) throw err;
                  if(num==0)
                  {
                    //esta en leyendo
                    condicion={'leyendo': {$in: [id_libro]}};
                    usuarios.count(condicion, function (err, num){
                      if(err) throw err;
                      if(num==0)
                      {
                        //esta en leidos
                        condicion={'leidos': {$in: [id_libro]}};
                         usuarios.count(condicion, function (err, num){
                          if(err) throw err;
                          if(num==0)
                          {
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leer"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }else{
                            //eliminar id_libro de la leidos y añadirlo a leer
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leidos"].remove(id_libro);
                              registro["leer"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }
                        });
                        }else{
                            //eliminar id_libro de leyendo y añadir a leer
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leyendo"].remove(id_libro);
                              registro["leer"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }
                        });
                      }else{
                        socket.emit('yaAnadido');//ya estaba añadido
                  }
                });
                break;
              case "droppableleidos":
                //esta en libroleido
                condicion={'leidos': {$in: [id_libro]}};
                usuarios.count(condicion, function (err, num){
                  if(err) throw err;
                  if(num==0)
                  {
                    //esta en librosleyendo
                    condicion={'leyendo': {$in: [id_libro]}};
                    usuarios.count(condicion, function (err, num){
                      if(err) throw err;
                      if(num==0)
                      {
                        //esta en leer
                        condicion={'leer': {$in: [id_libro]}};
                         usuarios.count(condicion, function (err, num){
                          if(err) throw err;
                          if(num==0)
                          {
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leidos"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }else{
                            //eliminar id_libro de la lista leer y añadirlo a leidos
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leer"].remove(id_libro);
                              registro["leidos"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }
                        });
                        }else{
                            //eliminar id_libro de leyendo y añadir en leido
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leyendo"].remove(id_libro);
                              registro["leidos"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('refrescar');//se acaba de añadir
                              });
                            });
                          }
                        });
                      }else{
                        socket.emit('yaAnadido');//ya estaba añadido
                      }
                 });
                break;
              default:
                res.redirect('/error');
                break;
            }
        });
        socket.on('anadirLibroComo', function (id_libro, usuario, estado){
            //hay que comprobar si ese libro ya esta añadido, y si esta eliminarlo del estado en el que se encuentre
            switch (estado){
              case "libroleyendo":
                //esta en libroleyendo
                condicion={'leyendo': {$in: [id_libro]}};
                usuarios.count(condicion, function (err, num){
                  if(err) throw err;
                  if(num==0)
                  {
                    //esta en librosleidos
                    condicion={'leidos': {$in: [id_libro]}};
                    usuarios.count(condicion, function (err, num){
                      if(err) throw err;
                      if(num==0)
                      {
                        //esta en leer
                        condicion={'leer': {$in: [id_libro]}};
                         usuarios.count(condicion, function (err, num){
                          if(err) throw err;
                          if(num==0)
                          { 
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leyendo"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }else{
                            //eliminar id_libro de la lista leer y añadirlo a librosleyendo
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leer"].remove(id_libro);
                              registro["leyendo"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }
                        });
                      }else{
                            //eliminar id_libro de leidos y añadir en leyendo
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leidos"].remove(id_libro);
                              registro["leyendo"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }
                        });
                      }else{
                        socket.emit('yaAnadido');//ya estaba añadido
                      }
                    });         
                break;
              case "libroquieroleer":
                 //esta en leer
                condicion={'leer': {$in: [id_libro]}};
                usuarios.count(condicion, function (err, num){
                  if(err) throw err;
                  if(num==0)
                  {
                    //esta en leyendo
                    condicion={'leyendo': {$in: [id_libro]}};
                    usuarios.count(condicion, function (err, num){
                      if(err) throw err;
                      if(num==0)
                      {
                        //esta en leidos
                        condicion={'leidos': {$in: [id_libro]}};
                         usuarios.count(condicion, function (err, num){
                          if(err) throw err;
                          if(num==0)
                          {
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leer"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }else{
                            //eliminar id_libro de la leidos y añadirlo a leer
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leidos"].remove(id_libro);
                              registro["leer"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }
                        });
                        }else{
                            //eliminar id_libro de leyendo y añadir a leer
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leyendo"].remove(id_libro);
                              registro["leer"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }
                        });
                      }else{
                        socket.emit('yaAnadido');//ya estaba añadido
                      }
                    });
                break;
              case "libroleido":
                //esta en libroleido
                condicion={'leidos': {$in: [id_libro]}};
                usuarios.count(condicion, function (err, num){
                  if(err) throw err;
                  if(num==0)
                  {
                    //esta en librosleyendo
                    condicion={'leyendo': {$in: [id_libro]}};
                    usuarios.count(condicion, function (err, num){
                      if(err) throw err;
                      if(num==0)
                      {
                        //esta en leer
                        condicion={'leer': {$in: [id_libro]}};
                         usuarios.count(condicion, function (err, num){
                          if(err) throw err;
                          if(num==0)
                          {
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leidos"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }else{
                            //eliminar id_libro de la lista leer y añadirlo a leidos
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leer"].remove(id_libro);
                              registro["leidos"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }
                        });
                        }else{
                            //eliminar id_libro de leyendo y añadir en leido
                            condicion={"usuario":usuario};
                            usuarios.findOne(condicion, function (err, registro){
                              if(err) throw err;
                              registro["leyendo"].remove(id_libro);
                              registro["leidos"].push(id_libro);
                              registro.save(function (err){
                                if(err) throw err;
                                socket.emit('libroAnadidoOk');//se acaba de añadir
                              });
                            });
                          }
                        });
                      }else{
                        socket.emit('yaAnadido');//ya estaba añadido
                      }
                    });
                break;
              default:
                res.redirect('/error');
            }
        });

        socket.on("comentarioFichaLibro", function (id_libro, usuario, imagenusuario, comentario){
          //sacar el libro del que se ha hecho el comentario
          condicion={"_id":id_libro};
          libros.findOne(condicion, function (err, libro){
            if(err) throw err;
            nuevoComentario={"usuario": usuario, "imagenusuario": imagenusuario, "comentario":comentario};
            libro.comentarios.push(nuevoComentario);
            libro.save(function (err){
              if(err) throw err;
              socket.emit('refrescar');
            });
          });
        });

        socket.on("verMasLibros", function(buscar, usuario, sk, campo){
          switch (campo){
            case "titulo":
              condicion={"titulo": new RegExp(buscar, "i")};
              libros.find().sort("titulo").skip(sk).limit(9).find(condicion, function (err, registros){
                if(err) throw err;
                condicion={"usuario":usuario};
                usuarios.find().sort('titulo').populate('leer leyendo leidos').find(condicion, function (err, registro){
                    socket.emit("mostrarMasLibros", registros, registro[0]);
                });
              });
              break;
            case "autor":
              condicion={"autor": new RegExp(buscar, "i")};
              libros.find().sort("autor").skip(sk).limit(9).find(condicion, function (err, registros){
                if(err) throw err;
                condicion={"usuario":usuario};
                usuarios.find().sort('autor').populate('leer leyendo leidos').find(condicion, function (err, registro){
                    socket.emit("mostrarMasLibros", registros, registro[0]);
                });
              });
              break;
            case "categoria":
              condicion={"categoria": new RegExp(buscar, "i")};
              libros.find().sort("titulo").skip(sk).limit(9).find(condicion, function (err, registros){
                if(err) throw err;
                condicion={"usuario":usuario};
                usuarios.find().sort('titulo').populate('leer leyendo leidos').find(condicion, function (err, registro){
                    socket.emit("mostrarMasLibros", registros, registro[0]);
                });
              });
              break;
            default:
              break;
          }
        });
        socket.on("verMasSalas", function (buscar, sk){
         condicion={"nombre": new RegExp(buscar, "i")};
          salas.find().sort("nombre").skip(sk).limit(9).populate('libroActual librosLeidos').find(condicion, function (err, registros){
            if(err) throw err;
            socket.emit("mostrarMasSalas", registros);
          });
        });

        socket.on("verMasComentarios", function (id_sala, sk, usuario, sala){
          condicion={"sala": id_sala};
          comentarios.find().populate('usuario').sort('-fecha').skip(sk).limit(3).find(condicion, function (err, registros){
            if(err) throw err;
            //saber si el usuario esta activo en la sala si se ha unido
            condicion={'usuario': usuario, 'salas': {$in: [sala]}};
            usuarios.count(condicion, function (err, num){
                if(err) throw err;
                usuarios.find({"usuario": usuario}, function (err, usuario){
                  if(err) throw err;
                  socket.emit("mostrarMasComentarios", registros, num, usuario);
                });
                
            }); 
          })
        });

        socket.on("verMasNotificaciones", function (id_salas, sk){
          salas=id_salas.split(",");
          condicion={'sala': {$in: salas}};
          notificaciones.find().populate('usuario').sort('-fecha').skip(sk).limit(4).find(condicion, function (err, notificaciones){
            if(err) throw err;
            socket.emit("mostrarMasNotificaciones", notificaciones);
          });
        });

        //cambiar informacion del perfil
        socket.on("editarPerfil", function (email, emailantiguo, usuario, usuarioantiguo, loc, sexo){
          //si no se ha modificado el email
          if(email==emailantiguo)
          {
            //comprobar si se ha cambiado el usuario
            if (usuario==usuarioantiguo)
            {
              //modificar entonces solamente la localizacion y el sexo
              condicion={email: emailantiguo};
              usuarios.findOne(condicion, function (err, registro){
                if(err) throw err;
                registro.localizacion=loc;
                registro.sexo=sexo;
                registro.save(function (err){
                  if(err) throw err;
                  socket.emit('perfilGuardado');
                });
              });
            }else{
              //saber si el nuevo usuario ya existe
              condicion={usuario:usuario};
              usuarios.count(condicion, function (err, num){
                if(err) throw err;
                if(num==0){
                  //cambiar el email
                  condicion={email: emailantiguo};
                  usuarios.findOne(condicion, function (err, registro){
                    if(err) throw err;
                    registro.usuario=usuario;
                    registro.localizacion=loc;
                    registro.sexo=sexo;
                    registro.save(function (err){
                      if(err) throw err;
                      socket.emit('perfilGuardado');
                    });
                  });
                }else{
                  socket.emit('errorUsuarioPerfil');
                }
              });
            }
          }else{
            //saber si existe ese email
            condicion={email:email};
            usuarios.count(condicion, function (err, num){
              if(err) throw err;
              if(num==0){
                //comprobar si el usuario se ha cambiado
                if(usuario==usuarioantiguo)
                {
                  condicion={email: emailantiguo};
                  usuarios.findOne(condicion, function (err, registro){
                    if(err) throw err;
                    registro.email=email;
                    registro.localizacion=loc;
                    registro.sexo=sexo;
                    registro.save(function (err){
                      if(err) throw err;
                      socket.emit('perfilGuardado');
                    });
                  });
                }else{
                  condicion={usuario:usuario};
                  usuarios.count(condicion, function (err, num){
                    if(err) throw err;
                    if(num==0){
                      //cambiar el email
                      condicion={email: emailantiguo};
                      usuarios.findOne(condicion, function (err, registro){
                        if(err) throw err;
                        registro.usuario=usuario;
                        registro.email=email;
                        registro.localizacion=loc;
                        registro.sexo=sexo;
                        registro.save(function (err){
                          if(err) throw err;
                          socket.emit('perfilGuardado');
                        });
                      });
                    }else{
                      socket.emit('errorUsuarioPerfil');
                    }
                  });
                } 
              }else{
                socket.emit('errorEmailPerfil');
              }
            });
          }
        });
        
        //borrarcomentario sala
        socket.on('borrarComentarioSala', function (comentario){
          condicion={"_id":comentario};
          comentarios.remove(condicion, function (err, num){
            if(err) throw err;
            socket.emit('refrescar');
          })
        });

        //cambiar gustos del perfil
        socket.on('editarPerfilGustos', function (gustos, usuario){
          condicion={usuario: usuario};
          usuarios.findOne(condicion, function (err, registro){
            if(err) throw err;
            registro.gustos=gustos;
            registro.save(function (err){
              if(err) throw err;
              socket.emit('gustosGuardados');
            });
          });
        });

        //borrarrespuestacomentario sala
        socket.on('borrarRespuestaSala', function (comentario,usuario,respuesta){
          condicion={"_id":comentario};
          comentarios.findOne(condicion, function (err, registro){
            if(err) throw err;
            if(registro.respuestas.length>0)
            {
              for(i=0; i<registro.respuestas.length;i++)
              {
                if(registro.respuestas[i]["usuario"]==usuario && registro.respuestas[i]["respuesta"]==respuesta)
                {
                  registro.respuestas.splice(i, 1);
                  registro.save(function (err, num){
                    if(err) throw err;
                    socket.emit('refrescar');
                  });
                }
              }
            }
          });
        });

        //borrarrespuestacomentario sala
        socket.on('borrarComentarioLibro', function (comentario,usuario,libro){
          condicion={"_id":libro};
          libros.findOne(condicion, function (err, registro){
            if(err) throw err;
            if(registro.comentarios.length>0)
            {
              for(i=0; i<registro.comentarios.length;i++)
              {
                if(registro.comentarios[i]["usuario"]==usuario && registro.comentarios[i]["comentario"]==comentario)
                {
                  registro.comentarios.splice(i, 1);
                  registro.save(function (err, num){
                    if(err) throw err;
                    socket.emit('refrescar');
                  })
                }
              }
            }
          });
        });

        socket.on('cambiarImagenPerfil', function (imagenActual, imagenNueva, usuario, idImagen){
          condicion={"usuario":usuario};
          usuarios.findOne(condicion, function (err, registro){
            if(err) throw err;
            registro.imagen=imagenNueva;
            registro.save(function (err){
              if(err) throw err;
              socket.emit("imagenPerfilCambiada", imagenActual, imagenNueva, idImagen);
            })
          })
        });

        socket.on('disconnect', function() {
          sala=buscarSala(socket.handshake.sala, socket.id);
          salasVirtuales[sala]=findAndRemove(salasVirtuales[sala], socket.id);
          socket.leave("chat"+sala);
        });
     }

     function findAndRemove(array, value) {
       //quiere decir que sale de una sala
       if(array)
       {
        tamano=array.length;
        nuevoArray=[]
         for(i=0; i<tamano; i++)
         {
            if(array[i]["id"]!=value)
            {
              nuevoArray.push(array[i]);
            }else{
              usuario=array[i]["usuario"];
            }
            
         }
         io.sockets.in("chat"+sala).emit('usuarioDesconectado',usuario, nuevoArray);
         return nuevoArray;
       }   
    }

    function buscarSala(sala, id) {
       //quiere decir que sale de una sala
       if(sala)
       {
         tamano=sala.length;
         for(i=0; i<tamano; i++)
         {
            if(sala[i].id==id)
            {
              return sala[i].sala;
            }
            
         }
       }   
    }
}