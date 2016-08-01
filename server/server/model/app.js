'use strict';

function app () {

    // functions
    var construct;
    var create;
    var getAll;

    // variables
    var appModel;
    var appSchema;
    var appMongoose;
    var self = this;

    // constants

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.construct  = function (mongoose) { return construct(mongoose); };
    this.create     = function (appObject) { return create(appObject); };
    this.getAll     = function (callback) { return getAll(callback); };

    /* ======================================================================
     * Private functions
     * ====================================================================== */
    /**
     * Construct the AppSchema and the AppModel.
     * Do it the mongoose way.
     *
     * @param mongoose
     */
    construct = function (mongoose) {

        appMongoose = mongoose;

        var Schema = appMongoose.Schema;

        appSchema = new Schema({
            name: String,
            description: String,
            settings: String
        });

        appModel = appMongoose.model('appModel', appSchema);
        console.log('constructed the appModel!');
    };

    /**
     * Save a new app in the database.
     * @param appObject
     */
    create = function (appObject) {
        var appToSave = new appModel({
            name: appObject.name,
            description: appObject.description,
            settings: JSON.stringify(appObject.settings)
        });

        appModel.findOne({name: appObject.name}, function(err, result) {

            if (result === null) {
                appToSave.save(function (err, result) {
                    if (err) {
                        console.log('App ' + appObject.name + ' could not be created');
                    } else {
                        console.log(result);
                    }
                });
            } else {
                console.log('The app ' + appObject.name + ' is already created in DB');
            }
        });
    };

    /**
     * Get all apps
     * @param callback: call with the result of the apps
     *
     * @returns {*}
     */
    getAll = function (callback) {
        appModel.find({}, function (err, result) {
            callback(err, result);
        });
    };
}

module.exports = app;