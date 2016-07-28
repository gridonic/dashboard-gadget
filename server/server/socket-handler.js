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
    var onSuccess;
    var onUpdateMood;
    var onStartPoll;

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
    this.onSuccess = function (data) { return onSuccess(data); };
    this.onUpdateMood = function (data) { return onUpdateMood(data);};
    this.onStartPoll = function (data) { return onStartPoll(data);};

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

        socket.emit('showBlack', {data: null});
        var i = 0;

        socket.emit('showWorkTime', { draw: Graphic.getWorktimeDisplay(i)});
        setTimeout(function () {
            socket.emit('showTime', { draw: Graphic.getActualTimeDisplay()});
        }, 100);
        i++;

        setInterval(function () {
            socket.emit('showWorkTime', { draw: Graphic.getWorktimeDisplay(i)});

            setTimeout(function () {
                socket.emit('showTime', { draw: Graphic.getActualTimeDisplay()});
            }, 100);

            i++;
        }, 60000);

        // setTimeout(function () {
        //     socket.emit('showWhite', {data: null});
        // }, 1000);
        //
        // setTimeout(function () {
        //     //     // var graphic = Graphic.getDefaultDisplay(null, 40, null);
        //     var graphic = Graphic.getWorktimeDisplay(0);
        //
        //     console.log('socket.emit("showTime")');
        //     console.log(graphic);
        //
        //     socket.emit('showWorkTime', { draw: graphic });
        // }, 5000);
        //
        // setTimeout(function () {
        //     //     // var graphic = Graphic.getDefaultDisplay(null, 40, null);
        //     var graphic = Graphic.getWorktimeDisplay(50);
        //
        //     console.log('socket.emit("showTime")');
        //     console.log(graphic);
        //
        //     socket.emit('showWorkTime', { draw: graphic });
        // }, 10000);
        //
        // setTimeout(function () {
        //     //     // var graphic = Graphic.getDefaultDisplay(null, 40, null);
        //     var graphic = Graphic.getWorktimeDisplay(120);
        //
        //     console.log('socket.emit("showTime")');
        //     console.log(graphic);
        //
        //     socket.emit('showWorkTime', { draw: graphic });
        // }, 15000);

        // setTimeout(function () {
        //     var interval = setInterval(function(){ showTime() }, 2000);
        //     var i = 0;
        //
        //     function showTime() {
        //         if (i > 120) {
        //             clearInterval(interval);
        //         }
        //         console.log('socket.emit("show")');
        //         socket.emit('show', { draw: Graphic.getDefaultDisplay(null, i, null)});
        //         i = i+10;
        //     }
        // }, 3000);
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
        Handler.loginUser(data.username, data.password, data.gadget, socket.id, function (error) {
            console.log('error');
            console.log(error);
        }, function (success) {
            console.log(success);
        });
    };

    onLogoutUser = function () {
        Handler.removeConnection(socket.id);
    };

    onUpdateMood = function (data) {
        Handler.changeMood(socket.id, data.currentMood);
    };
    
    onStartPoll = function (data) {
        Handler.startPoll(socket.id, data.type);
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
