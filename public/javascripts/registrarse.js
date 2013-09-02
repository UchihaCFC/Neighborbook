var socket=io.connect('http://localhost:3000');
$(document).on('ready', inicio);
function inicio(){
	//emite registrarse para traer la base de datos
	socket.emit('registrarse');
	socket.on('listadoLibros', listarLibros);
	//validar usuario cuando pierda el foco
	$("#usuario").on("blur", validarUsuario);
	//el usuario ha sido validado mediante websockets
	socket.on('validarUsuario', clasesUsuario);
	//validar email cuando pierda el foco
	$("#email").on("blur", validarEmail);
	//el email ha sido validado mediante websockets
	socket.on('validarEmail', clasesEmail);
	//contraseña
	$("#pass").on("blur", validarPass);
}

function listarLibros(listado){
	libros=listado;
	$("#libro").autocomplete({
		minLength: 3,
	     source: function(request, response) {
	         var resultados = $.ui.autocomplete.filter(libros, request.term);
	         response(resultados);
	     }
	});
}

function validarUsuario(){
	socket.emit('validarUsuario', $("#usuario").val());
}

function clasesUsuario(valido){
	if(valido==1)
	{
		$("#usuario").css({border: "3px solid green"});
	}else{
		$("#usuario").attr("placeholder", "El usuario ya existe");
		$("#usuario").val("");
		$("#usuario").css({border: "3px solid red"});
	}
}

function validarEmail(){
	socket.emit('validarEmail', $("#email").val());
}

function clasesEmail(valido){
	if(valido==1)
	{
		$("#email").css({border: "3px solid green"});
	}else{
		$("#email").attr("placeholder", "El email ya esta asociado a otra cuenta");
		$("#email").val("");
		$("#email").css({border: "3px solid red"});
	}
}

function validarPass(){
	if($("#pass").val().length>6)
	{
		$("#pass").css({border: "3px solid green"});
	}else{
		$("#pass").attr("placeholder", "Debe tener mas de 6 carácteres");
		$("#pass").val("");
		$("#pass").css({border: "3px solid red"});
	}
}

