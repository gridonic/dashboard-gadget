// Modules
require('./module/storage-handler');
require('./module/display-drawer');

// Functions
var dashboardStart;
var dashboardUserApps;
var dashboardUserSettings;
var dashboardUpdateContent;
var handleArduinoLogin;
var handleArduinoLogout;
var handleArduinoButtons;
var handleDashboardCreate;
var handleDashboardLoggedIn;
var handleDashboardLogin;
var handleDashboardLogout;
var handleDashboardUserSettingsUpdated;
var handleNewPoll;
var handleDashboardUserUpdated;
var handleUpdateMood;
var handleStartPoll;
var handleSuccess;
var handleError;
var log;
var simulatorStart;
var hideElement;
var showElement;
var dashboardShowUser;
var dashboardHideUser;
// var buttonData = {screen: 'defaultScreen'};
// var pollData = {};
// var pollData = {type: 'defaultType'};

// Constants
var WAITING_DEFAULT = 0;
var WAITING_CREATE_USER = 1;
var WAITING_LOGIN_USER = 2;
var HARVEST_PASSWORD_PLACEHOLDER = 'password';
var HARVEST_PASSWORD_IDENTIFIER = 'data-harvest-pw';
var SCREEN_POLL_ACTIVE = 'pollToAnswer';
var SCREEN_DEFAULT = 'default-screen';
var POLL_TYPE_DEFAULT = 'defaultType';

// Variables
var socket = io();
var start = document.getElementById('btn-start');
var arduinoLogout = document.getElementById('btn-arduinoLogout');
var arduinoLeftButton = document.getElementById('btn-arduino-left');
var arduinoRightButton = document.getElementById('btn-arduino-right');
var arduinoBothButton = document.getElementById('btn-arduino-both');
var create = document.getElementById('btn-create');
var dashboardLogin = document.getElementById('btn-login');
var dashboardLogout = document.getElementById('btn-logout');
var updateMood = document.getElementById('btn-update');
var formUserSetting = document.getElementById("form-user-settings");
var dashboardAppContainer = document.getElementById('app-container');
var sectionCreate = document.getElementById('section-create');
var sectionLogin = document.getElementById('section-login');
var sectionUser = document.getElementById('section-user');
var sectionLogout = document.getElementById('section-logout');
var startPoll = document.getElementById('poll-start');
var elementUsername = document.getElementById('element-username');
var actualWaiting = WAITING_DEFAULT;
var actualScreen = SCREEN_DEFAULT;
var actualPollType;
var helloed = false;

var StorageHandler = storageHandler();
var DisplayDrawer = displayDrawer();

log = function (message) {
    console.log(message);
    
    var output = document.getElementById('console-output');
    if (output) {
        output.innerHTML = output.innerHTML + '<br>' + message;
    }
};

hideElement = function (element) {
    element.style.display = 'none';
};

showElement = function (element) {
    element.style.display = 'block';
};

dashboardHideUser = function () {
    elementUsername.innerHTML = '';
    formUserSetting.reset();

    hideElement(sectionUser);
    hideElement(sectionLogout);
    showElement(sectionLogin);
    showElement(sectionCreate);
};

dashboardShowUser = function () {
    showElement(sectionUser);
    showElement(sectionLogout);
    hideElement(sectionLogin);
    hideElement(sectionCreate);
};

/**
 * Update all the flexible content on the dashboard.
 */
dashboardUpdateContent = function () {
    var settings = JSON.parse(StorageHandler.getUserSettings());
    var keys = Object.keys(settings);
    var username = StorageHandler.getUser();
    var apps = StorageHandler.getApps();
    var userApps = StorageHandler.getUserApps();
    var userAppSettings = StorageHandler.getUserAppSettings();
    var appContent = '';
    var i;

    for (i = 0; i < keys.length; i++) {
        if (keys[i] === 'setting-harvest-password') {
            document.getElementById(keys[i]).value = HARVEST_PASSWORD_PLACEHOLDER;
            document.getElementById(keys[i]).setAttribute(HARVEST_PASSWORD_IDENTIFIER, settings[keys[i]]);
        } else {
            document.getElementById(keys[i]).value = settings[keys[i]];
        }
    }

    for (i = 0; i < apps.length; i++) {

        var appSettings;

        if (apps[i].settings !== 'null') {
            appSettings = JSON.parse(apps[i].settings);
            if (appSettings && appSettings.activated === true) {

                if (userApps.indexOf(apps[i]._id) < 0) {
                    console.log('save app ' + apps[i].name + ' on the server.');
                    socket.emit('activateApp', {
                        user: StorageHandler.getUser(),
                        token: StorageHandler.getToken(),
                        appId: apps[i]._id,
                        appSettings: null
                    });
                }

                continue;
            }
        }

        var buttonDataString = '';
        appContent += '<h6>' + apps[i]['name'] + '</h6>';
        appContent += '<p class="_text-italic">' + apps[i]['description'] + '</p>';

        if (apps[i].settings !== 'null') {
            appSettings = JSON.parse(apps[i].settings);
            for (var key in appSettings) {
                if (appSettings.hasOwnProperty(key)) {
                    var id;
                    var value;

                    if (appSettings[key] === 'number') {
                        id = apps[i]['_id'] + '---' + key;
                        value = '';
                        buttonDataString += '|' + id;

                        if (userApps && userApps.indexOf(apps[i]['_id']) > -1 && userAppSettings[apps[i]['_id']] != null) {
                            value = userAppSettings[apps[i]['_id']][key];
                        }

                        appContent += '<div class="row form-group"><div class="col-sm-4"><label>' + key + '</label></div>' +
                            '<div class="col-sm-8"><input class="form-control" type="number" id="' + id + '" value="' + value + '"></div></div>';
                    } else if (appSettings[key] === 'string') {
                        id = apps[i]['_id'] + '---' + key;
                        value = '';
                        buttonDataString += '|' + id;

                        if (userApps && userApps.indexOf(apps[i]['_id']) > -1 && userAppSettings[apps[i]['_id']] != null) {
                            value = userAppSettings[apps[i]['_id']][key];
                        }

                        appContent += '<div class="row form-group"><div class="col-sm-4"><label>' + key + '</label></div>' +
                            '<div class="col-sm-8"><input class="form-control" type="text" id="' + id + '" value="' + value + '"></div></div>';
                    }
                }
            }
        }

        if (userApps && userApps.indexOf(apps[i]['_id']) > -1) {
            appContent += '<button class="deactivate-app btn btn-danger _margined-bottom" data-appid="' + apps[i]['_id'] + '">Deaktivieren</button>';
        } else {
            appContent += '<button class="activate-app btn btn-success _margined-bottom" data-appid="' + apps[i]['_id'] + '" data-settings="' + buttonDataString + '">Aktivieren</button>';
        }
    }

    dashboardAppContainer.innerHTML = appContent;
    dashboardUserApps();
    elementUsername.innerHTML = username;
};

dashboardUserApps = function () {
    var activateButtons = document.getElementsByClassName('activate-app');
    var deactivateButtons = document.getElementsByClassName('deactivate-app');
    var i;
    var j;

    for (i = 0; i < activateButtons.length; i++) {
        activateButtons[i].onclick = function () {
            var appId = this.dataset.appid;
            var settings = this.dataset.settings;
            var settingsArray;
            var settingsData = {};
            var identifier;

            if (settings.length > 0) {
                settingsArray = settings.split('|');
                for (j = 0; j < settingsArray.length; j++) {
                    if (settingsArray[j].length > 0) {
                        identifier = settingsArray[j].split('---');
                        settingsData[identifier[1]] = document.getElementById(settingsArray[j]).value;
                    }
                }
            }

            socket.emit('activateApp', {
                user: StorageHandler.getUser(),
                token: StorageHandler.getToken(),
                appId: appId,
                appSettings: settingsData
            });
        }
    }

    for (i = 0; i < deactivateButtons.length; i++) {
        deactivateButtons[i].onclick = function () {
            var appId = this.dataset.appid;
            socket.emit('deactivateApp', {
                user: StorageHandler.getUser(),
                token: StorageHandler.getToken(),
                appId: appId
            });
        }
    }
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
handleArduinoButtons = function () {

    if (!arduinoRightButton || !arduinoLeftButton || !arduinoBothButton) {
        return;
    }

    arduinoBothButton.onclick = function () {
        if (actualScreen === SCREEN_DEFAULT) {
            socket.emit('buttonsPushed', {left: true, right: true});
        } else if (actualScreen === SCREEN_POLL_ACTIVE) {
            log('no interaction for both buttons on this screen');
        }
    };

    arduinoLeftButton.onclick = function () {
        if (actualScreen === SCREEN_DEFAULT) {
            socket.emit('buttonsPushed', {left: true, right: false});
        } else if (actualScreen === SCREEN_POLL_ACTIVE) {
            socket.emit('buttonsPushed', {left: true, right: false, screen: actualScreen, type: actualPollType});
        }
    };

    arduinoRightButton.onclick = function () {
        if (actualScreen === SCREEN_DEFAULT) {
            socket.emit('buttonsPushed', {left: false, right: true});
        } else if (actualScreen === SCREEN_POLL_ACTIVE) {
            socket.emit('buttonsPushed', {left: false, right: true, screen: actualScreen, type: actualPollType});
        }
    };
};

/**
 * Handle the Start-Button.
 * Simulates the login on the server via an arduino.
 */
handleArduinoLogin = function () {

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
handleDashboardCreate = function () {

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
 * Handle the event, when a user is successfully logged in on the dashboard.
 * @param data
 */
handleDashboardLoggedIn = function (data) {
    actualWaiting = WAITING_DEFAULT;

    StorageHandler.setUser(data.username);
    StorageHandler.setToken(data.token);
    StorageHandler.setUserSettings(data.settings);
    StorageHandler.setApps(data.apps);

    if (data.user.appActivated) {
        StorageHandler.setUserApps(data.user.appActivated);
    }

    if (data.user.appSettings) {
        StorageHandler.setUserAppSettings(data.user.appSettings);
    }

    dashboardShowUser();
    dashboardUpdateContent();
};

/**
 * Handle the Login-Button.
 * Login to an existing user.
 */
handleDashboardLogin = function () {

    if (dashboardLogin === null) {
        log('no login-button found.');
        return;
    }

    dashboardLogin.onclick = function () {
        var username = document.getElementById('login-username').value;
        var password = document.getElementById('login-password').value;
        var gadgetID = parseInt(document.getElementById('selectGadget').value);

        socket.emit('loginUser', {'username': username, 'password': password, 'gadget': gadgetID});
        actualWaiting = WAITING_LOGIN_USER;
    };
};

/**
 * Handle the Logout-Button.
 * Logout a user.
 */
handleDashboardLogout = function () {
    if (dashboardLogout === null) {
        log('no dashboard-logout-button found.');
        return;
    }
    
    dashboardLogout.onclick = function() {
        StorageHandler.delete();
        dashboardHideUser();

        socket.emit('logoutUser');
    };
};

dashboardStart = function () {

    if (document.body.className != 'dashboard') {
        return;
    }

    var username = StorageHandler.getUser();
    var token = StorageHandler.getToken();
    if (token && username) {
        dashboardShowUser();
        dashboardUpdateContent();
    } else {
        dashboardHideUser();
    }
};

dashboardUserSettings = function () {

    if (document.body.className != 'dashboard') {
        return;
    }

    formUserSetting.addEventListener("submit", function (event) {
        event.preventDefault();

        var formData = formUserSetting.elements;
        var userSettings = {};

        for (var i = 0; i < formData.length; i++) {
            if (formData[i] instanceof HTMLInputElement) {

                if (formData[i].id === 'setting-harvest-password' && formData[i].value === HARVEST_PASSWORD_PLACEHOLDER) {
                    userSettings[formData[i].id] = document.getElementById(formData[i].id).getAttribute(HARVEST_PASSWORD_IDENTIFIER);
                } else {
                    userSettings[formData[i].id] = formData[i].value;
                }
            }
        }

        socket.emit('saveUserSettings', {
            token: StorageHandler.getToken(),
            username: StorageHandler.getUser(),
            settings: userSettings
        });
    });
};

handleDashboardUserSettingsUpdated = function (data) {
    StorageHandler.setUserSettings(JSON.stringify(data));
    dashboardUpdateContent();
};

handleDashboardUserUpdated = function (data) {
    console.log(data);
    StorageHandler.setUser(data.user.username);

    if (data.user.appActivated) {
        StorageHandler.setUserApps(data.user.appActivated);
    }

    if (data.user.appSettings) {
        StorageHandler.setUserAppSettings(data.user.appSettings);
    }

    dashboardUpdateContent();
};

/**
 * Handle new incoming poll.
 */
handleNewPoll = function (data) {
    log('new incoming poll of type ' + data.type);
    socket.emit('giveMePoll', {data: data.type});
    // actualPollType = data.type;
    // actualScreen = SCREEN_POLL_ACTIVE;
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
        console.log('Mood: ' + mood);
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
        socket.emit('createPoll', {'type': type});
        
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
        case WAITING_LOGIN_USER:
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

simulatorStart = function () {
    log('simulatorStart.');
};

// Todo: Socket-calls & socket-handling hier, die oben aufgeführten Funktionen an sich in externes File auslagern.

socket.on('show', function (data) {
    DisplayDrawer.showDisplay(data);
});

socket.on('showMainDisplay', function (data) {
    DisplayDrawer.showMainDisplay(data);
});

socket.on('showMenu', function (data) {
    DisplayDrawer.showMenu(data);
});

socket.on('showProject', function (data) {
    DisplayDrawer.showProject(data);
});

socket.on('showMood', function (data) {
    DisplayDrawer.showMood(data);
});

socket.on('showWorkTime', function (data) {
    DisplayDrawer.showWorkTime(data);
});

socket.on('showTime', function (data) {
    DisplayDrawer.showTime(data);
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

socket.on('userSettings', function (data) {
    handleDashboardUserSettingsUpdated(data);
});

socket.on('userLoggedIn', function (data) {
    handleDashboardLoggedIn(data);
});

socket.on('newPoll', function (data) {
    handleNewPoll(data);
});

socket.on('updateUserData', function (data) {
    handleDashboardUserUpdated(data);
});

socket.on('showWhite', function (data) {

    if (!helloed) {
        socket.emit('hello', {'message': 'full graphic'});
        helloed = true;
    }
});

// Start modules
StorageHandler.init();
DisplayDrawer.init();

// Start own functions.
simulatorStart();
handleArduinoLogin();
handleArduinoLogout();
handleDashboardCreate();
handleDashboardLogin();
handleDashboardLogout();
dashboardStart();
dashboardUserSettings();
handleUpdateMood();
handleStartPoll();
handleArduinoButtons();
// handleNewPoll(pollData);

