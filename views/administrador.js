doctype 5
html
	head
		title= title
		meta(charset='utf-8')
		link(rel='stylesheet', href='/stylesheets/normalize.css')
		link(rel='stylesheet', href='/stylesheets/index.css')
	body
		h1 #{title}
		section
			form(action='/login-admin', id='formlogin', method='post')
				input(type='text', name='usuariologin', id='usuariologin', class='input', placeholder='Nombre de usuario')
				br
				input(type='password', name='passlogin', id='passlogin', class='input', placeholder='Contraseña')
				br
				input(type='submit', class='enviar', value='Entrar')