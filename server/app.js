var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var connection = require('./server/connection.js');
var graphic = require('./server/graphic.js');

var Connection = new connection();
var Graphic = new graphic();



app.get('/', function(req, res){

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

io.on('connection', function (socket) {
    console.log('connection has started. ' + 'id: ' + socket.id);

    Connection.add(socket.id);

    socket.on('login', function (data) {
        console.log('socketLOGIN');
        console.log(data);

        if (data.id !== '') {
            socket.emit('hello', {
                hello: 'world',
                draw: Graphic.getLogo()
            });
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