console.log('web.js found.');

// Functions
var handleStart;
var handleArduinoLogout;
var handleButtons;
var handleCreate;
var handleLogin;
var handleLogout;
var handleUpdateMood;
var handleStartPoll;
var handleSuccess;
var handleShow;
var handleShowTime;
var handleShowWorkTime;
var handleError;
var bitToImage;
var log;

// Constants
var WAITING_DEFAULT = 0;
var WAITING_CREATE_USER = 1;
var DISPLAY_WIDTH = 320;
var DISPLAY_HEIGHT = 240;

// Variables
var socket = io();
var start = document.getElementById('btn-start');
var arduinoLogout = document.getElementById('btn-arduinoLogout');
var arduinoLeftButton = document.getElementById('btn-arduino-left');
var arduinoRightButton = document.getElementById('btn-arduino-right');
var arduinoBothButton = document.getElementById('btn-arduino-both');
var create = document.getElementById('btn-create');
var login = document.getElementById('btn-login');
var logout = document.getElementById('btn-logout');
var canvas = document.getElementById("display");
var updateMood = document.getElementById('btn-update');
var startPoll = document.getElementById('poll-start');
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
    var hexCharSix = {
        A: '000000',
        B: '000001',
        C: '000010',
        D: '000011',
        E: '000100',
        F: '000101',
        G: '000110',
        H: '000111',
        I: '001000',
        J: '001001',
        K: '001010',
        L: '001011',
        M: '001100',
        N: '001101',
        O: '001110',
        P: '001111',
        Q: '010000',
        R: '010001',
        S: '010010',
        T: '010011',
        U: '010100',
        V: '010101',
        W: '010110',
        X: '010111',
        Y: '011000',
        Z: '011001',
        a: '011010',
        b: '011011',
        c: '011100',
        d: '011101',
        e: '011110',
        f: '011111',
        g: '100000',
        h: '100001',
        i: '100010',
        j: '100011',
        k: '100100',
        l: '100101',
        m: '100110',
        n: '100111',
        o: '101000',
        p: '101001',
        q: '101010',
        r: '101011',
        s: '101100',
        t: '101101',
        u: '101110',
        v: '101111',
        w: '110000',
        x: '110001',
        y: '110010',
        z: '110011',
        '0': '110100',
        '1': '110101',
        '2': '110110',
        '3': '110111',
        '4': '111000',
        '5': '111001',
        '6': '111010',
        '7': '111011',
        '8': '111100',
        '9': '111101',
        'ä': '111110',
        'ö': '111111',
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
 * Handle the Logout-Button.
 * Logout a user.
 */
handleLogout = function () {
    if (logout === null) {
        log('no logout-button found.');
        return;
    }
    
    logout.onclick = function() {
        socket.emit('logoutUser');
    };
};

/**
 * Handle the UpdateMoood-Button.
 * Changes the mood of a user via gadget.
 */
handleUpdateMood = function () {

    if (updateMood === null) {
        log('no update Mood Button found.');
        return;
    }

    updateMood.onclick = function () {
        var mood = parseInt(document.getElementById('mood-select').value);
        console.log('Poll: ' + mood);
        socket.emit('updateMood', {'currentMood': mood});

    };
};

/**
 * Handle the Start Poll Button.
 * Starts a poll.
 */
handleStartPoll = function() {
    
    if (startPoll === null) {
        log('no start poll button found.');
        return;
    }
    
    startPoll.onclick = function() {
        var type = document.getElementById('poll-select').value;
        console.log('Poll: ' + type);
        socket.emit('startPoll', {'type': type});
        
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

handleShow = function (data) {
    log('socketShow');

    if (data.draw) {

        var draw = bitToImage(data.draw).split("");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

        context.fillStyle = "#000000";
        var x = 0;
        for (var i = 0; i < DISPLAY_HEIGHT; i++) {
            for (var j = 0; j < DISPLAY_WIDTH; j++) {
                if (draw[x] === '1') {
                    context.fillRect(j, i, 1, 1);
                }
                x++;
            }
        }
    }
};

// TODO: Adressen hier, die funktionen an sich in externes File auslagern.

socket.on('show', function (data) {
    handleShow(data)
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
handleLogout();
handleUpdateMood();
handleStartPoll();
handleButtons();

