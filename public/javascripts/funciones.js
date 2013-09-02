var socket=io.connect('http://localhost:3000');
$(document).on("ready", inicio);
var notificaciones=[];//aqui se almacenan las notificaciones que se producen en tiempo real
function inicio(){
	//cargar las notificaciones que se han producido en tiempo real
	socket.emit("notificacionesTiempoReal");
	//enviar nombre de usuario para hacer login en las distintas salas
	if($("#perfilusuario").length)
	{
		usuario=$("#perfilusuario").attr("data-usuario");
		socket.emit("joinSalas", usuario);
	}
	//colocar el menu activo
	if($("#menuactivo").length)
	{
		arriba=$("#menuactivo").offset().top+10;
		izquierda=$("#dashboard").offset().left-10;
		$(".flechamenu").offset({ top: arriba, left: izquierda });
		$(window).resize(function() {
	  		arriba=$("#menuactivo").offset().top+10;
			izquierda=$("#dashboard").offset().left-10;
			$(".flechamenu").offset({ top: arriba, left: izquierda });
		});
	}

	//marcar a la hora realizar un debate el comentario la pregunta o la cita
	$(".icono").on("click", clasificarComentario);

	//entrar-chat
	$(".entrarchat").on("click", entrarChat);

	//proponer libro
	$(".proponerlibro").on("click", proponerLibro);

	//un usuario entra en la sala
	socket.on("nuevoUsuario", nuevoUsuario);

	//un usuario sale de la sala
	socket.on("usuarioDesconectado", usuarioDesconectado);

	//un usuario envia un mensaje en el chat
	$("#enviarchat").on("click", enviarChat);

	//mientras escribes en el chat saber si pulsas enter para enviar el mensaje
	$("#mensaje").on("keypress", escribirChat);

	//ya sabemos a que sala le enviamso el mensaje
	socket.on("nuevoMensaje", nuevoMensaje);

	//enviar comentario dentro de una sala
	$('#formdebate').on("submit", enviarComentario);

	//recibir comentario como notificacion
	socket.on("comentarioSala", comentarioSala);

	//recibir respuesta como notificacion
	socket.on("respuestaSala", respuestaSala);

	//refrescar pagina despues de enviar comentario, respuesta
	socket.on("refrescar",refrescar);

	//redireccionar
	socket.on("redireccionar", redireccionar);

	//listado de libros para proponer un libro
	socket.on('listadoLibros', listarLibros);

	//efecto de mostrar el formulario cuando se clicka en el icono de responder el comentario
	$('.respondercomentario').on("click", mostrarResponder);

	//enviar respuesta de un comentario
	$(".formrespuestadebate").on("submit", enviarRespuestaComentario);

	//mostrar notificaciones en tiempo real
	socket.on("mostrarNotificaciones", mostrarNotificaciones);

	//enviar formulario
	$("#formproponer").on("submit", insertarLibroPropuesto);

	// se ha propuesto el libro en la sala correctamente
	socket.on("libroPropuestoOk", libroPropuestoOk);

	//votar libro
	$("#votarlibro").on("click", votarLibro);

	//error al proponer libro
	socket.on("errorProponer", errorProponer);

	//nuevo libro propuesto enviar notificacion
	socket.on("nuevoLibroPropuesto", nuevoLibroPropuesto);

	//formulario de busqueda
	$("#formbuscar").on("submit", validarBuscar);

	//añadir un libro como leyendo quiero leer o leido
	$(".marcarcomo span").on("click", anadirLibro);

	//el libro ya habia sido añadido a ese estado
	socket.on("yaAnadido", yaAnadido);

	//el libro se añadió con exito
	socket.on("libroAnadidoOk", libroAnadidoOk);

	//biblioteca pinchar en los diferentes cuadros
	//leyendo
	$("#detallesbiblioteca .leyendoresumen").on("click", mostrarLibrosLeyendo);
	//leidos
	$("#detallesbiblioteca .leidosresumen").on("click", mostrarLibrosLeidos);
	//leer
	$("#detallesbiblioteca .leerresumen").on("click", mostrarLibrosLeer);

	//dragable los libros
	if($(".libro").length){
		$(".libro img").draggable({ 
			revert: true,
			cursor: "move", 
			cursorAt: { top: 20, left: 20 },
			opacity: 0.5,
			start: function(){
				 $(this).css({width: $(this).width()/2});
				 $("#detallesbiblioteca .cajetines").css({padding: "0.6em 1em"});
			},
			stop: function(){
				$(this).css({width: $(this).width()*2});
				$("#detallesbiblioteca .cajetines").css({padding: "0.4em 0.75em"});
			}
		});
	}
	

	//droppable las cajas de resumen
	if($("#detallesbiblioteca aside").length)
	{
		$("#detallesbiblioteca aside").droppable({
			accept: ".libro img",
			activeClass: "ui-state-hover",
			hoverClass: "ui-state-active",
			drop: function (event, ui){
				id_libro=ui.draggable.attr('data-libro');
				usuario=ui.draggable.attr('data-usuario');
				estado=$(this).attr('id');
				//alert(estado);
				socket.emit("draggableLibroComo", id_libro, usuario, estado);
			}
		});
	}
	
	//enviar comentario en la ficha del libro
	$("#formcomentarioslibro").on("submit", comentarioFichaLibro);

	//ver mas libros
	$("#vermaslibros").on("click", verMasLibros);

	//mostrar los sigiuentes libros de la busqueda
	socket.on("mostrarMasLibros", mostrarMasLibros);

	//ver mas salas
	$("#vermassalas").on("click", verMasSalas);
	//mostrar los siguientes salas de la busqueda
	socket.on("mostrarMasSalas", mostrarMasSalas);

	//ver mas comentarios
	$("#vermascomentariossala").on("click", verMasComentarios);
	//mostrar mas comentarios
	socket.on("mostrarMasComentarios", mostrarMasComentarios);

	//ver mas notificaciones
	$("#vermasnot").on("click", verMasNotificaciones);

	//mostrar mas notificaciones
	socket.on("mostrarMasNotificaciones", mostrarMasNotificaciones);

	//guardar perfil usuario
	$(".btformularioperfil").on("click", guardarInfoPerfil);

	//usuario repetido
	socket.on("errorUsuarioPerfil", errorUsuarioPerfil);
	//email repetido
	socket.on("errorEmailPerfil", errorEmailPerfil);

	//perfilguardado
	socket.on("perfilGuardado", perfilGuardado);

	//cambair gustos del perfil
	$(".btformulariogustosliterarios").on("click", guardarInfoGustos);

	//gustosguardados
	socket.on("gustosGuardados", gustosGuardados);

	//borrar comentario sala
	$(".borrarcomentariosala").on("click", borrarComentarioSala);

	//borrar respuesta del comentario de sala
	$(".borrarrespuestasala").on("click", borrarRespuestaSala);

	//borrar comentario de unl ibro
	$('.borrarcomentariolibro').on("click", borrarComentarioLibro);

	//ver mas de descripcion del libro
	$('#vermasdescripcion').on("click", mostrarDescripcionLarga);

	//cerrar ayuda
	$('.cerrardraggable').on("click", cerrarAyuda);

	//cambiar imagen para perfil
	$('.imagenparaperfil').on("click", cambiarImagenPerfil);

	//imagen cambiada
	socket.on("imagenPerfilCambiada", imagenPerfilCambiada);
}

clasificado="";//tendra el valor de la clase de icon-question activado

function clasificarComentario(){
	alerta=0;
	clases=$(this).attr('class');
	clases=clases.replace(/icono$/g,"");
	switch (clases)
	{
		case "icon-comment ":
			if(clasificado!="icon-question " && clasificado!="icon-right-quote ")
			{
				activo=$("#comentario").val();
				if(activo==1)
				{
					cambiosCss={"color": "#888"};
					$(this).css(cambiosCss);
					$("#comentario").val(0);
					clasificado="";
				}else{
					cambiosCss={"color": "#06a5ce"};
					$(this).css(cambiosCss);
					$("#comentario").val(1);
					clasificado=clases;
				}
			}else{
				alerta=1;
			}
			break;
		case "icon-question ":
			if(clasificado!="icon-comment " && clasificado!="icon-right-quote ")
			{
				activo=$("#pregunta").val();
				if(activo==1)
				{
					cambiosCss={"color": "#888"};
					$(this).css(cambiosCss);
					$("#pregunta").val(0);
					clasificado="";
				}else{
					cambiosCss={"color": "#16c52c"};
					$(this).css(cambiosCss);
					$("#pregunta").val(1);
					clasificado=clases;
				}
			}else{
				alerta=1;
			}
			break;
		case "icon-right-quote ":
			if(clasificado!="icon-question " && clasificado!="icon-comment ")
			{
				activo=$("#cita").val();
				if(activo==1)
				{
					cambiosCss={"color": "#888"};
					$(this).css(cambiosCss);
					$("#cita").val(0);
					clasificado="";
				}else{
					cambiosCss={"color": "#c11919"};
					$(this).css(cambiosCss);
					$("#cita").val(1);
					clasificado=clases;
				}
			}else{
				alerta=1;
			}
			break;
	}
	if(alerta==1){
		alert("Neighborbook Alerta\n 'Sólo se puede escoger una opción'");
	}
}

function entrarChat(){
	sala=$(this).attr('data-chat');
	usuario=$(this).attr('data-usuario');
	$("#chat").show();
	$("#enviarmensaje").show();
	$("#librosala").hide();
	$("#debate").hide();
	$("#proponerlibros").hide();
	socket.emit('entrarChat', sala,usuario);
}

function nuevoUsuario(usuario, sala){
	usuarios=sala.length;//usuarios conectados
	usuariosconectados="";
	for(i=0;i<usuarios;i++)
	{
			usuariosconectados+="<li>"+sala[i].usuario+"</li>";	
	}
	$("#usuariosconectados ul").html("");
	$("#usuariosconectados ul").append(usuariosconectados);
	usuariosconectados = $('#usuariosconectados ul li').get();
	usuariosconectados.sort(function(a,b){
	  var keyA = $(a).text();
	  var keyB = $(b).text();

	  if (keyA < keyB) return -1;
	  if (keyA > keyB) return 1;
	  return 0;
	});
	var ul = $('#usuariosconectados ul');
	$.each(usuariosconectados, function(i, li){
	  ul.append(li);
	});

	$(".sms").append("<li>El usuario <span class='usu'>"+usuario.usuario+"</span> se ha conectado</li>");
	
}

function usuarioDesconectado(usuario, sala)
{
	usuarios=sala.length;//usuarios conectados
	usuariosconectados="";
	for(i=0;i<usuarios;i++)
	{
			console.log(sala[i]);
			usuariosconectados+="<li>"+sala[i].usuario+"</li>";	
	}
	$("#usuariosconectados ul").html("");
	$("#usuariosconectados ul").append(usuariosconectados);
	usuariosconectados = $('#usuariosconectados ul li').get();
	usuariosconectados.sort(function(a,b){
	  var keyA = $(a).text();
	  var keyB = $(b).text();

	  if (keyA < keyB) return -1;
	  if (keyA > keyB) return 1;
	  return 0;
	});
	var ul = $('#usuariosconectados ul');
	$.each(usuariosconectados, function(i, li){
	  ul.append(li);
	});
	$(".sms").append("<li>El usuario <span class='usudesconectado'>"+usuario+"</span> se ha desconectado</li>");
}

function enviarChat(){
	sala=$(this).attr('data-chat');
	usuario=$(this).attr('data-usuario');
	mensaje=$("#mensaje").val();
	if(mensaje)
	{
		socket.emit("enviarMensaje", sala, usuario, mensaje);
		$(this).val("");
	}
}

function escribirChat(event){
	if(event.charCode==13)
	{
		sala=$(this).attr('data-chat');
		usuario=$(this).attr('data-usuario');
		mensaje=$(this).val();
		if(mensaje)
		{
			socket.emit("enviarMensaje", sala, usuario, mensaje);
			$(this).val("");
		}		
	}
}

function nuevoMensaje(usuario, mensaje){
	$(".sms").append("<li><span class='usu'>"+usuario+"</span>: "+mensaje+"</li>");
	$("#mensaje").html("");
}

function enviarComentario(){
	usuario=$("#usuario").val();
	sala=$("#sala").val();
	texto=$("#texto").val();
	comentario=$("#comentario").val();
	pregunta=$("#pregunta").val();
	cita=$("#cita").val();
	if(comentario==0 && pregunta==0 && cita==0)
	{
		$("#formdebate").prepend("<span class='error'>Se necesita clasificar tu comentario</span>");
	}else{
		socket.emit("enviarComentario", usuario, sala, texto, comentario, pregunta, cita);
		comentario=$("#comentario").val(0);
		pregunta=$("#pregunta").val(0);
		cita=$("#cita").val(0);
	}
	return false;
}

function refrescar(){
	location.reload();
}

function redireccionar(url){
	location.href=url;
}

function mostrarResponder(){
	comentario=$(this).attr('data-comentario');
	if($("#"+comentario).height()==0)
	{
		cambios={
			height: "100px"
		};
	}else{
		cambios={
			height: "0px"
		};
	}
	
	$("#"+comentario).css(cambios);
}

function enviarRespuestaComentario(){
	form=$(this).attr('id');//id del formulario
	usuario=$("#"+form+" .usuariorespuesta").val();
	comentario=$("#"+form+" .comentariorespuesta").val();
	respuesta=$("#"+form+" .respuesta").val();
	socket.emit("enviarRespuestaComentario", usuario, comentario, respuesta);
	return false;
}

function comentarioSala(url, usuario, categoria, sala){
	notificacion="<section class='notificacion salanotificacion'><span class='notificacionsala'><a href='"+url+"' title='Nuevo comentario en "+sala+"'>"+sala+"</a></span>: <span class='usuarionotificacion'>"+usuario+"</span> ha realizado un comentario</section>";
	$("#notificaciones").append(notificacion);
}

function respuestaSala(url, usuario, categoria, sala){
	notificacion="<section class='notificacion salanotificacion'><span class='notificacionsala'><a href='"+url+"' title='Nueva respuesta en "+sala+"'>"+sala+"</a></span>:<span class='usuarionotificacion'>"+usuario+"</span> ha contestado un comentario</section>";
	$("#notificaciones").append(notificacion);
}

function mostrarNotificaciones(notificaciones){
	tamano=notifiaciones.length;
		for(i=tamano-1; i>=0; i--)
		{
			if(notificaciones[i]["categoria"]=="sala")
			{
				notificacion="<section class='notificacion salanotificacion'><span class='notificacionsala'><a href='"+notificaciones[i]["url"]+"' title='"+notificaciones[i]["sala"]+"'>"+snotificaciones[i]["sala"]+"</a></span>: <span class='usuarionotificacion'>"+notificaciones[i][usuario]+"</span>"+notificaciones[i]["accion"]+"</section>";
				$("#notificaciones").append(notificacion);
			}
			
		}
}


function proponerLibro(){
	titulo=$(this).attr("title");
	mostrar={display: "inline-block"};
	ocultar={display: "none"};
	if(titulo=="Proponer libro")
	{
		$("#debate").css(ocultar);
		$("#proponerlibros").css(mostrar);
		$(this).attr("title","Ver Debate");
		$(this).html("Ver debate");
		socket.emit("listadoLibros");
	}else{
		$("#proponerlibros").css(ocultar);
		$("#debate").css(mostrar);
		$(this).attr("title","Proponer libro");
		$(this).html("Proponer Libro");
	}
}

function listarLibros(listado){
	libros=listado;
	$("#libroproponer").autocomplete({
		minLength: 3,
	     source: function(request, response) {
	         var resultados = $.ui.autocomplete.filter(libros, request.term);
	         response(resultados);
	     }
	});
}

function insertarLibroPropuesto(){
	id_sala=$("#salalibropropuesto").val();
	libro=$("#libroproponer").val();
	id_usuario=$("#usuariopropuesto").val();
	socket.emit("insertarLibroPropuesto", id_sala, libro, id_usuario);
	$("#libroproponer").val("");
	return false;
}

function libroPropuestoOk(){
	ok="<span class='ok'>El libro se ha propuesto correctamente, recargue la página para ver los cambios</span>";
	$("#formproponer").prepend(ok);
}

function votarLibro(){
	sala=$(this).attr("data-sala");
	libro=$(this).attr("data-libro");
	usuario=$(this).attr("data-usuario");
	socket.emit("votarLibro", sala, libro, usuario);
}

function errorProponer(error){
	if($("#formproponer .errorproponer")){
		$("#formproponer .errorproponer").html("");
	}
	$("#formproponer").prepend(error);
}

function nuevoLibroPropuesto(url, usuario, categoria, sala){
	notificacion="<section class='notificacion salanotificacion'><span class='notificacionsala'><a href='"+url+"' title='Nueva libro propuesto en "+sala+"'>"+sala+"</a></span>: <span class='usuarionotificacion'>"+usuario+"</span> ha propuesto un nuevo libro</section>";
	$("#notificaciones").append(notificacion);
}

function validarBuscar(){
	if($("#categoria").val()==0)
	{
		if($("#busquedaerror"))
		{
			$("#busquedaerror").html("");
		}
		$("#formbuscar").prepend("<section id='busquedaerror'>Escoge una categoría</span>");
		return false;
	}else{
		return true;
	}
}

function anadirLibro(){
	id_libro=$(this).attr('data-libro');
	usuario=$(this).attr('data-usuario');
	estado=$(this).attr('id');
	socket.emit("anadirLibroComo", id_libro, usuario, estado);
}

function yaAnadido(){
	alert("El libro ya estaba añadido, lo puedes ver en la Biblioteca");

}

function libroAnadidoOk(){
	alert("El libro se ha añadido con éxito, lo puedes ver en la Biblioteca");
	location.href="/biblioteca";
}

function mostrarLibrosLeyendo(){
	mostrar={display: "block"};
	ocultar={display: "none"};
	$("#librosbiblioteca").css(ocultar);
	$("#librosleer").css(ocultar);
	$("#librosleidos").css(ocultar);
	$("#librosleyendo").css(mostrar);
}

function mostrarLibrosLeidos(){
	mostrar={display: "block"};
	ocultar={display: "none"};
	$("#librosbiblioteca").css(ocultar);
	$("#librosleer").css(ocultar);
	$("#librosleyendo").css(ocultar);
	$("#librosleidos").css(mostrar);
}

function mostrarLibrosLeer(){
	mostrar={display: "block"};
	ocultar={display: "none"};
	$("#librosbiblioteca").css(ocultar);
	$("#librosleidos").css(ocultar);
	$("#librosleyendo").css(ocultar);
	$("#librosleer").css(mostrar);
}

function comentarioFichaLibro(){
	id_libro=$("#id_libro").val();
	usuario=$("#usuario").val();
	imagenusuario=$('#imagenusuario').val();
	comentario=$('#comentario').val();
	socket.emit("comentarioFichaLibro", id_libro,usuario, imagenusuario, comentario);
	return false;
}

function verMasLibros(){
	buscar=$(this).attr('data-buscar');
	usuario=$(this).attr('data-usuario');
	skip=$(this).attr('data-skip');
	campo=$(this).attr('data-campo');
	socket.emit("verMasLibros", buscar, usuario, skip, campo);
}

function mostrarMasLibros(resultados, usuario){
	if(resultados.length>0)
	{
		texto="";
		tamano=resultados.length;
		for(i=0; i<tamano;i++)
		{
			texto+="<section class='resultadolibro' data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'>";
				texto+="<img src='"+resultados[i]["imagen"]+"' alt='"+resultados[i]["titulo"]+"' alt='"+resultados[i]["titulo"]+"'/>";
				texto+="<section class='detallelibro'>";
					texto+="<a href='/libros/"+resultados[i]["_id"]+"' title='"+resultados[i]["titulo"]+"'>"+resultados[i]["titulo"].substr(0,60)+"</a>";
					texto+="<br/>";
					texto+="<section class='marcarcomo'>";
						//leyendo
						if(usuario["leyendo"].length>0)
						{
							agregadoleyendo=0;
							for(j=0;j<usuario["leyendo"].length;j++)
							{
								if(resultados[i]["titulo"]==usuario["leyendo"][j]["titulo"])
								{
									agregadoleyendo=1;
								}
							}
							if(agregadoleyendo==1)
							{
								texto+="<span aria-hidden='true', class='icon-bookmark', id='marcadolibroleyendo', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
							}else{
								texto+="<span aria-hidden='true', class='icon-bookmark', id='libroleyendo', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
							}
						}else{
							texto+="<span aria-hidden='true', class='icon-bookmark', id='libroleyendo', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
						}
						//leer
						if(usuario["leer"].length>0)
						{
							agregadoleyendo=0;
							for(j=0;j<usuario["leer"].length;j++)
							{
								if(resultados[i]["titulo"]==usuario["leer"][j]["titulo"])
								{
									agregadoleyendo=1;
								}
							}
							if(agregadoleyendo==1)
							{
								texto+="<span aria-hidden='true', class='icon-bookmark', id='marcadolibroquieroleer', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
							}else{
								texto+="<span aria-hidden='true', class='icon-bookmark', id='libroquieroleer', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
							}
						}else{
							texto+="<span aria-hidden='true', class='icon-bookmark', id='libroquieroleer', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
						}
						//leido
						if(usuario["leidos"].length>0)
						{
							agregadoleyendo=0;
							for(j=0;j<usuario["leidos"].length;j++)
							{
								if(resultados[i]["titulo"]==usuario["leidos"][j]["titulo"])
								{
									agregadoleyendo=1;
								}
							}
							if(agregadoleyendo==1)
							{
								texto+="<span aria-hidden='true', class='icon-bookmark', id='marcadolibroleido', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
							}else{
								texto+="<span aria-hidden='true', class='icon-bookmark', id='libroleido', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
							}
						}else{
							texto+="<span aria-hidden='true', class='icon-bookmark', id='libroleido', data-libro='"+resultados[i]["_id"]+"' data-usuario='"+usuario["usuario"]+"'></span>";
						}
					texto+="</section>";
				texto+="</section>";
			texto+="</section>";
		}
	}else{
		texto="<aside class='noresultados'>No se han encontrado más resultados</aside>";
		skip=$("#vermaslibros").remove();
	}
	$("#resultadosbusquedalibros").append(texto);
	//añadir un libro como leyendo quiero leer o leido
	$(".marcarcomo span").on("click", anadirLibro);
	skip=$("#vermaslibros").attr("data-skip");
	skip=parseInt(skip);
	skip=skip+9;
	skip=$("#vermaslibros").attr("data-skip", skip);	
}

function verMasSalas(){
	buscar=$(this).attr('data-buscar');
	skip=$(this).attr('data-skip');
	socket.emit("verMasSalas", buscar, skip);
}

function mostrarMasSalas(resultados, usuario){
	if(resultados.length>0)
	{
		texto="";
		tamano=resultados.length;
		for(i=0; i<tamano;i++)
		{
			texto+="<section class='svsalavirtual'>";
				texto+="<a href='/salas-virtuales/"+resultados[i]["url"]+"' title='"+resultados[i]["nombre"]+"' title='"+resultados[i]["nombre"]+"'>"+resultados[i]["nombre"]+"</a><br/>";
				if(resultados[i]["libroActual"].length>0){
					texto+="<img src='"+resultados[i]["libroActual"][0]["imagen"]+"' alt='"+resultados[i]["libroActual"][0]["titulo"]+"'";

				}
				texto+="<section class='detallesala'>";
					texto+="<section class='salalibrosleidos'>";
						texto+="Leídos anteriormente<br/><br/>";
						if(resultados[i]["librosLeidos"].length>0)
						{
							for(j=0;j<resultados[i]["librosLeidos"].length;j++)
							{
								if(j>resultados[i]["librosLeidos"].length-3)
								{
									texto+="<a href='/libros/"+resultados[i]["librosleidos"][j]["url"]+"' title='"+resultados[i]["librosLeidos"][j]["titulo"]+">";
										texto+="<img src='"+resultados[i]["librosLeidos"][j]["imagen"]+"' title='"+resultados[i]["librosLeidos"][j]["titulo"]+"'/>";
									texto="</a>";
								}
							}
						}else{
							texto+="Anteriormente no se han leído libros";
						}
						texto+="</section>";
				texto+="</section>";
			texto+="</section>";
		}
	}else{
		texto="<aside class='noresultados'>No se han encontrado más resultados</aside>";
		skip=$("#vermassalas").remove();
	}
	$("#resultadossalasvirtuales").append(texto);
	skip=$("#vermassalas").attr("data-skip");
	skip=parseInt(skip);
	skip=skip+8;
	skip=$("#vermassalas").attr("data-skip", skip);	
}

function verMasComentarios(){
	skip=$(this).attr('data-skip');
	id_sala=$(this).attr('data-sala');
	usuario=$(this).attr('data-usuario');
	nombresala=$(this).attr('data-nombresala');
	socket.emit("verMasComentarios", id_sala, skip, usuario, nombresala);
}

function mostrarMasComentarios(comentarios, activo, usuario){
	if(comentarios.length>0)
	{
		texto="";
		for(i=0;i<comentarios.length;i++)
		{
			comentario=comentarios[i];
			//si es comentario
			if(comentario.comentario==1)
			{
				texto+="<section class='comentario clascomentario'>";
					texto+="<aside class='comentariousuario'>";
						if(comentario.usuario)
						{
							texto+="<img src='/images/"+comentario.usuario.imagen+"' title='Escrito por "+comentario.usuario.usuario+"' alt='Escrito por "+comentario.usuario.usuario+"'/>";
						}else{
							texto+="<img src='/images/default.jpg' title='Escrito por desconocido' alt='Escrito por desconocido'/>";
						}
						
					texto+="</aside>";
					texto+="<aside class='comentariocategoria'>";
						texto+="<span aria-hidden='true' class='icon-comment'></span>";
					texto+="</aside>";
					texto+="<section class='comentariotexto'>";
						texto+=comentario.texto;
						texto+="<aside>";
							if(activo==1)
							{
								texto+="<span aria-hidden='true' class='icon-reply respondercomentario' data-comentario='"+comentario._id+"'></span>";
							}
							if(comentario.usuario)
							{
								if(usuario[0].usuario==comentario.usuario.usuario)
								{
									texto+="<a href='#' title='Borrar comentario' data-comentario='"+comentario._id+"' class='borrarcomentariosala'> X</a>";
								}
							}
						texto+="</aside>";
					texto+="</section>";
				texto+="</section>";
					texto+="<section class='respuestascomentario'>";
						texto+="<form action='#' class='formrespuestadebate' id='"+comentario._id+"'>";
							texto+="<textarea class='respuesta' name='respuesta'></textarea>";
							texto+="<input type='hidden' name='usuariorespuesta', class='usuariorespuesta' value='"+usuario[0]._id+"'/>";
							texto+="<input type='hidden' name='comentariorespuesta' class='comentariorespuesta' value='"+comentario._id+"'/>";
							texto+="<aside>";
								texto+="<input type='submit' value='Responder'/>";
							texto+="</aside>";
						texto+="</form>";
						if(comentario.respuestas.length>0)
						{
							for(j=0;j<comentario.respuestas.length;j++)
							{
								respuesta=comentario.respuestas[j];
								texto+="<aside class='respuestausuario'>";
									texto+="<aside class='comentariousuario'>";
										texto+="<img src='/images/"+respuesta.imagen+"' alt='Respuesta de "+respuesta.usuario+"' title='Respuesta de "+respuesta.usuario+"'/>";
									texto+="</aside>";
									texto+="<section class='comentariotexto'>";
										texto+=respuesta.respuesta;
									texto+="</section>";
									if (respuesta.usuario==usuario[0].usuario)
									{
										texto+="<section class='eliminarrespuesta'>";
											texto+="<a href='#' title='Borrar respuesta' data-comentario='"+comentario._id+"' data-usuario='"+respuesta.usuario+"' data-respuesta='"+respuesta.respuesta+"' class='borrarrespuestasala'>X</a>";
										texto+="</section>";
									}			
								texto+="</aside>"
							}
						}else{
							texto+="<aside.respuestausuario>";
								texto+="No existen respuesta";
							texto+="</aside>";
						}
					texto+="</section>";
			}
			//si es pregunta
			if(comentario.pregunta==1)
			{
				texto+="<section class='comentario claspregunta'>";
					texto+="<aside class='comentariousuario'>";
						if(comentario.usuario)
						{
							texto+="<img src='/images/"+comentario.usuario.imagen+"' title='Escrito por "+comentario.usuario.usuario+"' alt='Escrito por "+comentario.usuario.usuario+"'/>";
						}else{
							texto+="<img src='/images/default.jpg' title='Escrito por desconocido' alt='Escrito por desconocido'/>";
						}
						
					texto+="</aside>";
					texto+="<aside class='comentariocategoria'>";
						texto+="<span aria-hidden='true' class='icon-question'></span>";
					texto+="</aside>";
					texto+="<section class='comentariotexto'>";
						texto+=comentario.texto;
						texto+="<aside>";
							if(activo==1)
							{
								texto+="<span aria-hidden='true' class='icon-reply respondercomentario' data-comentario='"+comentario._id+"'></span>";
							}
							if(comentario.usuario)
							{
								if(usuario[0].usuario==comentario.usuario.usuario)
								{
									texto+="<a href='#' title='Borrar comentario' data-comentario='"+comentario._id+"' class='borrarcomentariosala'> X</a>";
								}
							}
						texto+="</aside>";
					texto+="</section>";
				texto+="</section>";
					texto+="<section class='respuestascomentario'>";
						texto+="<form action='#' class='formrespuestadebate' id='"+comentario._id+"'>";
							texto+="<textarea class='respuesta' name='respuesta'></textarea>";
							texto+="<input type='hidden' name='usuariorespuesta', class='usuariorespuesta' value='"+usuario[0]._id+"'/>";
							texto+="<input type='hidden' name='comentariorespuesta' class='comentariorespuesta' value='"+comentario._id+"'/>";
							texto+="<aside>";
								texto+="<input type='submit' value='Responder'/>";
							texto+="</aside>";
						texto+="</form>";
						if(comentario.respuestas.length>0)
						{
							for(j=0;j<comentario.respuestas.length;j++)
							{
								respuesta=comentario.respuestas[j];
								texto+="<aside class='respuestausuario'>";
									texto+="<aside class='comentariousuario'>";
										texto+="<img src='/images/"+respuesta.imagen+"' alt='Respuesta de "+respuesta.usuario+"' title='Respuesta de "+respuesta.usuario+"'/>";
									texto+="</aside>";
									texto+="<section class='comentariotexto'>";
										texto+=respuesta.respuesta;
									texto+="</section>";
									if (respuesta.usuario==usuario[0].usuario)
									{
										texto+="<section class='eliminarrespuesta'>";
											texto+="<a href='#' title='Borrar respuesta' data-comentario='"+comentario._id+"' data-usuario='"+respuesta.usuario+"' data-respuesta='"+respuesta.respuesta+"' class='borrarrespuestasala'>X</a>";
										texto+="</section>";
									}			
								texto+="</aside>"
							}
						}else{
							texto+="<aside.respuestausuario>";
								texto+="No existen respuesta";
							texto+="</aside>";
						}
					texto+="</section>";
			}
			//si es cita
			if(comentario.cita==1)
			{
				texto+="<section class='comentario clascita'>";
					texto+="<aside class='comentariousuario'>";
						if(comentario.usuario){
							texto+="<img src='/images/"+comentario.usuario.imagen+"' title='Escrito por "+comentario.usuario.usuario+"' alt='Escrito por "+comentario.usuario.usuario+"'/>";
						}else{
							texto+="<img src='/images/default.jpg' title='Escrito por desconocido' alt='Escrito por desconocido'/>";
						}
						
					texto+="</aside>";
					texto+="<aside class='comentariocategoria'>";
						texto+="<span aria-hidden='true' class='icon-right-quote'></span>";
					texto+="</aside>";
					texto+="<section class='comentariotexto'>";
						texto+=comentario.texto;
						texto+="<aside>";
							if(activo==1)
							{
								texto+="<span aria-hidden='true' class='icon-reply respondercomentario' data-comentario='"+comentario._id+"'></span>";
							}
							if(comentario.usuario)
							{
								if(usuario[0].usuario==comentario.usuario.usuario)
								{
									texto+="<a href='#' title='Borrar comentario' data-comentario='"+comentario._id+"' class='borrarcomentariosala'> X</a>";
								}
							}
						texto+="</aside>";
					texto+="</section>";
				texto+="</section>";
					texto+="<section class='respuestascomentario'>";
						texto+="<form action='#' class='formrespuestadebate' id='"+comentario._id+"'>";
							texto+="<textarea class='respuesta' name='respuesta'></textarea>";
							texto+="<input type='hidden' name='usuariorespuesta', class='usuariorespuesta' value='"+usuario[0]._id+"'/>";
							texto+="<input type='hidden' name='comentariorespuesta' class='comentariorespuesta' value='"+comentario._id+"'/>";
							texto+="<aside>";
								texto+="<input type='submit' value='Responder'/>";
							texto+="</aside>";
						texto+="</form>";
						if(comentario.respuestas.length>0)
						{
							for(j=0;j<comentario.respuestas.length;j++)
							{
								respuesta=comentario.respuestas[j];
								texto+="<aside class='respuestausuario'>";
									texto+="<aside class='comentariousuario'>";
										texto+="<img src='/images/"+respuesta.imagen+"' alt='Respuesta de "+respuesta.usuario+"' title='Respuesta de "+respuesta.usuario+"'/>";
									texto+="</aside>";
									texto+="<section class='comentariotexto'>";
										texto+=respuesta.respuesta;
									texto+="</section>";
									if (respuesta.usuario==usuario[0].usuario)
									{
										texto+="<section class='eliminarrespuesta'>";
											texto+="<a href='#' title='Borrar respuesta' data-comentario='"+comentario._id+"' data-usuario='"+respuesta.usuario+"' data-respuesta='"+respuesta.respuesta+"' class='borrarrespuestasala'>X</a>";
										texto+="</section>";
									}												
								texto+="</aside>";
							}
						}else{
							texto+="<aside.respuestausuario>";
								texto+="No existen respuesta";
							texto+="</aside>";
						}
					texto+="</section>";
			}								
									
		}
	}else{
		texto="<aside class='noresultados'>No se han encontrado más comentarios</aside>";
		skip=$("#vermascomentarios").remove();
	}
	$("#resultadoscomentarios").append(texto);
	skip=$("#vermascomentariossala").attr("data-skip");
	skip=parseInt(skip);
	skip=skip+2;
	skip=$("#vermascomentariossala").attr("data-skip", skip);
	//a los nuevos comentarios establecerles la funcion de borrar
	$(".borrarcomentariosala").on("click", borrarComentarioSala);
	//a las nuevas respuestas poder eliminarlas
	$(".borrarrespuestasala").on("click", borrarRespuestaSala);
	//efecto de mostrar el formulario cuando se clicka en el icono de responder el comentario
	$('.respondercomentario').on("click", mostrarResponder);
	//enviar respuesta de un comentario
	$(".formrespuestadebate").on("submit", enviarRespuestaComentario);
}

function guardarInfoPerfil(){
	usuario=$("#usuario").val();
	email=$("#email").val();
	loc=$("#localizacion").val();
	sexo=$("#sexo").val();
	if(!usuario || !email)
	{
		$(".datosperfil .error").html("");
		error="<aside class='error'>Rellene los campos obligatorios marcados por *</aside>";
		$(".datosperfil").prepend(error);
	}else{
		if(validarEmail(email)){
			emailantiguo=$("#emailantiguo").val();
			usuarioantiguo=$("#usuarioantiguo").val();
			socket.emit("editarPerfil", email, emailantiguo, usuario, usuarioantiguo, loc, sexo);
		}else{
			$(".datosperfil .error").html("");
			error="<aside class='error'>El mail debe ser válido</aside>";
			$(".datosperfil").prepend(error);
		}
			
	}
}

function guardarInfoGustos(){
	usuario=$("#usuario").val();
	marcados=$('#gustos:checked');
	gustos=[];
	marcados.each(function (){
		gustos.push($(this).val());
	});
	socket.emit("editarPerfilGustos", gustos, usuario);
}

function perfilGuardado(){
	$(".datosperfil .error").html("");
	$(".datosperfil .guardado").html("");
	guardado="<aside class='guardado'>Tus datos se han actualizado correctamente</aside>";
	$(".datosperfil").prepend(guardado);
}

function gustosGuardados(){
	$(".datosgustos .error").html("");
	$(".datosgustos .guardado").html("");
	guardado="<aside class='guardado'>Tus datos se han actualizado correctamente</aside>";
	$(".datosgustos").prepend(guardado);
}

function errorEmailPerfil(){
	$(".datosperfil .error").html("");
	errorEmail="<aside class='error'>El email ya esta en uso</aside>";
	$(".datosperfil").prepend(errorEmail);
}

function errorUsuarioPerfil(){
	$(".datosperfil .error").html("");
	errorEmail="<aside class='error'>El usuario ya esta en uso</aside>";
	$(".datosperfil").prepend(errorEmail);
}

function verMasNotificaciones(){
	skip=$(this).attr('data-skip');
	id_salas=$(this).attr('data-salas');
	socket.emit("verMasNotificaciones", id_salas, skip);
}

function mostrarMasNotificaciones(notificaciones){
	texto="";
	if(notificaciones.length>0)
	{
		for(i=0;i<notificaciones.length;i++)
		{
			texto+="";
			texto+="<section class='notificacioninicio'>";
				texto+="<span class='nombresala'>";
				texto+="<a href='"+notificaciones[i].url+"', title='"+notificaciones[i].nombreSala+"', alt='"+notificaciones[i].nombreSala+"'>"+notificaciones[i]["nombreSala"]+"</a>";
				texto+="</span>";
				texto+="<span class='accion'>";
					texto+="<span class='tipo'>";
						texto+="<span aria-hidden='true', class='"+notificaciones[i].span+" tiponotificacion'></span>";
					texto+="</span>";
					texto+="<span class='infonotificacion'>";
						if(notificaciones[i]["usuario"])
						{
							texto+="<span class='usu'>"+notificaciones[i]["usuario"]["usuario"]+" </span>";
						}else{
							texto+="<span class='usu'>Desconocido </span>";
						}				
						texto+="<span class='acto'>"+notificaciones[i]["accion"]+"</span>";
						texto+="<span class='textonotificacion'>\""+notificaciones[i]["texto"]+"\"</span>";
					texto+="</span>";
				texto+="</span>";
			texto+="</section>";
		}	
	}else{
		texto+="<aside class='noresultados'>No se han encontrado más notificaciones</aside>";
		skip=$("#vermasnot").remove();
	}
	$("#masnotificaciones").append(texto);
	skip=$("#vermasnot").attr("data-skip");
	skip=parseInt(skip);
	skip=skip+3;
	skip=$("#vermasnot").attr("data-skip", skip);
}

function borrarComentarioSala(){
	comentario=$(this).attr('data-comentario');
	socket.emit('borrarComentarioSala', comentario);
}

function borrarRespuestaSala(){
	comentario=$(this).attr('data-comentario');
	usuario=$(this).attr('data-usuario');
	respuesta=$(this).attr('data-respuesta');
	socket.emit('borrarRespuestaSala', comentario, usuario, respuesta);
}

function borrarComentarioLibro(){
	comentario=$(this).attr('data-comentario');
	usuario=$(this).attr('data-usuario');
	libro=$(this).attr('data-libro');
	socket.emit('borrarComentarioLibro', comentario, usuario, libro);
}

function mostrarDescripcionLarga(){
	mostrar={display: "block"};
	ocultar={display: "none"};
	$("#descripcioncorta").css(ocultar);
	$("#descripcionlarga").css(mostrar);
}

function cerrarAyuda(){
	ocultar={display: "none"};
	$(".usodraggable").css(ocultar);
}

function cambiarImagenPerfil(){
	imagenActual=$(".imagenactualusuario").attr('data-imagen');
	imagenNueva=$(this).attr('data-imagen');
	usuario=$(this).attr('data-usuario');
	idImagen=$(this).attr('id');
	socket.emit('cambiarImagenPerfil',imagenActual, imagenNueva, usuario, idImagen);
}

function imagenPerfilCambiada(imagenActual, imagenNueva, idImagen){
	$(".imagenactualusuario").attr("src", "/images/"+imagenNueva);
	$(".imagenactualusuario").attr("data-imagen", imagenNueva);
	$("#"+idImagen).attr("src", "/images/"+imagenActual);
	$("#"+idImagen).attr("data-imagen", imagenActual);

}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function validarEmail(email) { 
    // creamos nuestra regla con expresiones regulares.
        var filtro = /[\w-\.]{3,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/;
        // utilizamos test para comprobar si el parametro valor cumple la regla
        if(filtro.test(email))
            return true;
        else
            return false;
} 