'use strict';
var graphic = require('./graphic.js');

function socketHandler (Db) {

    // Functions
    var loadUser;

    // On-functions
    var onLogoutGadget;
    var onButtonsPushed;
    var onCreateUser;
    var onDisconnect;
    var onError;
    var onHello;
    var onLoginGadget;
    var onLoginUser;
    var onSuccess;
    var onUpdateMood;

    // Variables
    var Graphic = new graphic();
    var socket = null;

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.setSocket = function (s) {
        Db.addSocketConnection(s.id);
        socket = s;
    };

    this.onArduinoLogout = function (data) { return onLogoutGadget(data); };
    this.onButtonsPushed = function (data) { return onButtonsPushed(data); };
    this.onCreateUser = function (data) { return onCreateUser(data); };
    this.onDisconnect = function (data) { return onDisconnect(data); };
    this.onError = function (data) { return onError(data); };
    this.onHello = function (data) { return onHello(data); };
    this.onLoginGadget = function (data) { return onLoginGadget(data); };
    this.onLoginUser = function (data) { return onLoginUser(data); };
    this.onSuccess = function (data) { return onSuccess(data); };
    this.onUpdateMood = function (data) { return onUpdateMood(data);};

    /* ======================================================================
     * Private functions
     * ====================================================================== */
    
    loadUser = function (data) {
        Db.getUser(data.username, data.password, function (user) {
            if (user) {
                Db.addUserConnection(socket.id, user.id);
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

    onButtonsPushed = function (data) {
        console.log('buttons pushed');
        if (data.left && data.right) {
            console.log('both');
        } else if (data.left) {
            console.log('left');
        } else if (data.right) {
            console.log('right');
        }
        console.log(data);
    };

    onHello = function (data) {
        console.log('socketHELLO');
        console.log(data);

        if (data == 'full graphic' || data.message == 'full graphic') {
            socket.emit('show', { draw: Graphic.getLogo() });
        } else {
            socket.emit('show', {draw: '111111110000000011111111'});
        }

        setTimeout(function () {
            var interval = setInterval(function(){ showTime() }, 100);
            var i = 0;

            function showTime() {
                if (i > 120) {
                    clearInterval(interval);
                }
                socket.emit('show', { draw: Graphic.getDefaultDisplay(null, i, null)});
                i++;
            }
        }, 3000);
    };

    onLoginGadget = function (data) {
        console.log('socketLOGIN');
        console.log(data);

        if (data.id !== '') {
            Db.activateGadget(data.id);
            Db.linkGadgetToSocket(socket.id, data.id);
            socket.emit('access', null);
        } else {
            socket.emit('sendError', {
                'message': 'You have to send your "id".'
            });
        }
    };
    
    onLogoutGadget = function (data) {
        console.log('socketLOGOUT');

        if (socket.id !== '') {
            console.log('socket-handler socket id:   ' + socket.id);
            Db.removeConnection(socket.id);
        } else {
            console.log('socket id not found.')
            console.log(socket);
            socket.emit('sendError', {
                'message': 'No open socket found.'
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
        Db.loginUser(data.username, data.password, data.gadget, socket.id, function (error) {
            console.log('error');
            console.log(error);
        }, function (success) {
            console.log(success);
        });
    };

    onUpdateMood = function (data) {
        Db.changeMood(socket.id, data.currentMood);
        console.log('--------testabfrage:  ' + socket.id + '  und  ' + data.currentMood);
    };

    onDisconnect = function (data) {
        console.log('socketDISCONNECT');
        console.log('disconnect client');

        Db.removeConnection(socket.id);
        console.log(socket.id);
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
