var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var connection = require('./server/connection.js');
var graphic = require('./server/graphic.js');

var Connection = new connection();
var Graphic = new graphic();


// function handler (req, res) {
//     fs.readFile(__dirname + '/templates/index.html',
//         function (err, data) {
//             if (err) {
//                 res.writeHead(500);
//                 return res.end('Error loading index.html');
//             }
//
//             res.writeHead(200);
//             res.end(data);
//         });
// }

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
    console.log('connection has started. ' + 'id: ' + socket.id);

    Connection.add(socket.id);

    socket.on('hello-world', function (message) {
        console.log('socketHELLO');
        console.log(message);
        // socket.emit('show', { draw: Graphic.getLogo() });
        socket.emit('show', { draw: '111111110000000011111111' });
    });

    socket.on('login', function (data) {
        console.log('socketLOGIN');
        console.log(data);

        if (data.id !== '') {
            socket.emit('access', null);
        } else {
            socket.emit('send-error', {
                'message': 'You have to send your "id".'
            });
        }
    });

    socket.on('disconnect', function() {
        console.log('socketDISCONNECT');
        console.log('disconnect user');
        Connection.delete(socket.id);
    });
});

http.listen(3000, function(){
    console.log('==============================================================');
    console.log('||   listening to           http://localhost:3000           ||');
    console.log('||   test-interface under   http://localhost:3000/?html=1   ||');
    console.log('==============================================================');
    console.log('');
});