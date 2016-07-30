'use strict';

var mongodb = require('mongodb');
var mongoose = require('mongoose');
var user = require('./model/user.js');
var token = require('./model/token.js');
var mood = require('./model/mood.js');
var gadget = require('./model/gadget.js');
var connection = require('./model/connection.js');
var poll = require('./model/poll.js');


function modelHandler () {

    // functions
    var activateGadget;
    var addSocketConnection;
    var addUserConnection;
    var removeConnection;
    var initDB;
    var setupSchema;
    var getUser;
    var createUser;
    var loginUser;
    var createUserFinally;
    var handleLoggedInUser;
    var changeMood;
    var changeMoodFinally;
    var deactivateGadget;
    var linkGadgetToSocket;
    var getGadgetArray;
    var createPoll;
    var createPollFinally;
    

    // variables
    var url         = 'mongodb://localhost:9999/test';
    var User        = new user(this);
    var Token       = new token(this);
    var Mood        = new mood(this);
    var connected   = false;
    var Gadget      = new gadget(this);
    var Connection  = new connection(this);
    var Poll        = new poll(this);

    // constants
    const NAME_GADGET1 = '1';
    const NAME_GADGET2 = '2';

    /* =====================================================================
     * Public functions
     * ===================================================================== */

    this.activateGadget             = function (id) { return activateGadget(id); };
    this.addSocketConnection        = function (id) { return addSocketConnection(id); };
    this.addUserConnection          = function (connectionId, userId) { return addUserConnection(connectionId, userId); };
    this.createUser                 = function (username, password, callback) { return createUser(username, password, callback); };
    this.loginUser                  = function (username, password, gadget, socketId, callback) { return loginUser(username, password, gadget, socketId, callback); };
    this.removeConnection           = function (connectionId) { return removeConnection(connectionId); };

    this.getUser = function (username, password, callback) { return getUser(username, password, callback); };
    this.createUserFinally = function (err, result, username, password, callback) { return createUserFinally(err, result, username, password, callback); };
    this.changeMood = function (connectionId, currentMood) {return changeMood(connectionId,currentMood);};
    this.changeMoodFinally = function (gadgetId, currentMood) {return changeMoodFinally(gadgetId, currentMood);};
    this.deactivateGadget = function (connectionId, gadgetId) {return deactivateGadget(connectionId, gadgetId);};
    this.linkGadgetToSocket = function (connectionId, gadgetId) {return linkGadgetToSocket(connectionId, gadgetId);};
    this.getGadgetArray = function (connectionId, type) {return getGadgetArray(connectionId, type);};
    this.createPoll = function (connectionId, type, socket) {return createPoll(connectionId, type, socket);};
    this.createPollFinally = function (sockets, type, connectionId, socket) {return createPollFinally(sockets, type, connectionId, socket);};

    /* =====================================================================
     * Private functions
     * ===================================================================== */

    addSocketConnection = function (id) {
        Connection.create(id, null, Connection.TYPE_UNDEFINED);
    };

    addUserConnection = function (connectionId, userId) {
        Connection.update(connectionId, userId, Connection.TYPE_USER);
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
            console.log('no DB connected');
            callback(false, {message: 'The database could not be found.'});
        }

        User.findUserForLogin(username, password, callback, function (id) {
            handleLoggedInUser(id, username, gadget, socketId, callback);
        });
    };

    /**
     * Checks if there is already a valid Token related to this user id.
     * @param userId: user ID.
     * @param username: Username.
     * @param gadgetId: The user's gadget.
     * @param socketId: Socket which the user uses.
     * @param callback: To call when user is finally logged in.
     */
    handleLoggedInUser = function (userId, username, gadgetId, socketId, callback) {
        Token.getUserToken(userId, function (token) {
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

                        callback(true, {token: token});
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
        Connection.findConnectionToDelete(connectionId, function (err, result) {
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
     * Create all Schemas, mostly by constructing its model.js-files
     */
    setupSchema = function () {
        User.construct(mongoose);
        Token.construct(mongoose);
        Mood.construct(mongoose);
        Gadget.construct(mongoose);
        Connection.construct(mongoose);
        Poll.construct(mongoose);
        Mood.create(NAME_GADGET1);
        Mood.create(NAME_GADGET2);
        Gadget.create(NAME_GADGET1);
        Gadget.create(NAME_GADGET2);
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
        });
    };

    // run on first call of the modelHandler.
    initDB();
}

module.exports = modelHandler;
