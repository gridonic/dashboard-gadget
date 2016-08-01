'use strict';
var graphic = require('./graphic.js');

function socketHandler (Handler) {

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
    var onLogoutUser;
    var onSaveUserSettings;
    var onSuccess;
    var onUpdateMood;
    var onStartPoll;
    var onSendPoll;

    // Variables
    var Graphic = new graphic();
    var socket = null;

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.setSocket = function (s) {
        Handler.addSocketConnection(s.id);
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
    this.onLogoutUser = function() { return onLogoutUser();};
    this.onSaveUserSettings = function (data) { return onSaveUserSettings(data); };
    this.onSuccess = function (data) { return onSuccess(data); };
    this.onUpdateMood = function (data) { return onUpdateMood(data);};
    this.onStartPoll = function (data) { return onStartPoll(data);};
    this.onSendPoll = function (data) { return onSendPoll(data);};

    /* ======================================================================
     * Private functions
     * ====================================================================== */
    
    loadUser = function (data) {
        Handler.getUser(data.username, data.password, function (user) {
            if (user) {
                Handler.addUserConnection(socket.id, user.id);
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
        if (data.screen === 'pollToAnswer') {
            if (data.right) {
                Handler.updatePoll(socket, socket.id, data.type, true);
                log(socket.id + ' answered with YES');
            } else {
                Handler.updatePoll(socket, socket.id, data.type, false);
                log(socket.id + ' answered with NO');
            }
        } else {
            console.log('buttons pushed');
            if (data.left && data.right) {
                console.log('both');
            } else if (data.left) {
                console.log('left');
            } else if (data.right) {
                console.log('right');
            }
            console.log(data);

        }

    };

    onHello = function (data) {
        console.log('socketHELLO');
        console.log(data);

        socket.emit('showBlack', {data: null});
        // var i = 0;

        Handler.setupDisplayForArduino(socket.id, function (workTime, project) {
            if (workTime !== null) {
                socket.emit('showWorkTime', {draw: Graphic.getWorktimeDisplay(workTime)});
            }

            setTimeout(function () {
                socket.emit('showTime', { draw: Graphic.getActualTimeDisplay() });
            }, 100);

            setTimeout(function () {

                if (project !== null) {
                    // todo!
                    console.log('send project to gadget');
                    console.log(project);
                }
            }, 200);
        });
    };

    onLoginGadget = function (data) {
        console.log('socketLOGIN');
        console.log(data);

        if (data.id !== '') {
            Handler.activateGadget(data.id);
            Handler.linkGadgetToSocket(socket.id, data.id);
            socket.emit('access', null);
        } else {
            socket.emit('sendError', {
                'message': 'You have to send your "id".'
            });
        }
    };
    
    onLogoutGadget = function () {
        console.log('socketLOGOUT');

        if (socket.id !== '') {
            console.log('socket-handler socket id:   ' + socket.id);
            Handler.removeConnection(socket.id);
        } else {
            console.log('socket id not found.');
            console.log(socket);
            socket.emit('sendError', {
                'message': 'No open socket found.'
            });
        }
    };

    onCreateUser = function (data) {
        console.log('socketCreateUser');
        console.log(data);

        Handler.createUser(data.username, data.password, function (created) {
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
        Handler.loginUser(data.username, data.password, data.gadget, socket.id, function (loggedIn, result) {
            if (loggedIn) {
                console.log('success');
                console.log(result);
                socket.emit('userLoggedIn', result);
            } else {
                console.log('an error occured, login not possible.');
                if (result && result.message) {
                    console.log(result.message);
                    socket.emit('sendError', {message: 'Login not possible: ' + result.message});
                } else {
                    socket.emit('sendError', {message: 'Login not possible.'});
                }
            }
        });
    };

    onLogoutUser = function () {
        Handler.removeConnection(socket.id);
    };

    onUpdateMood = function (data) {
        Handler.changeMood(socket.id, data.currentMood);
    };

    onSaveUserSettings = function (data) {
        Handler.saveUserSettings(data.token, data.username, data.settings, function (settings) {
            if (settings === false) {
                socket.emit('sendError', {message: 'Couldn\'t save the settings.'});
            } else {
                socket.emit('userSettings', settings);
            }
        });
    };
    
    onStartPoll = function (data) {
        Handler.createPoll(socket.id, data.type, socket);

    };
    
    onSendPoll = function (data) {
        
    };

    onDisconnect = function (data) {
        console.log('socketDISCONNECT');
        console.log('disconnect client');

        Handler.removeConnection(socket.id);
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
