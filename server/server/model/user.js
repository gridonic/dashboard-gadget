'use strict';

function user (ModelHandler) {

    // functions
    var construct;
    var create;
    var getUser;
    var findUserByUsername;
    var findUserForLogin;
    var addGadgetToUser;
    var getUserIdByUsername;
    var bcrypt = require('bcrypt');

    // variables
    var userModel;
    var userSchema;
    var userMongoose;

    //constants
    const saltRounds = 10;

    /* =====================================================================
     * Public functions
     * ===================================================================== */

    this.addGadgetToUser        = function(username, gadget, callback) {return addGadgetToUser(username, gadget, callback);};
    this.construct              = function (mongoose) { return construct(mongoose); };
    this.create                 = function (username, password, callback) { return create(username, password, callback); };
    this.findUserByUsername     = function (username, password, callback) { return findUserByUsername(username, password, callback); };
    this.findUserForLogin       = function (username, password, finalCallback, callback) { return findUserForLogin(username, password, finalCallback, callback); };
    this.getUser                = function (username, password, callback) { return getUser(username, password, callback); };


    /* =====================================================================
     * Private functions
     * ===================================================================== */

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
            ModelHandler.createUserFinally(err, result, username, password, callback);
        });
    };

    /**
     * Compare the input data with the data in Database.
     * @param username: we want to compare.
     * @param password:  we want to compare.
     * @param finalCallback: the final callback, call this when you get an error.
     * @param callback: Call this for errors or on success.
     */
    findUserForLogin = function (username, password, finalCallback, callback) {
        userModel.findOne({username: username}, function (err, result) {
            if (result === null) {
                finalCallback(false, {message: 'User not found - create a new User before try to login!'});
            } else {
                var foundId = result._id;
                if (bcrypt.compareSync(password, result.password)) {
                    callback(foundId);
                } else {
                    finalCallback(false, {message: 'The password does not match.'});
                }
            }

        });
    };

    /**
     * Adds the gadget the user has choosen to his user account.
     * @param username: we want to add a gadget for.
     * @param gadget: the user's gadget.
     * @param callback: call when you find an error or you have finished everything.
     */
    addGadgetToUser = function (username, gadget, callback) {
        userModel.findOneAndUpdate({username: username}, {$set: {gadgetId: gadget}}, function (err) {
            callback(err);
        });
    };
    
    
}

module.exports = user;
