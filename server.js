var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var adminFunctions = require('./server/controllers/adminFunctions.js');
var formFunctions = require('./server/controllers/formFunctions.js');
var validator = require('validator');

var app = express();

app.use(bodyParser.json());
app.use('/app', express.static(__dirname + "/app" ));
app.use('/admin', express.static(__dirname + "/admin" ));
app.use('/node_modules',express.static(__dirname + "/node_modules" ))



app.get('/', function(req, res){
    res.sendfile('index.html');
});

app.get('/admin', function(req, res){
    res.sendfile('admin/admin.html');
});



//Autenticacao de administradores
app.post('/api/admin/login', adminFunctions.login);

//adicionar novo motivo de contato
app.post('/api/admin/adicionar', adminFunctions.add);

//remover motivo de contato
app.post('/api/admin/remover', adminFunctions.remove);
	
//exibe registros de collections determinada
app.post('/api/consulta', adminFunctions.consulta);

//requisicao de formulario de contato
app.get('/api/contato', formFunctions.getOptions);

//registro de contato
app.post('/api/registro', formFunctions.registro);





app.listen('3000', function (){
    console.log("Listening for Local Host 3000");
});
