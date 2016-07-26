'use strict';

var mongodb = require('mongodb');
var mongoose = require('mongoose');
var user = require('./model/user.js');
var token = require('./model/token.js');
var mood = require('./model/mood.js');
var gadget = require('./model/gadget.js');
var connection = require('./model/connection.js');


function db () {

    // functions
    var activateGadget;
    var addSocketConnection;
    var addUserConnection;
    var addUserToGadgetModel;
    var removeConnection;
    var initDB;
    var setupSchema;
    var getUser;
    var createUser;
    var loginUser;
    var createUserFinally;
    var createTokenFinally;
    var validateToken;
    var createNewToken;
    var changeMood;
    var changeMoodFinally;
    var connectGadgetToUserModel;
    var getGadgetIdToConnection;
    var deactivateGadget;
    var getIdToUsername;
    var linkGadgetToSocket;

    // variables
    var url = 'mongodb://localhost:9999/test';
    var User = new user(this);
    var Token = new token(this);
    var Mood = new mood(this);
    var connected = false;
    var Gadget = new gadget(this);
    var Connection = new connection(this);

    // gadget constants
    const nameGadget1 = '1';
    const nameGadget2 = '2';

    /* ===================================================================
     * Public functions
     * ====================================================================== */

    this.activateGadget             = function (id) { return activateGadget(id); };
    this.addSocketConnection        = function (id) { return addSocketConnection(id); };
    this.addUserConnection          = function (connectionId, userId) { return addUserConnection(connectionId, userId); };
    this.addUserToGadgetModel       = function (userId, gadgetId, username) {return addUserToGadgetModel(userId, gadgetId, username);};
    this.createUser                 = function (username, password, callback) { return createUser(username, password, callback); };
    this.removeConnection           = function (connectionId) { return removeConnection(connectionId); };

    this.getUser = function (username, password, callback) { return getUser(username, password, callback); };
    this.loginUser = function (username, password, gadget, socketId) {return loginUser(username, password, gadget, socketId); };
    this.createUserFinally = function (err, result, username, password, callback) { return createUserFinally(err, result, username, password, callback); };
    this.createTokenFinally = function (id, result) {return createTokenFinally(id,result);};
    this.validateToken = function (id, username, gadget, socketId) {return validateToken(id, username, gadget, socketId);};
    this.createNewToken = function (id) {return createNewToken(id);};
    this.changeMood = function (connectionId, currentMood) {return changeMood(connectionId,currentMood);};
    this.changeMoodFinally = function (gadgetId, currentMood) {return changeMoodFinally(gadgetId, currentMood);};
    this.connectGadgetToUserModel = function (username, gadget) {return connectGadgetToUserModel(username, gadget);};
    this.getGadgetIdToConnection = function (connectionId) {return getGadgetIdToConnection(connectionId);};
    this.deactivateGadget = function (connectionId, gadgetId) {return deactivateGadget(connectionId, gadgetId);};
    this.getIdToUsername = function (username, gadgetId, socketId) {return getIdToUsername(username, gadgetId, socketId);};
    this.linkGadgetToSocket = function (connectionId, gadgetId) {return linkGadgetToSocket(connectionId, gadgetId);};

    /* ======================================================================
     * Private functions
     * ====================================================================== */

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
     * @param id - ID of the user we want to create a token for.
     * @param username - The User who should get logged in.
     */
    createTokenFinally = function (id, username) {
        
        console.log('New Token created for ID: ' + id + ' and User: ' + username);
        Token.create(id);
    };

    /**
     * Calls the addGadgetToUser methode in class User, to add the gadget
     * @param username - The User.
     * @param gadgetId: The user's gadget.
     */
    connectGadgetToUserModel = function (username, gadgetId) {
        User.addGadgetToUser(username, gadgetId);
    };

    /**
     * Calls the addGadgetToUser methode in class User, to add the gadget
     * @param userId: The user's ID in DB.
     * @param gadgetId:
     * @param username:
     */
    addUserToGadgetModel = function(userId, gadgetId, username){
        Gadget.update(gadgetId, userId, username);
    };

    /**
     * Calls the addGadgetToUser methode in class User, to add the gadget
     * @param username:
     * @param gadgetId:
     * @param socketId: The connection the user is using.
     */
    getIdToUsername = function(username, gadgetId, socketId){
        User.getUserIdByUsername(username, gadgetId, socketId);
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
     */
    loginUser = function (username, password, gadget, socketId) {
        if (!connected) {
            console.log('no DB connected');
            return false;
        }
        User.findUserForLogin(username, password, gadget, socketId);
    };

    /**
     * Checks if there is already a valid Token related to this user id.
     * @param id: user ID.
     * @param username: Username.
     * @param gadget: The user's gadget.
     * @param socketId: Socket which the user uses.
     */
    validateToken = function (id, username, gadget, socketId) {
        Token.checkIfTokenExists(id, username, gadget, socketId);
        
    };

    /**
     * Creates a new token if the old one is not valid anymore.
     * @param id: user ID.
     */
    createNewToken = function (id) {
        Token.update(id);

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
     * TODO: (beni) rename...
     * Searches for the gadgetId which is related to a certain socket connection.
     * @param connectionId: Id of the connection we look for.
     */
    getGadgetIdToConnection = function (connectionId) {
        Connection.findConnectionToDelete(connectionId);
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
                if (result !== null && result.userId) {
                    // todo: do we need to remove an active user?
                }
                Connection.deleteConnection(connectionId);
            }
        });
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
        Mood.create(nameGadget1);
        Mood.create(nameGadget2);
        Gadget.create(nameGadget1);
        Gadget.create(nameGadget2);
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

    // run on first call of the db.
    initDB();
}

module.exports = db;
