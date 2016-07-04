'use strict';

var mongodb = require('mongodb');
var mongoose = require('mongoose');
var user = require('./model/user.js');

function db () {

    // functions
    var initDB;
    var setupSchema;
    var getUser
    var createUser;
    var createUserFinally;

    // variables
    var url = 'mongodb://localhost:9999/test';
    var User = new user(this);
    var connected = false;

    /* ======================================================================
     * Public functions
     * ====================================================================== */
    
    this.getUser = function (username, password, callback) { return getUser(username, password, callback); };
    this.createUser = function (username, password, callback) { return createUser(username, password, callback); };
    this.createUserFinally = function (err, result, username, password, callback) { return createUserFinally(err, result, username, password, callback); };

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
     * Create all Schemas, mostly by constructing its model.js-files
     */
    setupSchema = function () {
        User.construct(mongoose);
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
