var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , path = require('path')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , mongoose =require('mongoose')
  , io = require('socket.io').listen(server)
  , nodemailer = require('nodemailer')
  , crypto = require('crypto');

server.listen(3000);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


//conexion base de datos mongo
mongoose.connect('mongodb://localhost/plataforma');


//esquemas mongo
var usuarios = require('./schemas/usuarios.js');
var libros=require('./schemas/libros.js');
var admin = require('./schemas/admin.js');
var salas = require('./schemas/salas.js');
var comentarios = require('./schemas/comentarios.js');
var notificaciones = require('./schemas/notificaciones.js');
var librosPropuestos =require('./schemas/librosPropuestos.js');

// rutas
var rutas = require('./routes/rutas.js');

//websockets
require('./sockets/sockets.js')(io,libros,usuarios,salas,comentarios,notificaciones, librosPropuestos);

//index
require('./routes/index')(app,rutas);

// Usuarios:
require('./routes/usuarios')(app, rutas, usuarios, libros, salas, crypto, nodemailer, notificaciones);

// Salas:
require('./routes/salas')(app, rutas, usuarios, libros, salas, crypto, nodemailer, comentarios, notificaciones, librosPropuestos);

//Biblioteca:
require('./routes/biblioteca')(app, rutas, usuarios, libros, salas);

//Libros
require('./routes/libros')(app, rutas, usuarios, libros, salas);

//Admin
require('./routes/admin')(app, rutas, admin, usuarios, libros, salas, librosPropuestos, notificaciones);

//reglas
require('./routes/reglas')(app, rutas, usuarios, libros, salas, notificaciones);

app.listen(app.get('port'), function() {
    console.log("Express server listening on port 3000");
});


