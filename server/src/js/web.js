console.log('web.js found.');

// Functions
var handleStart;
var handleCreate;
var handleSuccess;
var handleError;
var log;

// Constants
var WAITING_DEFAULT = 0;
var WAITING_CREATE_USER = 1;

// Variables
var socket = io();
var start = document.getElementById('btn-start');
var create = document.getElementById('btn-create');
var canvas = document.getElementById("display");
var context;
var actualWaiting = WAITING_DEFAULT;

if (canvas !== null) {
    context = canvas.getContext("2d");
}

log = function (message) {
    console.log(message);
    
    var output = document.getElementById('console-output');
    if (output) {
        output.innerHTML = output.innerHTML + '<br>' + message;
    }
};

/**
 * Handle the Start-Button.
 * Simulates the login on the server via an arduino.
 */
handleStart = function () {

    if (start === null) {
        return;
    }

    start.onclick = function () {
        var id = document.getElementById('input-id').value;
        log('simulate the "login" with id: ' + id);
        socket.emit('login', {'id': id});
    };
};

/**
 * Handle the Create-Button.
 * Creates a User on the server.
 */
handleCreate = function () {

    if (create === null) {
        log('no create-button found.');
        return;
    }

    create.onclick = function () {
        var username = document.getElementById('input-username').value;
        var password = document.getElementById('input-password').value;

        socket.emit('createUser', {'username': username, 'password': password});

        // wait till user is created.
        actualWaiting = WAITING_CREATE_USER;
    };
};

handleError = function (data) {
    log('FEHLER!');
    log(data);

    switch (actualWaiting) {
        case WAITING_CREATE_USER:
            log('output: ' + data.message);
            actualWaiting = WAITING_DEFAULT;
            break;
        default:
            log('no output, not waiting for something.');
    }
};


// Todo Sollte nur im Notfall aufgerufen werden, alle default-success sollten direkt adressiert sein.
handleSuccess = function (data) {
    log('SUCCESS!');
    log(data);

    switch (actualWaiting) {
        default:
            log('no output, not waiting for something.');
    }
};

// TODO: Adressen hier, die funktionen an sich in externes File auslagern.

socket.on('show', function (data) {
    log(data);

    if (data.draw) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, 160, 160);

        context.fillStyle = "#000000";
        var draw = data.draw.split("");
        var x = 0;
        for (var i = 0; i < 160; i++) {
            for (var j = 0; j < 160; j++) {
                if (draw[x] === '1') {
                    context.fillRect(j, i, 1, 1);
                }
                x++;
            }
        }

    }
});

socket.on('access', function (data) {
    socket.emit('hello-world', {'message': 'full graphic'});
});

socket.on('sendError', function (data) {
    handleError(data);
});

socket.on('sendSuccess', function (data) {
    handleSuccess(data);
});

socket.on('userCreated', function (data) {
    log('user created successfully');
    log('output: ' + data.message);
    log(data.user);

    // reset waiting
    actualWaiting = WAITING_DEFAULT;
});


// Start own functions.
handleStart();
handleCreate();

