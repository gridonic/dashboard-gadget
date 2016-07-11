'use strict';
var graphic = require('./graphic.js');

function socketHandler (Db) {

    // functions
    var loadUser;
    var onHelloWorld;
    var onLogin;
    var onCreateUser;
    var onLoginUser;
    var onDisconnect;
    var onError;
    var onSuccess;
    
    // variables
    var Graphic = new graphic();
    var socket = null;

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.setSocket = function (s) {
        socket = s;
    };
    this.onHelloWorld = function (data) { return onHelloWorld(data); };
    this.onLogin = function (data) { return onLogin(data); };
    this.onCreateUser = function (data) { return onCreateUser(data); };
    this.onLoginUser = function (data) { return onLoginUser(data); };
    this.onDisconnect = function (data) { return onDisconnect(data); };
    this.onError = function (data) { return onError(data); };
    this.onSuccess = function (data) { return onSuccess(data); };

    /* ======================================================================
     * Private functions
     * ====================================================================== */
    
    loadUser = function (data) {
        Db.getUser(data.username, data.password, function (user) {
            if (user) {
                socket.emit('userCreated', {
                    'message': 'The user "' + data.username + '" was successfully created!',
                    'user': user
                });
            } else {
                socket.emit('sendError', {
                    'message': 'The user could not be created.'
                });
            }
        });
    };

    onHelloWorld = function (data) {
        console.log('socketHELLO');
        console.log(data);

        if (data == 'full graphic' || data.message == 'full graphic') {
            socket.emit('show', { draw: Graphic.getLogo() });
        } else {
            socket.emit('show', {draw: '111111110000000011111111'});
        }
    };

    onLogin = function (data) {
        console.log('socketLOGIN');
        console.log(data);

        if (data.id !== '') {
            socket.emit('access', null);
        } else {
            socket.emit('sendError', {
                'message': 'You have to send your "id".'
            });
        }
    };

    onCreateUser = function (data) {
        console.log('socketCreateUser');
        console.log(data);

        Db.createUser(data.username, data.password, function (created) {
            if (created) {
                console.log('user created');
                loadUser(data);
            } else {
                console.log('username found! - return false!');
                socket.emit('sendError', {'message': 'The username "' + data.username + '" already exists!'});
            }
        });
    };
    
    onLoginUser = function (data) {
        Db.loginUser(data.username, data.password);
    }

    onDisconnect = function (data) {
        console.log('socketDISCONNECT');
        console.log('disconnect user');
    };

    onError = function (data) {
        console.log("error on socket.");
        console.log(data.message);
    };

    onSuccess = function (data) {
        console.log("success on socket.");
        console.log(data.message);
    };
    
}

module.exports = socketHandler;
