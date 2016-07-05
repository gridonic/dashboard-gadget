var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var connection = require('./server/connection.js');
var db = require('./server/db.js');
var socketHandler = require('./server/socket-handler.js');

var Connection = new connection();
var Db = new db();
var SocketHandler = new socketHandler(Db);


app.get('/', function (req, res) {

    console.log('connection on "/"');

    if (req.query.html && req.query.html === '1') {
        // for testing, use the index.html. Go to http://localhost:3000?html=1 for seeing this.
        res.sendFile(__dirname + '/templates/index.html');
    } else {
        // else, send out json-files.
        res.send({
            'app': '',
            'id': '21'
        });
    }
});

app.get('/test', function (req, res) {

    console.log('connection on "/test".');

    res.send({
        'abc': '123',
        'def': '456'
    });
});

app.get('/helper', function (req, res){
    res.sendFile(__dirname + '/templates/image-helper.html');
});

app.get('*', function (req, res) {
    console.log('connection on "/*"');
    res.send("a * request.");
});

app.all('*', function (req, res) {
    console.log('connection on ALL "/*".');
    res.send("a */* request.");
});

io.on('connection', function (socket) {

    SocketHandler.setSocket(socket);

    console.log('connection has started. ' + 'id: ' + socket.id);
    Connection.add(socket.id);

    socket.on('hello-world', function (message) {
        SocketHandler.onHelloWorld(message);
    });

    socket.on('login', function (data) {
        SocketHandler.onLogin(data);
    });

    socket.on('createUser', function (data) {
        SocketHandler.onCreateUser(data);
    });

    socket.on('disconnect', function() {
        SocketHandler.onDisconnect();
    });

    socket.on('error', function (error) {
        SocketHandler.onError(error);
    });

    socket.on('success', function (data) {
        SocketHandler.onSuccess(data);
        Connection.delete(socket.id);
    });
});

http.listen(3000, function() {
    console.log('');
    console.log('=================================================================');
    console.log('||   listening to              http://localhost:3000           ||');
    console.log('||   test-interface under      http://localhost:3000/?html=1   ||');
    console.log('||   mongodb should run on     http://localhost:9999           ||');
    console.log('=================================================================');
    console.log('');
});

