var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var db = require('./server/db.js');
var socketHandler = require('./server/socket-handler.js');

var Db = new db();

app.get('/', function (req, res) {

    console.log('connection on "/"');

    if (req.header('user-agent').indexOf(' Chrome/')) {

        // If user-agent is chrome, load automatically the start.html template.
        res.sendFile(__dirname + '/templates/start.html');

    } else if (req.query.html && req.query.html === '1') {

        // If you want to see the start-template without user-agent Chrome, go to: http://localhost:3000?html=1
        res.sendFile(__dirname + '/templates/start.html');

    } else {

        // Else, send out json-files.
        res.send({
            'app': '',
            'id': '21'
        });
    }
});

app.get('/image-helper', function (req, res){
    res.sendFile(__dirname + '/templates/image-helper.html');
});

app.get('/simulator', function (req, res){
    res.sendFile(__dirname + '/templates/simulator.html');
});

app.get('/dashboard', function (req, res){
    res.sendFile(__dirname + '/templates/dashboard.html');
});

app.get('/assets/*', function (req, res){
    var split = req.originalUrl.split("/assets/");
    var file = split[1];
    res.sendFile(__dirname + '/web/' + file);
});

// app.get('*', function (req, res) {
//     console.log('connection on "/*"');
//     res.send("a * request.");
// });
//
// app.all('*', function (req, res) {
//     console.log('connection on ALL "/*".');
//     res.send("a */* request.");
// });

io.on('connection', function (socket) {

    var SocketHandler = new socketHandler(Db);
    SocketHandler.setSocket(socket);

    console.log('connection has started. ' + 'id: ' + socket.id);

    socket.on('hello', function (message) {
        SocketHandler.onHello(message);
    });

    socket.on('buttonsPushed', function (data) {
        SocketHandler.onButtonsPushed(data);
    });

    socket.on('loginGadget', function (data) {
        SocketHandler.onLoginGadget(data);
    });

    socket.on('logout', function (data) {
        SocketHandler.onArduinoLogout(data);
    });

    socket.on('createUser', function (data) {
        SocketHandler.onCreateUser(data);
    });

    socket.on('loginUser', function (data) {
        SocketHandler.onLoginUser(data);
    });
    
    socket.on('updateMood', function (data){
        SocketHandler.onUpdateMood(data);
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

