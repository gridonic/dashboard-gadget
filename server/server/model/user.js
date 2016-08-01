'use strict';

function user (ModelHandler) {

    // Functions
    var addGadgetToUser;
    var changeAppOfUser;
    var construct;
    var create;
    var decodeHarvestPassword;
    var findUserByUsername;
    var findUserForLogin;
    var getUserApps;
    var getUser;
    var getUserByUsername;
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

    this.addGadgetToUser        = function(username, gadget, callback) { return addGadgetToUser(username, gadget, callback);};
    this.addAppToUser           = function (username, appId, appSettings, callback) { return changeAppOfUser(true, username, appId, appSettings, callback); };
    this.construct              = function (mongoose) { return construct(mongoose); };
    this.create                 = function (username, password, callback) { return create(username, password, callback); };
    this.decodeHarvestPassword  = function (password) { return decodeHarvestPassword(password); };
    this.findUserByUsername     = function (username, password, callback) { return findUserByUsername(username, password, callback); };
    this.findUserForLogin       = function (username, password, finalCallback, callback) { return findUserForLogin(username, password, finalCallback, callback); };
    this.getUser                = function (username, password, callback) { return getUser(username, password, callback); };
    this.getUserApps            = function (username, apps, callback) { return getUserApps(username, apps, callback); };
    this.getUserByUsername      = function (username, callback) { return getUserByUsername(username, callback); };
    this.removeAppFromUser      = function (username, appId, callback) { return changeAppOfUser(false, username, appId, null, callback); };
    this.updateUserSettings     = function (username, settings, callback) { return updateUserSettings(username, settings, callback); };

    /* =====================================================================
     * Private functions
     * ===================================================================== */

    changeAppOfUser = function (mode, username, appId, appSettings, callback) {
        userModel.findOne({username: username}, function (err, result) {
            if (err || result == null) {
                callback(false, null);
            } else {
                var model = result;
                var originalAppSettings = {};

                if (model.appSettings) {
                    originalAppSettings = JSON.parse(model.appSettings);
                }

                if (mode) {
                    if (model.appActivated.indexOf(appId) < 0) {
                        model.appActivated.push(appId);
                    }
                    originalAppSettings[appId] = appSettings;
                } else {
                    var index = model.appActivated.indexOf(appId);
                    if (index > -1) {
                        model.appActivated.splice(index, 1);
                    }
                    originalAppSettings[appId] = null;
                }

                model.appSettings = JSON.stringify(originalAppSettings);

                userModel.findOneAndUpdate(
                    {username: username},
                    {$set: {
                        appSettings: model.appSettings,
                        appActivated: model.appActivated
                    }},
                    {new: true},
                    function (err, result) {
                        if (err) {
                            callback(false, null);
                        } else {
                            callback(true, result);
                        }
                    }
                );
            }
        });
    };

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
            appSettings: String,
            gadgetId: Number,
            actualMoodId: Number,
            actualProjectId: Number,
            currentDisplay: String,
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

    decodeHarvestPassword = function (password) {
        try {
            var decoded = jwt.verify(password, key);
            return decoded.password;
        } catch (e) {
            return password;
        }
    };

    getUserApps = function (username, apps, callback) {
        userModel.findOne({username: username}, function (err, result) {
            if (err) {
                callback(apps);
            } else {

                var id;
                var i;
                var j;

                var activatedApps = result.appActivated;
                var individualAppSettings = result.appSettings;

                for (i = 0; i < activatedApps.length; i++) {
                    for (j = 0; j < apps.length; j++) {
                        id = apps[j]['_id'];
                        if (activatedApps[i] == id) {
                            apps[j].isActivated = true;
                            apps[j].userSettings = individualAppSettings[id];
                        }
                    }
                }

                callback(apps);
            }
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
     * The easy version of getUser or findUserByUsername without password or other callbacks.
     *
     * @param username
     * @param callback
     */
    getUserByUsername = function (username, callback) {
        userModel.findOne({username: username}, function (err, result) {
            if (result) {
                result.password = null;
                result.userSettings = result.userSettings ? result.userSettings : {};
            }

            callback(err, result);
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
                    callback(foundId, result.userSettings ? result.userSettings : '{}');
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
