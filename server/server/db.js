'use strict';

var mongodb = require('mongodb');
var mongoose = require('mongoose');
var user = require('./model/user.js');
var token = require('./model/token.js');
var mood = require('./model/mood.js');


function db () {

    // functions
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
    var connectGadgetToUserModel;

    // variables
    var url = 'mongodb://localhost:9999/test';
    var User = new user(this);
    var Token = new token(this);
    var Mood = new mood(this);
    var connected = false;

    // gadget constants
    const nameGadget1 = '1';
    const nameGadget2 = '2';

    /* ======================================================================
     * Public functions
     * ====================================================================== */
    
    this.getUser = function (username, password, callback) { return getUser(username, password, callback); };
    this.createUser = function (username, password, callback) { return createUser(username, password, callback); };
    this.loginUser = function (username, password, gadget) {return loginUser(username, password, gadget); };
    this.createUserFinally = function (err, result, username, password, callback) { return createUserFinally(err, result, username, password, callback); };
    this.createTokenFinally = function (id, result) {return createTokenFinally(id,result);};
    this.validateToken = function (id, username, gadget) {return validateToken(id, username, gadget);};
    this.createNewToken = function (id) {return createNewToken(id);};
    this.changeMood = function (name, currentMood) {return changeMood(name,currentMood);};
    this.connectGadgetToUserModel = function (username, gadget) {return connectGadgetToUserModel(username, gadget);};
    
    /* ======================================================================
     * Private functions
     * ====================================================================== */
    
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
     * Calls the addGadgetToUser Methode in class User, to add the gadget
     * @param username - The User.
     * @param gadget: The user's gadget.
     */
    connectGadgetToUserModel = function (username, gadget) {
        User.addGadgetToUser(username, gadget);
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
     */
    loginUser = function (username, password, gadget) {

        if (!connected) {
            console.log('no DB connected');
            return false;
        }
        User.findUserForLogin(username, password, gadget);
    };

    /**
     * Checks if there is already a valid Token related to this user id.
     * @param id: user ID.
     * @param username: Username.
     * @param gadget: The user's gadget.
     */
    validateToken = function (id, username, gadget) {
        Token.checkIfTokenExists(id, username, gadget);
        
    };

    /**
     * Creates a new token if the old one is not valid anymore.
     * @param id: user ID.
     */
    createNewToken = function (id) {
        Token.update(id);

    };

    /**
     * Creates a new token if the old one is not valid anymore.
     * @param name: name of the gadget the request comes from.
     * @param currentMood: New mood status the user wants to set.
     */
    changeMood = function (name, currentMood) {
        Mood.update(name, currentMood);
    };

    /**
     * Create all Schemas, mostly by constructing its model.js-files
     */
    setupSchema = function () {
        User.construct(mongoose);
        Token.construct(mongoose);
        Mood.construct(mongoose);
        Mood.create(nameGadget1);
        Mood.create(nameGadget2);
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
