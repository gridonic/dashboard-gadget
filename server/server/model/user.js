'use strict';

function user (ModelHandler) {

    // Functions
    var construct;
    var create;
    var getUser;
    var findUserByUsername;
    var findUserForLogin;
    var addGadgetToUser;
    var updateUserSettings;

    // Other modules
    var bcrypt = require('bcrypt');
    var jwt = require('jsonwebtoken');

    // Variables
    var userModel;
    var userSchema;
    var userMongoose;

    // Constants
    const saltRounds = 10;
    const key = 'OU8B70JF5XJy4Cq4';

    /* =====================================================================
     * Public functions
     * ===================================================================== */

    this.addGadgetToUser        = function(username, gadget, callback) {return addGadgetToUser(username, gadget, callback);};
    this.construct              = function (mongoose) { return construct(mongoose); };
    this.create                 = function (username, password, callback) { return create(username, password, callback); };
    this.findUserByUsername     = function (username, password, callback) { return findUserByUsername(username, password, callback); };
    this.findUserForLogin       = function (username, password, finalCallback, callback) { return findUserForLogin(username, password, finalCallback, callback); };
    this.getUser                = function (username, password, callback) { return getUser(username, password, callback); };
    this.updateUserSettings     = function (username, settings, callback) { return updateUserSettings(username, settings, callback); };

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
            userSettings: String,
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
                    callback(foundId, result.userSettings);
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

    /**
     * Update user settings, overrides old settings, returns new settings.
     *
     * @param username
     * @param settings
     * @param callback
     */
    updateUserSettings = function (username, settings, callback) {

        var updatedSettings = settings;
        var harvestPassword = updatedSettings['setting-harvest-password'];
        var settingsString;

        try {
            jwt.verify(harvestPassword, key);
        } catch (e) {
            harvestPassword = jwt.sign({password: harvestPassword}, key);
            updatedSettings['setting-harvest-password'] = harvestPassword;
        }

        settingsString = JSON.stringify(updatedSettings);
        userModel.findOneAndUpdate({username: username}, {$set: {userSettings: settingsString}}, {new: true}, function (err, result) {
            callback(JSON.parse(result.userSettings));
        });
    };
    
    
}

module.exports = user;
