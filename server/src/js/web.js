console.log('web.js found.');

// Functions
var handleStart;
var handleArduinoLogout;
var handleButtons;
var handleCreate;
var handleLogin;
var handleUpdateMood;
var handleSuccess;
var handleError;
var bitToImage;
var log;

// Constants
var WAITING_DEFAULT = 0;
var WAITING_CREATE_USER = 1;

// Variables
var socket = io();
var start = document.getElementById('btn-start');
var arduinoLogout = document.getElementById('btn-arduinoLogout');
var arduinoLeftButton = document.getElementById('btn-arduino-left');
var arduinoRightButton = document.getElementById('btn-arduino-right');
var arduinoBothButton = document.getElementById('btn-arduino-both');
var create = document.getElementById('btn-create');
var login = document.getElementById('btn-login');
var canvas = document.getElementById("display");
var updateMood = document.getElementById('btn-update');
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

bitToImage = function (bitString) {
    var imageString = "";
    var bitStringArray = bitString.split('');
    var current;
    var numberString;
    var i = 0;
    var j;
    var hexChar = {
        A: '0000',
        B: '0001',
        C: '0010',
        D: '0011',
        E: '0100',
        F: '0101',
        G: '0110',
        H: '0111',
        I: '1000',
        J: '1001',
        K: '1010',
        L: '1011',
        M: '1100',
        N: '1101',
        O: '1110',
        P: '1111',
    };

    for (i; i < bitString.length; i++) {
        current = bitStringArray[i];

        if (current == '-' || current == 'x') {
            numberString = "";
            i++;
            while (bitStringArray[i] != 'x' && bitStringArray[i] != '-' && !hexChar[bitStringArray[i]] && i < bitString.length) {
                numberString += bitStringArray[i];
                i++;
            }
            i--;

            for (j = 0; j < parseInt(numberString); j++) {
                imageString += current == "x" ? '1111' : '0000';
            }
        } else if (hexChar[current]) {
            imageString += hexChar[current];
        }
    }

    return imageString;
};

/**
 * Handle the 3 possible interactions with the two buttons.
 * - Left Button
 *   x Go to the left
 *   x Say No
 *
 * - Right Button
 *   x Go to the right
 *   x Say yes
 *
 * - Both of them
 *   x Go in or out of the menu
 *   x Start settings
 *
 * All of the actions are handled by the server, we are
 * just sending the inputs to the server.
 */
handleButtons = function () {

    if (!arduinoRightButton || !arduinoLeftButton || !arduinoBothButton) {
        return;
    }

    arduinoBothButton.onclick = function () {
        socket.emit('buttonsPushed', {left: true, right: true});
    };

    arduinoLeftButton.onclick = function () {
        socket.emit('buttonsPushed', {left: true, right: false});
    };

    arduinoRightButton.onclick = function () {
        socket.emit('buttonsPushed', {left: false, right: true});
    };
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
        var id = document.getElementById('arduino-select').value;
        log('simulate the "login" with id: ' + id);
        socket.emit('loginGadget', {'id': id});
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

/**
 * Handle the Logout-Button.
 * Simulates the logout from the server via an arduino.
 */
handleArduinoLogout = function () {

    if (arduinoLogout === null) {
        return;
    }

    arduinoLogout.onclick = function () {
        log('simulate the "logout" of gadget');
        socket.emit('logout', null);
    };
};

/**
 * Handle the Login-Button.
 * Login to an existing user.
 */
handleLogin = function () {

    if (login === null) {
        log('no login-button found.');
        return;
    }

    login.onclick = function () {
        var username = document.getElementById('login-username').value;
        var password = document.getElementById('login-password').value;
        var gadgetID = parseInt(document.getElementById('selectGadget').value);

        socket.emit('loginUser', {'username': username, 'password': password, 'gadget': gadgetID});

    };
};

/**
 * Handle the UpdateMoood-Button.
 * Login to an existing user.
 */
handleUpdateMood = function () {

    if (updateMood === null) {
        log('no update Mood Button found.');
        return;
    }

    updateMood.onclick = function () {
        var mood = parseInt(document.getElementById('mood-select').value);
        //TODO gadget 2 is hardcoded for testing, add option to choose gadget
        var gadget = '2';
        console.log(mood);
        socket.emit('updateMood', {'name': gadget, 'currentMood': mood});

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
    log('socketShow');

    var displayWidth = 320;
    var displayHeight = 240;


    if (data.draw) {

        var draw = bitToImage(data.draw).split("");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, displayWidth, displayHeight);

        context.fillStyle = "#000000";
        var x = 0;
        for (var i = 0; i < displayHeight; i++) {
            for (var j = 0; j < displayWidth; j++) {
                if (draw[x] === '1') {
                    context.fillRect(j, i, 1, 1);
                }
                x++;
            }
        }

    }
});

socket.on('access', function (data) {
    log('socketAccess');
    socket.emit('hello', {'message': 'full graphic'});
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
handleArduinoLogout();
handleCreate();
handleLogin();
handleUpdateMood();
handleButtons();

