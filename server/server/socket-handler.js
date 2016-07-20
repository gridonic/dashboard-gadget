'use strict';
var graphic = require('./graphic.js');

function socketHandler (Db) {

    // Functions
    var loadUser;

    // On-functions
    var onArduinoLogout;
    var onButtonLeftPushed;
    var onButtonRightPushed;
    var onButtonsPushed;
    var onCreateUser;
    var onDisconnect;
    var onError;
    var onHelloWorld;
    var onLogin;
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
        socket = s;
    };

    this.onArduinoLogout = function (data) { return onArduinoLogout(data); };
    this.onButtonLeftPushed = function (data) { return onButtonLeftPushed(data); };
    this.onButtonRightPushed = function (data) { return onButtonRightPushed(data); };
    this.onButtonsPushed = function (data) { return onButtonsPushed(data); };
    this.onCreateUser = function (data) { return onCreateUser(data); };
    this.onDisconnect = function (data) { return onDisconnect(data); };
    this.onError = function (data) { return onError(data); };
    this.onHelloWorld = function (data) { return onHelloWorld(data); };
    this.onLogin = function (data) { return onLogin(data); };
    this.onLoginUser = function (data) { return onLoginUser(data); };
    this.onSuccess = function (data) { return onSuccess(data); };
    this.onUpdateMood = function (data) { return onUpdateMood(data);};

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

    onButtonLeftPushed = function (data) {
        console.log('left pushed');
        console.log(data);
    };

    onButtonRightPushed = function (data) {
        console.log('right pushed');
        console.log(data);
    };

    onButtonsPushed = function (data) {
        console.log('both pushed');
        console.log(data);
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
            Db.activateGadget(data.id);
            Db.linkGadgetToSocket(socket.id, data.id);
            
        } else {
            socket.emit('sendError', {
                'message': 'You have to send your "id".'
            });
        }
    };
    
    onArduinoLogout = function (data) {
        console.log('socketLOGOUT');
        console.log(data);
        
        if(socket.id !== '') {
            Db.getGadgetIdToConnection(socket.id);
        } else {
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
        Db.loginUser(data.username, data.password, data.gadget, function (error) {
            console.log('error');
            console.log(error);
        }, function (success) {
            console.log(success);
        });
    };

    onUpdateMood = function (data) {
        console.log('--------dataname mood  ' + data.name);
        Db.changeMood(data.name, data.currentMood);
        console.log(data.name + '   ' + data.currentMood);
        console.log('mood changed');
    };

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
