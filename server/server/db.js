'use strict';

var mongodb = require('mongodb');
// var MongoClient = mongodb.MongoClient;
var mongoose = require('mongoose');
var user = require('./model/user.js');

function db () {

    // functions
    var initDB;
    var setupSchema;
    var createUser;
    // var create;
    // var loginUser;

    // variables
    var url = 'mongodb://localhost:9999/test';
    var User = new user();
    var connected = false;

    // global / public functions
    this.createUser = function (username, password) { return createUser(username, password); };

    /* ======================================================================
     * start the private functions
     * ====================================================================== */

    /**
     * Create a user if we does not exist.
     *
     * @param username
     * @param password
     * @returns {boolean}
     */
    createUser = function (username, password) {
        
        if (!connected) {
            return false;
        }
        
        // todo: check if user already exists!

        var createdUser = User.create(username, password);
        return createdUser;
    };
    

    setupSchema = function () {
        User.construct(mongoose);
    };

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

    initDB();
}

module.exports = db;
