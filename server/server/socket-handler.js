'use strict';
var graphic = require('./module/graphic.js');

function socketHandler (Handler) {

    // Functions
    var loadUser;
    var handleNewUserApps;

    // On-functions
    var onActivateApp;
    var onArduinoButtonsPushed;
    var onButtonsPushed;
    var onCreateUser;
    var onDeactivateApp;
    var onDisconnect;
    var onError;
    var onHeartbeat;
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
    var showDisplay;

    // Variables
    var Graphic = new graphic();
    var socket = null;
    var helloed = false;
    var currentApp = null;

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.setSocket = function (s) {
        Handler.addSocketConnection(s.id);
        socket = s;
    };

    this.onActivateApp = function (data) { return onActivateApp(data); };
    this.onArduinoButtonsPushed = function (data) { return onArduinoButtonsPushed(data); };
    this.onArduinoLogout = function (data) { return onLogoutGadget(data); };
    this.onButtonsPushed = function (data) { return onButtonsPushed(data); };
    this.onCreateUser = function (data) { return onCreateUser(data); };
    this.onDeactivateApp = function (data) { return onDeactivateApp(data); };
    this.onDisconnect = function (data) { return onDisconnect(data); };
    this.onError = function (data) { return onError(data); };
    this.onHeartbeat = function (data) { return onHeartbeat(data); };
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

    showDisplay = function (workTime, updateTime, project, mood, currentDisplay, menu, app) {
        var time = 150;

        if (app !== null) {
            currentApp = app;
        }
        socket.emit('showDisplay', {});

        setTimeout(function () {
            if (updateTime && workTime !== null) {
                socket.emit('showWorkTime', {draw: Graphic.getWorktimeDisplay(workTime)});
            }
        }, time);

        setTimeout(function () {
            if (updateTime) {
                socket.emit('showTime', {draw: Graphic.getActualTimeDisplay()});
            }
        }, time * 2);

        setTimeout(function () {
            if (menu !== null) {
                // Display the menu on the display.
                socket.emit('showMenu', {draw: Graphic.getMenu(menu)});
            }
        }, time * 3);

        setTimeout(function () {
            if (currentDisplay !== null) {
                // Display the current App, Poll or something else.
                socket.emit('showMainDisplay', {draw: currentDisplay});
            }
        }, time * 4);

        setTimeout(function () {
            if (updateTime && mood !== null) {
                // console.log('send mood to gadget');
                // console.log(mood);
                socket.emit('showMood', {color: mood});
            } else if (updateTime) {
                // console.log('send null-mood to gadget');
                // socket.emit('showMood', {color: null});
            }
        }, time * 5);

        setTimeout(function () {
            if (updateTime && project !== null) {
                // console.log('send project to gadget');
                // console.log(project.color);
                socket.emit('showProject', {color: project.color});
            } else if (updateTime) {
                // console.log('send null-project to gadget');
                // socket.emit('showProject', {color: null});
            }
        }, time * 6);
    };

    onActivateApp = function (data) {
        console.log('onActivateApp');
        console.log(data);

        Handler.changeUserApp(Handler.APP_ACTIVATE, data.user, data.token, data.appId, data.appSettings, handleNewUserApps);
    };

    onArduinoButtonsPushed = function (data) {
        var newData = {};

        Handler.stopDisplaying();

        if (data.buttons === 'r') {
            newData.right = true;
        } else if (data.buttons === 'p-r') {
            newData.right = true;
            newData.screen = 'pollToAnswer';
        } else if (data.buttons === 'l') {
            newData.left = true;
        } else if (data.buttons === 'p-l') {
            newData.left = true;
            newData.screen = 'pollToAnswer';
        } else if (data.buttons === 'b') {
            newData.left = true;
            newData.right = true;
        }

        onButtonsPushed(newData);
    };

    onButtonsPushed = function (data) {

        Handler.stopDisplaying();

        // if (data.screen === 'pollToAnswer') {
        //     if (data.right) {
        //         Handler.updatePoll(socket, socket.id, data.type, true);
        //         console.log(socket.id + ' answered with YES');
        //     } else {
        //         Handler.updatePoll(socket, socket.id, data.type, false);
        //         console.log(socket.id + ' answered with NO');
        //     }
        // } else {
        console.log('buttons pushed');

            if (data.left && data.right) {
                console.log('both');

                if (currentApp && currentApp.poll) {
                    Handler.activatedAppSelected(currentApp, socket.id, showDisplay);
                } else if (currentApp !== null) {
                    Handler.activateApp(currentApp, socket.id, showDisplay);
                    console.log('do action of app ' + currentApp);
                } else {
                    console.log('do something after both buttons was pushed.');
                }
            } else if (data.left) {
                console.log('left');

                if (currentApp && currentApp.poll) {
                    Handler.switchPoll('left', socket.id, showDisplay);
                } else if (currentApp && currentApp.decision) {
                    Handler.resetPoll();
                    Handler.setupDisplayForArduino(socket.id, showDisplay);
                } else {
                    Handler.switchApp('left', socket.id, showDisplay);
                }
            } else if (data.right) {
                console.log('right');

                if (currentApp && currentApp.poll) {
                    Handler.switchPoll('right', socket.id, showDisplay);
                } else if (currentApp && currentApp.decision) {
                    // todo beni: hier muss die poll an die weiteren gadgets geschickt werden.
                    console.log('-----------------------------------------------------');
                    console.log('beni: hier poll an weitere gadgets schicken.');
                    console.log(currentApp.type);
                    console.log('-----------------------------------------------------');
                    Handler.resetPoll();
                    Handler.setupDisplayForArduino(socket.id, showDisplay);
                } else {
                    Handler.switchApp('right', socket.id, showDisplay);
                }
            }
            // console.log(data);

        // }

    };

    onDeactivateApp = function (data) {
        console.log('onDeactivateApp');
        console.log(data);

        Handler.changeUserApp(Handler.APP_DEACTIVATE, data.user, data.token, data.appId, null, handleNewUserApps);
    };

    onHeartbeat = function (data) {
        console.log('heartbeat ' + data.number);
        socket.emit('heartbeatAnswer', {number: (parseInt(data.number) + 1).toString()});

        if (Handler.isDisplayPaused()) {
            Handler.setupDisplayForArduino(socket.id, showDisplay);
        }
    };

    onHello = function (data) {
        console.log('socketHELLO');
        console.log(data);

        socket.emit('showWhite', {data: null});
        // var i = 0;

        if (helloed) {
            console.log('--------------------------------');
            console.log('start the display now.');
            console.log('--------------------------------');
            Handler.setupDisplayForArduino(socket.id, showDisplay);
        }

        helloed = true;
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
        Handler.changeMood(socket.id, data.currentMood, function () {
            Handler.setupDisplayForArduino(socket.id, showDisplay);
        });
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
        helloed = false;
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
