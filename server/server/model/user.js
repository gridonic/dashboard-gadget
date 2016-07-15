'use strict';

function user (DB) {

    // functions
    var construct;
    var create;
    var getUser;
    var findUserByUsername;
    var findUserForLogin;
    var bcrypt = require('bcrypt');
    var token = require('./token.js');


    // variables
    var userModel;
    var userSchema;
    var userMongoose;
    var Token = new token(this);

    //constants
    const saltRounds = 10;


    this.construct = function (mongoose) { return construct(mongoose); };
    this.findUserByUsername = function (username, password, callback) { return findUserByUsername(username, password, callback); };
    this.findUserForLogin = function (username, password) {return findUserForLogin(username, password);};
    this.create = function (username, password, callback) { return create(username, password, callback); };
    this.getUser = function (username, password, callback) { return getUser(username, password, callback); };

    /**
     * Construct the UserSchema and the UserModel.
     * Do it the mongoose way.
     *
     * @param mongoose
     */
    construct = function (mongoose) {

        userMongoose = mongoose;

        var Schema = userMongoose.Schema;

        userSchema = new Schema({
            username: String,
            id: Number,
            password: String,
            appActivated: Array,
            appSettings: Array,
            gadgetId: Number,
            actualMoodId: Number,
            actualProjectId: Number
        });

        userSchema.methods.sayHello = function () {
            var greeting = this.username ? "Hello! My username is " + this.username : "Ouch, I don't have a username";
            console.log(greeting);
        };

        userModel = userMongoose.model('userModel', userSchema);
        console.log('constructed the userModel!');
    };

    /**
     * Create a user by its username and password.
     *
     * @param username
     * @param password
     * @returns {*}
     */
    create = function (username, password, callback) {

        var hashedPassword = bcrypt.hashSync(password, saltRounds);

        var createdUser = new userModel({
            username: username,
            password: hashedPassword
        });

        createdUser.save(function (err, createdUser) {
            if (err) {
                console.log('could not save createdUser.');
                console.log(err);
                callback(false);
                return false;
            }

            callback(true);
            createdUser.sayHello();
        });
    };

    getUser = function (username, password, callback) {
        userModel.find({username: username}, function (err, result) {
            var user = result[result.length - 1];
            console.log(user);
            var hashedPassword = bcrypt.hashSync(password, saltRounds);

            if (user.password != hashedPassword) {
                user.password = null;
                callback(user);
            } else {
                callback(null);
            }
        });

    };

    /**
     * Check if a user with username already exists.
     * @param username: we want to find
     * @param password:  we need the password for sending it to the callback.
     * @param callback: call this after creating the user
     */
    findUserByUsername = function (username, password, callback) {
        userModel.find({username: username}, function (err, result) {
            DB.createUserFinally(err, result, username, password, callback);
        });
    };

    /**
     * Compare the input data with the data in Database.
     * @param username: we want to compare.
     * @param password:  we want to compare.
     */
    findUserForLogin = function (username, password) {
        userModel.findOne({username: username}, function (err, result) {
            if(result === null){
                console.log('User not found - create a new User before try to login!');
            }else {
                var foundId = result._id;
                if (bcrypt.compareSync(password, result.password)) {
                    DB.validateToken(foundId, username);
                } else {
                    console.log('wrong pw');
                }
            }

        });
    };
    
    
}

module.exports = user;