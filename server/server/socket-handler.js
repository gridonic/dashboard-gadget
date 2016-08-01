'use strict';
var graphic = require('./module/graphic.js');

function socketHandler (Handler) {

    // Functions
    var loadUser;
    var handleNewUserApps;

    // On-functions
    var onActivateApp;
    var onButtonsPushed;
    var onCreateUser;
    var onDeactivateApp;
    var onDisconnect;
    var onError;
    var onHello;
    var onLoginGadget;
    var onLoginUser;
    var onLogoutGadget;
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

    this.onActivateApp = function (data) { return onActivateApp(data); };
    this.onArduinoLogout = function (data) { return onLogoutGadget(data); };
    this.onButtonsPushed = function (data) { return onButtonsPushed(data); };
    this.onCreateUser = function (data) { return onCreateUser(data); };
    this.onDeactivateApp = function (data) { return onDeactivateApp(data); };
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

    handleNewUserApps = function (success, user) {
        if (success) {
            socket.emit('updateUserData', {user: user});
        } else {
            socket.emit('sendError', {
                message: 'The server could not update the apps and app-settings.'
            });
        }
    };

    onActivateApp = function (data) {
        console.log('onActivateApp');
        console.log(data);

        Handler.changeUserApp(Handler.APP_ACTIVATE, data.user, data.token, data.appId, data.appSettings, handleNewUserApps);
    };

    onButtonsPushed = function (data) {
        if (data.screen === 'pollToAnswer') {
            if (data.right) {
                Handler.updatePoll(socket, socket.id, data.type, true);
                console.log(socket.id + ' answered with YES');
            } else {
                Handler.updatePoll(socket, socket.id, data.type, false);
                console.log(socket.id + ' answered with NO');
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

    onDeactivateApp = function (data) {
        console.log('onDeactivateApp');
        console.log(data);

        Handler.changeUserApp(Handler.APP_DEACTIVATE, data.user, data.token, data.appId, null, handleNewUserApps);
    };

    onHello = function (data) {
        console.log('socketHELLO');
        console.log(data);

        socket.emit('showBlack', {data: null});
        // var i = 0;

        Handler.setupDisplayForArduino(socket.id, function (workTime, updateTime, project, currentDisplay, menu) {

            var time = 50;

            setTimeout(function () {
                if (workTime !== null) {
                    socket.emit('showWorkTime', {draw: Graphic.getWorktimeDisplay(workTime)});
                }
            }, 0);

            setTimeout(function () {
                if (updateTime) {
                    socket.emit('showTime', {draw: Graphic.getActualTimeDisplay()});
                }
            }, time);

            setTimeout(function () {

                if (project !== null) {
                    // todo: send project info to the arduino!
                    console.log('send project to gadget');
                    console.log(project);
                }
            }, time * 2);

            setTimeout(function () {
                if (currentDisplay !== null) {
                    // Display the current App, Poll or something else.
                    socket.emit('showMainDisplay', {draw: currentDisplay});
                }
            }, time * 3);

            setTimeout(function () {
                if (menu !== null) {
                    // Display the menu on the display.
                    socket.emit('showMenu', {draw: Graphic.getMenu(menu)});
                }
            }, time * 4);
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
