var rutas = {
	usuario: {
		login: '/login',
		recuperar: '/recuperar-contrasena',
		restablecerContrasena: '/restablecer-contrasena/:enlace',
		finalizarRestablecerContrasena: '/finalizar-restablecer-contrasena',
		registrarse: '/registrarse',
		finalizarRegistro: '/finalizar-registro',
		registroEnviado: '/registro-enviado',
		activarUsuario: '/activar-usuario/:enlace',
		salir: '/salir',
		inicio: '/inicio',
		perfil: '/perfil',
		baja: '/baja',
		confirmarBaja: '/confirmar-baja'
	},
	admin: {
		administrador: '/administrador',
		login: '/login-admin',
		panel: '/administrador/panel',
		salas: {
			listado: '/administrador/salas-virtuales',
			nueva: '/administrador/salas-virtuales/nueva',
			sala: '/administrador/salas-virtuales/:sala',
			establecerLibro: '/administrador/salas-virtuales/establecer'
		}
	},
	salas: {
		salasVirtuales:'/salas-virtuales',
		visitarSala: '/salas-virtuales/:sala',
		unirse: '/salas-virtuales/:sala/unirse',
		abandonar: '/salas-virtuales/:sala/abandonar',
		nuevoComentario:'/salas-virtuales/:sala/nuevo-comentario'
	},
	libros: {
		busqueda: '/busqueda',
		libro: '/libros/:id'
	},
	biblioteca:{
		biblioteca: '/biblioteca'
	},
	reglas:{
		reglas: '/reglas'
	}
}

module.exports = rutas;