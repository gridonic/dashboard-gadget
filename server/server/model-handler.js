'use strict';

var app = require('./model/app.js');
var appHandler = require('./app-handler.js');
var connection = require('./model/connection.js');
var gadget = require('./model/gadget.js');
var harvest = require('./model/harvest.js');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var mood = require('./model/mood.js');
var poll = require('./model/poll.js');
var token = require('./model/token.js');
var user = require('./model/user.js');


function modelHandler () {

    // Functions
    var activateGadget;
    var addSocketConnection;
    var addUserConnection;
    var changeMood;
    var changeMoodFinally;
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
    var saveUserSettings;
    var setupSchema;
    var showDisplayOnArduino;
    var startDisplayOnArduino;
    var startPoll;
    var updatePoll;
    

    // Variables
    var connected   = false;
    var url         = 'mongodb://localhost:9999/dashboard-gadget';
    var self        = this;
    var displayInterval;

    // Models
    var App         = new app(this);
    var AppHandler  = new appHandler(this);
    var Connection  = new connection(this);
    var Gadget      = new gadget(this);
    var Harvest     = new harvest(this);
    var Mood        = new mood(this);
    var Poll        = new poll(this);
    var Token       = new token(this);
    var User        = new user(this);

    // Constants
    const NAME_GADGET1 = '1';
    const NAME_GADGET2 = '2';
    this.APP_ACTIVATE = '1';
    this.APP_DEACTIVATE = '2';

    /* =====================================================================
     * Public functions
     * ===================================================================== */

    this.activateGadget             = function (id) { return activateGadget(id); };
    this.addSocketConnection        = function (id) { return addSocketConnection(id); };
    this.addUserConnection          = function (connectionId, userId) { return addUserConnection(connectionId, userId); };
    this.changeUserApp              = function (mode, u, t, id, settings, c) { return changeUserApp(mode, u, t, id, settings, c); };
    this.createUser                 = function (username, password, callback) { return createUser(username, password, callback); };
    this.loginUser                  = function (username, password, gadget, socketId, callback) { return loginUser(username, password, gadget, socketId, callback); };
    this.removeConnection           = function (connectionId) { return removeConnection(connectionId); };
    this.saveUserSettings           = function (token, username, settings, callback) { return saveUserSettings(token, username, settings, callback); };
    this.setupDisplayForArduino     = function (socketId, callback) { return prepareDisplayForArduino(socketId, callback); };

    this.getUser = function (username, password, callback) { return getUser(username, password, callback); };
    this.createUserFinally = function (err, result, username, password, callback) { return createUserFinally(err, result, username, password, callback); };
    this.changeMood = function (connectionId, currentMood) {return changeMood(connectionId,currentMood);};
    this.changeMoodFinally = function (gadgetId, currentMood) {return changeMoodFinally(gadgetId, currentMood);};
    this.deactivateGadget = function (connectionId, gadgetId) {return deactivateGadget(connectionId, gadgetId);};
    this.linkGadgetToSocket = function (connectionId, gadgetId) {return linkGadgetToSocket(connectionId, gadgetId);};
    this.getGadgetArray = function (connectionId, type) {return getGadgetArray(connectionId, type);};
    this.createPoll = function (connectionId, type, socket) {return createPoll(connectionId, type, socket);};
    this.createPollFinally = function (sockets, type, connectionId, socket) {return createPollFinally(sockets, type, connectionId, socket);};
    this.startPoll = function (sockets, type, connectionId, socket) {return startPoll(sockets, type, connectionId, socket);};
    this.updatePoll = function (socket, connectionId, type, answer) {return updatePoll(socket, connectionId, type, answer);};

    /* =====================================================================
     * Private functions
     * ===================================================================== */

    addSocketConnection = function (id) {
        Connection.create(id, null, Connection.TYPE_UNDEFINED);
    };

    addUserConnection = function (connectionId, userId) {
        Connection.update(connectionId, userId, Connection.TYPE_USER);
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
    
    getUser = function (username, password, callback) {
        if (!connected) {
            return false;
        }
        
        User.getUser(username, password, callback);
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
     * Finds the gadgetId which is related to the connection the mood change request comes from.
     * @param connectionId: Id of the connection which the requesting gadget is using.
     * @param currentMood: New mood status the user wants to set via his gadget.
     */
    changeMood = function (connectionId, currentMood) {
        Connection.findConnectionAndChangeMood(connectionId, currentMood);
    };

    /**
     * Request the final mood change in moodmodel.
     * @param gadgetId: Id of the gadget which requests the mood change.
     * @param currentMood: New mood status the user wants to set via his gadget.
     */
    changeMoodFinally = function (gadgetId, currentMood) {
        console.log(gadgetId + '------' + currentMood);
        Mood.update(gadgetId, currentMood);
    };

    /**
     * Changes the status of a Gadget to active.
     * @param id: name of the gadget the request comes from.
     */
    activateGadget = function (id) {
        Gadget.activateGadget(id);
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
     * Changes the status of a Gadget to inactive.
     * @param connectionId: Id of the connection to be deleted.
     * @param gadgetId: Id of the gadget to be deactivated.
     */
    deactivateGadget = function (connectionId, gadgetId) {
        Gadget.deactivateGadget(gadgetId);
        Connection.deleteConnection(connectionId);
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
                    Mood.update(result.gadgetId, 1);
                }
                Connection.deleteConnection(connectionId);
            }
        });
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
     * Updates an ongoing poll with the answer of one user.
     * @param socket:
     * @param connectionId: Connection ID of the users gadget.
     * @param type: Type of the ongoing poll the user wants to answer to.
     * @param answer: Specific answer of the user.
     */
    updatePoll = function (socket, connectionId, type, answer) {
        Poll.update(type, connectionId, socket, answer);

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
     * Asks for an all the gadget connections.
     * @param sockets: Array of all gadget connections except the starting one.
     * @param type: Type of the poll to be started.
     * @param connectionId: Connection ID of the gadget who started the poll.
     * @param socket:
     */
    startPoll = function (sockets, type, connectionId, socket) {
        Poll.startPoll(sockets, type, connectionId, socket);
    };

    /**
     * Display the stuff on the arduino.
     */
    prepareDisplayForArduino = function (socketId, callback) {
        console.log(socketId);

        Connection.findConnectionById(socketId, function (err, conn) {
            if (err) {
                // todo: handleError
            } else {
                Gadget.findGadgetById(parseInt(conn.gadgetId), function (err, gadget) {
                    if (err) {
                        // todo: handleError
                    } else {
                        User.getUserByUsername(gadget.lastUserName, function (err, user) {
                            startDisplayOnArduino(callback, user);
                        });
                    }
                });
            }
        });
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
     */
    showDisplayOnArduino = function (callback, user, updateTime, currentDisplay, menu) {
        var worktime = null;
        var project = null;

        if (updateTime && user && user.userSettings) {
            worktime = Harvest.getWorkTime();
            project = Harvest.getProject();
        }

        callback(worktime, updateTime, project, currentDisplay, menu);
    };

    /**
     * Init the showing of the display here.
     * @param callback
     * @param user
     */
    startDisplayOnArduino = function (callback, user) {

        // todo: check if we have to show something else like a poll.

        console.log(user);

        var harvestCredentials = {};
        var userSettings;
        var userApps;
        var userAppSettings;
        var i = 0;
        var intervalTiming = 500;
        var oneMinute = 60000 / intervalTiming;
        var currentDisplay = null;

        var getCurrentDisplay = function (display, step, stepDuration) {
            if (display && display.app) {
                return AppHandler.getActualAppDisplay(step, stepDuration);
            }
        };

        var getMenu = function (display) {
            if (display && display.app) {
                return {
                    counts: userApps.length,
                    active: userApps.indexOf(display.app)
                };
            } else {
                return null;
            }
        };

        if (displayInterval) {
            clearInterval(displayInterval);
        }

        if (user && user.userSettings) {
            userSettings = JSON.parse(user.userSettings);

            harvestCredentials['domain'] = userSettings['setting-harvest-domain'];
            harvestCredentials['email'] = userSettings['setting-harvest-email'];
            harvestCredentials['password'] = User.decodeHarvestPassword(userSettings['setting-harvest-password']);

            Harvest.setCredentials(harvestCredentials);
        }

        if (user && user.appActivated) {

            userApps = user.appActivated;
            userAppSettings = JSON.parse(user.appSettings);

            if (!user.currentDisplay) {
                console.log('set currentDisplay first, user has nothing to display at the moment.');
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
                    console.log('currentDisplay is already set.');
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

        showDisplayOnArduino(
            callback,
            user,
            true,
            getCurrentDisplay(currentDisplay, i, intervalTiming),
            getMenu(currentDisplay)
        );
        i++;

        displayInterval = setInterval(function () {
            var showTime = (i === oneMinute);

            showDisplayOnArduino(
                callback,
                user,
                showTime,
                getCurrentDisplay(currentDisplay, i, intervalTiming),
                getMenu(currentDisplay)
            );

            i++;
        }, 500);
    };

    /**
     * Create all Schemas, mostly by constructing its model.js-files
     */
    setupSchema = function () {
        App.construct(mongoose);
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
