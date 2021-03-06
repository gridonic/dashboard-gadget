'use strict';

var app         = require('./model/app.js');
var appHandler  = require('./app-handler.js');
var connection  = require('./model/connection.js');
var gadget      = require('./model/gadget.js');
var harvest     = require('./module/harvest.js');
var mongodb     = require('mongodb');
var mongoose    = require('mongoose');
var mood        = require('./model/mood.js');
var poll        = require('./model/poll.js');
var token       = require('./model/token.js');
var user        = require('./model/user.js');


function modelHandler () {

    // Functions
    var activateGadget;
    var activateApp;
    var activatedAppSelected;
    var addSocketConnection;
    var addUserConnection;
    var changeMood;
    var changeUserApp;
    var createModels;
    var createPoll;
    var createPollFinally;
    var createUser;
    var createUserFinally;
    var deactivateGadget;
    var getGadgetArray;
    var getUser;
    var handleLoggedInUser;
    var initDB;
    var linkGadgetToSocket;
    var loginUser;
    var prepareDisplayForArduino;
    var removeConnection;
    var resetPoll;
    var saveUserSettings;
    var setupSchema;
    var showDisplayOnArduino;
    var showPoll;
    var showPollResult;
    var startDisplayOnArduino;
    var startPoll;
    var stopDisplaying;
    var switchPollOnArduino;
    var switchUserApp;
    var updatePoll;
    

    // Variables
    var connected           = false;
    var url                 = 'mongodb://localhost:9999/dashboard-gadget';
    var self                = this;
    var displayInterval     = null;
    var showPollContent     = null;
    var showPollDecision    = null;
    var pollResult          = null;

    // Models
    var App                 = new app(this);
    var AppHandler          = new appHandler(this);
    var Connection          = new connection(this);
    var Gadget              = new gadget(this);
    var Harvest             = new harvest();
    var Mood                = new mood(this);
    var Poll                = new poll(this);
    var Token               = new token(this);
    var User                = new user(this);

    // Constants
    const NAME_GADGET1      = '1';
    const NAME_GADGET2      = '2';
    this.APP_ACTIVATE       = '1';
    this.APP_DEACTIVATE     = '2';

    /* =====================================================================
     * Public functions
     * ===================================================================== */

    this.activateGadget             = function (id) { return activateGadget(id); };
    this.activateApp                = function (appId, socketId, callback) { return activateApp(appId, socketId, callback); };
    this.activatedAppSelected       = function (currentAppSocket, socketId, callback) { return activatedAppSelected(currentAppSocket, socketId, callback); };
    this.addSocketConnection        = function (id) { return addSocketConnection(id); };
    this.addUserConnection          = function (connectionId, userId) { return addUserConnection(connectionId, userId); };
    this.changeMood                 = function (connectionId, currentMood, callback) {return changeMood(connectionId,currentMood, callback);};
    this.changeUserApp              = function (mode, u, t, id, settings, c) { return changeUserApp(mode, u, t, id, settings, c); };
    this.createPoll                 = function (connectionId, type, socket) {return createPoll(connectionId, type, socket);};
    this.createPollFinally          = function (sockets, type, connectionId, socket) {return createPollFinally(sockets, type, connectionId, socket);};
    this.createUser                 = function (username, password, callback) { return createUser(username, password, callback); };
    this.createUserFinally          = function (err, result, username, password, callback) { return createUserFinally(err, result, username, password, callback); };
    this.deactivateGadget           = function (connectionId, gadgetId) {return deactivateGadget(connectionId, gadgetId);};
    this.getGadgetArray             = function (connectionId, type) {return getGadgetArray(connectionId, type);};
    this.getUser                    = function (username, password, callback) { return getUser(username, password, callback); };
    this.isDisplayPaused            = function () { return displayInterval == null; };
    this.linkGadgetToSocket         = function (connectionId, gadgetId) {return linkGadgetToSocket(connectionId, gadgetId);};
    this.loginUser                  = function (username, password, gadget, socketId, callback) { return loginUser(username, password, gadget, socketId, callback); };
    this.removeConnection           = function (connectionId) { return removeConnection(connectionId); };
    this.resetPoll                  = function () { return resetPoll(); };
    this.saveUserSettings           = function (token, username, settings, callback) { return saveUserSettings(token, username, settings, callback); };
    this.setupDisplayForArduino     = function (socketId, callback) { return prepareDisplayForArduino(socketId, callback); };
    this.showPoll                   = function (socketId, callback, data) { return showPoll(socketId, callback, data); };
    this.showPollResult             = function (socketId, callback, data) { return showPollResult(socketId, callback, data); };
    this.startPoll                  = function (sockets, type, connectionId, socket) {return startPoll(sockets, type, connectionId, socket);};
    this.stopDisplaying             = function () { return stopDisplaying(); };
    this.switchApp                  = function (direction, socketId, callback) { return switchUserApp(direction, socketId, callback); };
    this.switchPoll                 = function (direction, socketId, callback) { return switchPollOnArduino(direction, socketId, callback); };
    this.updatePoll                 = function (socket, connectionId, type, answer) {return updatePoll(socket, connectionId, type, answer);};

    /* =====================================================================
     * Private functions
     * ===================================================================== */

    /**
     * Activate the app by its ID.
     * @param appId
     * @param socketId
     * @param callback
     */
    activateApp = function (appId, socketId, callback) {
        Connection.findConnectionById(socketId, function (err, conn) {
            if (err || conn === null) {
                // todo: handleError
            } else {
                Gadget.findGadgetById(parseInt(conn.gadgetId), function (err, gadget) {
                    if (err) {
                        // todo: handleError
                    } else {
                        User.getUserByUsername(gadget.lastUserName, function (err, user) {

                            App.findById(appId, function (err, result) {
                                if (err || result === null) {
                                    console.log('todo: handle error on find app');
                                } else {
                                    var appSettings = JSON.parse(result.settings);
                                    if (appSettings.activated === true) {
                                        showPollContent = {
                                            app: result,
                                            type: AppHandler.POLL_TO_FILL
                                        };
                                        startDisplayOnArduino(socketId, callback, user);
                                    } else {
                                        console.log('this usecase is not handled yet.');
                                    }
                                }
                            });
                        });
                    }
                });
            }
        });
    };

    /**
     * An activated-App-Screen got selected.
     * For example a poll-result was selected.
     *
     * @param app
     * @param socketId
     * @param callback
     */
    activatedAppSelected = function (app, socketId, callback) {
        Connection.findConnectionById(socketId, function (err, conn) {
            if (err || conn === null) {
                // todo: handleError
            } else {
                Gadget.findGadgetById(parseInt(conn.gadgetId), function (err, gadget) {
                    if (err) {
                        // todo: handleError
                    } else {
                        User.getUserByUsername(gadget.lastUserName, function (err, user) {

                            if (app.type === AppHandler.POLL_TO_FILL) {
                                if (app.app.name === AppHandler.APP_MOOD_NAME) {

                                    if (AppHandler.getAppMoodStep() === 1) {
                                        showPollDecision = {
                                            decision: true,
                                            type: 'POLL_COFFEE',
                                            app: app
                                        };
                                    } else if (AppHandler.getAppMoodStep() === 2) {
                                        showPollDecision = {
                                            decision: true,
                                            type: 'POLL_LUNCH',
                                            app: app.app
                                        };
                                    }

                                    Connection.findConnectionAndChangeMood(socketId, AppHandler.getAppMoodStep(), function (gadgetId, currentMood) {
                                        Mood.update(gadgetId, currentMood, function () {
                                            showPollContent = null;
                                            startDisplayOnArduino(socketId, callback, user);
                                        });
                                    });
                                } else {
                                    // handle other apps.

                                    if (app.app.name === AppHandler.APP_POLL_ROOM_NAME) {
                                        if (AppHandler.getAppPollRoomStep() === 1) {
                                            showPollDecision = {
                                                decision: true,
                                                type: 'POLL_COLD',
                                                app: app.app
                                            };
                                        } else if (AppHandler.getAppPollRoomStep() === 2) {
                                            showPollDecision = {
                                                decision: true,
                                                type: 'POLL_HOT',
                                                app: app.app
                                            };
                                        }
                                    } else if (app.app.name === AppHandler.APP_POLL_SOUND_NAME) {
                                        if (AppHandler.getAppPollSoundStep() === 1) {
                                            showPollDecision = {
                                                decision: true,
                                                type: 'POLL_SOUND',
                                                app: app.app
                                            };
                                        }
                                    }

                                    showPollContent = null;
                                    startDisplayOnArduino(socketId, callback, user);
                                }

                            } else {
                                console.log(app);
                                startDisplayOnArduino(socketId, callback, user);
                            }
                        });
                    }
                });
            }
        });
    };

    /**
     * Changes the status of a Gadget to active.
     * @param id: name of the gadget the request comes from.
     */
    activateGadget = function (id) {
        Gadget.activateGadget(id);
    };

    addSocketConnection = function (id) {
        Connection.create(id, null, Connection.TYPE_UNDEFINED);
    };

    addUserConnection = function (connectionId, userId) {
        Connection.update(connectionId, userId, Connection.TYPE_USER);
    };

    /**
     * Finds the gadgetId which is related to the connection the mood change request comes from.
     * @param connectionId: Id of the connection which the requesting gadget is using.
     * @param currentMood: New mood status the user wants to set via his gadget.
     * @param callback: call to display the new mood.
     */
    changeMood = function (connectionId, currentMood, callback) {
        Connection.findConnectionAndChangeMood(connectionId, currentMood, function (gadgetId, currentMood) {
            Mood.update(gadgetId, currentMood, function () {
                callback();
            });
        });
    };

    changeUserApp = function (mode, user, token, appId, appSettings, callback) {
        if (Token.checkToken(token)) {
            if (mode === self.APP_ACTIVATE) {
                User.addAppToUser(user, appId, appSettings, callback);
            } else if (mode === self.APP_DEACTIVATE) {
                User.removeAppFromUser(user, appId, callback);
            }
        }
    };

    /**
     * Asks for an all the gadget connections.
     * @param connectionId: Array of all gadget connections except the starting one.
     * @param type: Type of the poll to be started.
     * @param socket:
     */
    createPoll = function (connectionId, type, socket) {
        Connection.getGadgetArray(connectionId, type, socket);
    };

    /**
     * Asks for an all the gadget connections.
     * @param sockets: Array of all gadget connections except the starting one.
     * @param type: Type of the poll to be started.
     * @param connectionId: Connection ID of the gadget who started the poll.
     * @param socket:
     */
    createPollFinally = function (sockets, type, connectionId, socket) {
        Poll.create(type, sockets, connectionId, socket);

    };

    /**
     * Create a user if its username does not exist yet.
     *
     * @param username
     * @param password
     * @param callback
     */
    createUser = function (username, password, callback) {
        
        if (!connected) {
            return false;
        }

        User.findUserByUsername(username, password, callback);
    };

    /**
     * This will be the callback for the find(username) function in user.js
     * @param err
     * @param result
     * @param username
     * @param password
     * @param callback
     */
    createUserFinally = function (err, result, username, password, callback) {
        console.log('createUserResult');
        console.log(err);
        console.log(result);

        if (result.length > 0) {
            callback(false);
        } else {
            console.log('create user.');
            User.create(username, password, callback);
        }
    };

    /**
     * Changes the status of a Gadget to inactive.
     * @param connectionId: Id of the connection to be deleted.
     * @param gadgetId: Id of the gadget to be deactivated.
     */
    deactivateGadget = function (connectionId, gadgetId) {
        Gadget.deactivateGadget(gadgetId);
        Connection.deleteConnection(connectionId);
    };

    /**
     * Asks for an all the gadget connections.
     * @param connectionId: Id of the connection who started the poll process.
     * @param type: Type of the poll to be started.
     */
    getGadgetArray = function (connectionId, type) {
        Connection.getGadgetArray(connectionId, type);
    };

    /**
     * Get a user by its username & password
     *
     * @param username
     * @param password
     * @param callback
     * @returns {boolean}
     */
    getUser = function (username, password, callback) {
        if (!connected) {
            return false;
        }
        
        User.getUser(username, password, callback);
    };

    /**
     * Checks if there is already a valid Token related to this user id.
     * @param userId: user ID.
     * @param username: Username.
     * @param gadgetId: The user's gadget.
     * @param socketId: Socket which the user uses.
     * @param settings: Settings of the user.
     * @param callback: To call when user is finally logged in.
     */
    handleLoggedInUser = function (userId, username, gadgetId, socketId, settings, callback) {
        Token.createUserToken(userId, function (token) {
            if (token === null) {
                callback(false, {message: 'The token could not be generated for the user ' + username + ' with its id: ' + id});
            } else {
                // finally, add gadget to user.
                User.addGadgetToUser(username, gadgetId, function (err) {
                    if (err) {
                        callback(false, {message: 'user could not be saved in the database correctly'});
                    } else {
                        // finally, add user to this socket in the connections.
                        Connection.update(socketId, userId, Connection.TYPE_USER);

                        // finally, update the gadget by adding the logged in user.
                        Gadget.update(gadgetId, userId, username);

                        App.getAll(function (err, apps) {
                            User.getUserByUsername(username, function (err, user) {
                                if (err || user == null) {
                                    callback(false, {message: 'user could not be found on the server after the login.'});
                                } else {
                                    callback(true, {
                                        token: token,
                                        username: username,
                                        settings: settings,
                                        apps: apps,
                                        user: user
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    };

    /**
     * Changes the status of a Gadget to active.
     * @param connectionId: ID of the connection to be linked.
     * @param gadgetId: ID of the gadget which should be linked to the connection.
     */
    linkGadgetToSocket = function (connectionId, gadgetId) {
        Connection.update(connectionId, gadgetId, Connection.TYPE_GADGET);
        console.log('Connection: ' + connectionId + ' is now linked to gadget ' + gadgetId);
    };

    /**
     * Login to an existing user.
     *
     * @param username - The username of the user who wants to log in.
     * @param password - The password of the user who wants to log in.
     * @param gadget - The user's gadget.
     * @param socketId - The socket which is used by user.
     * @param callback - call on login or on errors
     */
    loginUser = function (username, password, gadget, socketId, callback) {
        if (!connected) {
            callback(false, {message: 'The database could not be found.'});
        }

        User.findUserForLogin(username, password, callback, function (id, settings) {
            handleLoggedInUser(id, username, gadget, socketId, settings, callback);
        });
    };

    /**
     * Display the stuff on the arduino.
     */
    prepareDisplayForArduino = function (socketId, callback) {

        Connection.findConnectionById(socketId, function (err, conn) {
            if (err) {
                // todo: handleError
            } else {
                Gadget.findGadgetById(parseInt(conn.gadgetId), function (err, gadget) {
                    if (err) {
                        // todo: handleError
                    } else {
                        User.getUserByUsername(gadget.lastUserName, function (err, user) {
                            startDisplayOnArduino(socketId, callback, user);
                        });
                    }
                });
            }
        });
    };

    /**
     * remove the connection
     *
     * @param connectionId
     */
    removeConnection = function (connectionId) {
        Connection.findConnectionById(connectionId, function (err, result) {
            if (err === null) {

                console.log('remove conection');

                console.log(result);

                if (result !== null && result.gadgetId) {
                    console.log('deactivate gadget with id ' + result.gadgetId);
                    Gadget.deactivateGadget(result.gadgetId);
                    // Mood.update(result.gadgetId, 0); // do not update the mood, because from time to time, the connection breaks.
                    stopDisplaying();
                }
                Connection.deleteConnection(connectionId);
            }
        });
    };

    resetPoll = function () {
        showPollDecision = null;
        showPollContent = null;
        pollResult = null;
    };

    /**
     * Save users new settings after checking if token is correct.
     *
     * @param token
     * @param username
     * @param settings
     * @param callback
     */
    saveUserSettings = function (token, username, settings, callback) {
        if (Token.checkToken(token)) {
            User.updateUserSettings(username, settings, function (settings) {
                callback(settings);
            });
        } else {
            callback(false);
        }
    };

    /**
     * Show the display.
     * We call this function very often, try not to make too much stuff in here.
     * Prepare everything you can before this function.
     *
     * @param callback
     * @param user
     * @param updateTime        Should the time been update on the screen or not?
     * @param currentDisplay    What do we show at the moment on the display?
     * @param menu              How many menu-points and which one is active
     * @param mood              the mood (color) we have to show
     * @param app               the currentApp of the display
     */
    showDisplayOnArduino = function (callback, user, updateTime, currentDisplay, menu, mood, app) {
        var worktime = null;
        var project = null;

        if (updateTime && user && user.userSettings) {
            worktime = Harvest.getWorkTime();
            project = Harvest.getProject();
        }

        callback(worktime, updateTime, project, mood, currentDisplay, menu, app);
    };

    /**
     * Show a poll on each gadget, after somebody wanted this.
     *
     * @param socketId
     * @param callback
     */
    showPoll = function (socketId, callback, data) {
        Connection.findConnectionById(socketId, function (err, conn) {
            if (err) {
                // todo: handleError
            } else {
                Gadget.findGadgetById(parseInt(conn.gadgetId), function (err, gadget) {
                    if (err) {
                        // todo: handleError
                    } else {
                        User.getUserByUsername(gadget.lastUserName, function (err, user) {

                            showPollDecision = {
                                decision: true,
                                question: true,
                                type: data.data
                            };

                            startDisplayOnArduino(socketId, callback, user);
                        });
                    }
                });
            }
        });
    };

    /**
     * Asks for an all the gadget connections.
     * @param socketId: Array of all gadget connections except the starting one.
     * @param callback: Show on the screen
     * @param data: Result of the finished poll.
     */
    showPollResult = function (socketId, callback, data) {

        Connection.findConnectionById(socketId, function (err, conn) {
            if (err) {
                // todo: handleError
            } else {
                Gadget.findGadgetById(parseInt(conn.gadgetId), function (err, gadget) {
                    if (err) {
                        // todo: handleError
                    } else {
                        User.getUserByUsername(gadget.lastUserName, function (err, user) {

                            console.log('modelHandler: showPollResult');
                            console.log(data);

                            var splitData = data.split('|');
                            pollResult = {
                                pollResult: true,
                                type: splitData[0],
                                result: splitData[1] === 'POS'
                            };

                            startDisplayOnArduino(socketId, callback, user);
                        });
                    }
                });
            }
        });
    };

    /**
     * Asks for an all the gadget connections.
     * @param sockets: Array of all gadget connections except the starting one.
     * @param type: Type of the poll to be started.
     * @param connectionId: Connection ID of the gadget who started the poll.
     * @param socket:
     */
    startPoll = function (sockets, type, connectionId, socket) {
        console.log('model-handler: start Poll');
        console.log(sockets);
        Poll.startPoll(sockets, type, connectionId, socket);
    };

    /**
     * Init the showing of the display here.
     * @param socketId
     * @param callback
     * @param user
     */
    startDisplayOnArduino = function (socketId, callback, user) {

        // todo: check if we have to show something else, for example a poll.

        var harvestCredentials = {};
        var userSettings;
        var userApps;
        var userAppSettings;
        var i = 0;
        var intervalTiming = 20000;
        var oneMinute = 60000 / intervalTiming;
        var currentDisplay = null;
        var currentMood = null;
        var currentApp = null;
        var currentAppIndex = -1;
        var showTime = true;

        var getCurrentDisplay = function (display, step, stepDuration) {
            if (showPollDecision !== null) {
                return AppHandler.getPollDecisionDisplay(showPollDecision.type);
            } else if(pollResult !== null) {
                return AppHandler.getPollResultDisplay(pollResult);
            } else if (display && display.app) {
                return AppHandler.getActualAppDisplay(step, stepDuration);
            } else if (showPollContent) {
                return AppHandler.getActualAppDisplay(step, stepDuration);
            } else {
                console.log('no display, no display.app');
                return null;
            }
        };

        var getMenu = function (display) {
            if (display && display.app) {
                currentAppIndex = userApps.indexOf(display.app);
                currentApp = userApps[currentAppIndex];
                return {
                    counts: userApps.length,
                    active: currentAppIndex
                };
            } else if (currentApp && currentApp.poll) {
                return AppHandler.getAppMenu(currentApp.app);
            } else if (currentApp && (currentApp.decision || currentApp.pollResult)) {
                return null;
            } else {
                currentApp = null;
                currentAppIndex = -1;
                return null;
            }
        };

        var updateMood = function () {
            Connection.findConnectionById(socketId, function (err, conn) {
                if (err) {
                    // todo: handleError
                } else {
                    if (conn !== null) {
                        Mood.getMoodColor(conn.gadgetId, function (color) {
                            currentMood = color;
                        });
                    }
                }
            });
        };

        if (displayInterval) {
            clearInterval(displayInterval);
            displayInterval = null;
        }

        if (user && user.userSettings) {
            userSettings = JSON.parse(user.userSettings);

            harvestCredentials['domain'] = userSettings['setting-harvest-domain'];
            harvestCredentials['email'] = userSettings['setting-harvest-email'];
            harvestCredentials['password'] = User.decodeHarvestPassword(userSettings['setting-harvest-password']);

            Harvest.setCredentials(harvestCredentials);
        }

        if (showPollDecision) {
            currentApp = showPollDecision;
        } else if (pollResult) {
            currentApp = pollResult;
        } else if (showPollContent !== null) {
            AppHandler.prepareAppDisplay(showPollContent.app, showPollContent.type);
            currentApp = {
                poll: true,
                type: showPollContent.type,
                app: showPollContent.app
            };
        } else if (user && user.appActivated) {

            userApps = user.appActivated;
            userAppSettings = JSON.parse(user.appSettings);

            if (!user.currentDisplay) {
                currentDisplay = {
                    app: userApps[0]
                };

                App.findById(currentDisplay.app, function (err, result) {
                    if (err || result == null) {
                        // todo: handle error.
                    } else {
                        AppHandler.prepareAppDisplay(result, userAppSettings[currentDisplay.app]);
                    }
                });

                User.setCurrentDisplay(user.username, JSON.stringify(currentDisplay));

            } else if (user.currentDisplay) {
                currentDisplay = JSON.parse(user.currentDisplay);

                if (currentDisplay && currentDisplay.app && user.appActivated.indexOf(currentDisplay.app) > -1) {
                    App.findById(currentDisplay.app, function (err, result) {
                        if (err || result == null) {
                            // todo: handle error.
                        } else {
                            AppHandler.prepareAppDisplay(result, userAppSettings[currentDisplay.app]);
                        }
                    });
                }
            }
        }

        if (showPollContent) {
            showTime = false;
            // currentMood = null;
            console.log('prevent showing time / worktime & mood because we are showing the inside of an app.');
        }

        updateMood();

        setTimeout(function () {
            showDisplayOnArduino(
                callback,
                user,
                showTime,
                getCurrentDisplay(currentDisplay, i, intervalTiming),
                getMenu(currentDisplay),
                currentMood,
                currentApp
            );
            i++;
        }, 200);

        displayInterval = setInterval(function () {
            // var showTime = ((i + 10) % oneMinute == 0); // show time not after a minute, show it after 1 second (2*500ms)
            var showTime = true;

            if (showPollContent) {
                // showTime = false;
                currentMood = null;
            }

            if (showTime) {
                updateMood();
            }

            showDisplayOnArduino(
                callback,
                user,
                showTime,
                getCurrentDisplay(currentDisplay, i, intervalTiming),
                getMenu(currentDisplay),
                currentMood,
                currentApp
            );

            i++;
        }, intervalTiming);
    };

    /**
     * Stop the actual displaying on the arduino
     */
    stopDisplaying = function () {
        clearInterval(displayInterval);
        displayInterval = null;
    };

    /**
     * Switch the possible answers of a poll
     * @param direction
     * @param socketId
     * @param callback
     */
    switchPollOnArduino = function (direction, socketId, callback) {
        Connection.findConnectionById(socketId, function (err, conn) {
            if (err || conn == null) {
                // todo: handle error.
            } else {
                Gadget.findGadgetById(parseInt(conn.gadgetId), function (err, gadget) {
                    if (err) {
                        // todo: handleError
                    } else {
                        User.getUserByUsername(gadget.lastUserName, function (err, user) {
                            AppHandler.updatePollStep(direction === 'left' ? -1 : 1);
                            startDisplayOnArduino(socketId, callback, user);
                        });
                    }
                });
            }
        })
    };

    /**
     * Switch the different user apps on the arduino
     * @param direction
     * @param socketId
     * @param callback
     */
    switchUserApp = function (direction, socketId, callback) {
        Connection.findConnectionById(socketId, function (err, conn) {
            if (err || conn === null) {
                // todo: handleError
            } else {
                Gadget.findGadgetById(parseInt(conn.gadgetId), function (err, gadget) {
                    if (err) {
                        // todo: handleError
                    } else {
                        User.getUserByUsername(gadget.lastUserName, function (err, user) {
                            var userCurrentDisplay = JSON.parse(user.currentDisplay);
                            var actualAppPosition = user.appActivated.indexOf(userCurrentDisplay.app);
                            var newAppPosition = 0;

                            if (user.appActivated.length > 1) {
                                if (direction === 'left') {
                                    newAppPosition = actualAppPosition !== 0 ?  actualAppPosition - 1 : user.appActivated.length - 1;
                                } else if (direction === 'right') {
                                    newAppPosition = actualAppPosition !== user.appActivated.length - 1 ? actualAppPosition + 1 : 0;
                                }
                            }

                            User.setCurrentDisplay(user.username, JSON.stringify({ app: user.appActivated[newAppPosition] }));
                            user.currentDisplay = JSON.stringify({app: user.appActivated[newAppPosition]});
                            startDisplayOnArduino(socketId, callback, user);
                        });
                    }
                });
            }
        });
    };

    /**
     * Updates an ongoing poll with the answer of one user.
     * @param socket:
     * @param connectionId: Connection ID of the users gadget.
     * @param type: Type of the ongoing poll the user wants to answer to.
     * @param answer: Specific answer of the user.
     */
    updatePoll = function (socket, connectionId, type, answer) {
        Poll.update(type, connectionId, socket, answer);
    };

    /* ======================================================================
     * Start the model-handler
     * ====================================================================== */

    /**
     * Create all Schemas, mostly by constructing its model.js-files
     */
    setupSchema = function () {
        App.construct(mongoose);
        Harvest.construct(mongoose);
        User.construct(mongoose);
        Token.construct(mongoose);
        Mood.construct(mongoose);
        Gadget.construct(mongoose);
        Connection.construct(mongoose);
        Poll.construct(mongoose);
    };

    createModels = function () {
        Mood.create(NAME_GADGET1);
        Mood.create(NAME_GADGET2);
        Gadget.create(NAME_GADGET1);
        Gadget.create(NAME_GADGET2);

        // Create all Apps
        App.create(AppHandler.getAppBreathing());
        App.create(AppHandler.getAppMood());
        App.create(AppHandler.getAppPollRoom());
        App.create(AppHandler.getAppPollSound());
        App.create(AppHandler.getAppServer());
        App.create(AppHandler.getAppTest());
    };

    /**
     * Initiate the database
     * Use mongoose / mongoDB-Database
     */
    initDB = function () {

        mongoose.connect(url);

        var db = mongoose.connection;
        db.on('error', function (a, b, c) {
            console.log('error');
            console.log(a);
            console.log(b);
            console.log(c);
        });
        db.on('error', console.error.bind(console, 'connection error:'));

        db.once('open', function() {
            // we're connected!
            console.log('database is open and connected.!');
            connected = true;
            setupSchema();
            createModels();
        });
    };

    // run on first call of the modelHandler.
    initDB();
}

module.exports = modelHandler;
