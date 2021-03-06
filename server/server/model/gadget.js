'use strict';

function gadget (DB) {

    // functions
    var construct;
    var create;
    var update;
    var activateGadget;
    var deactivateGadget;
    var findGadgetById;

    // variables
    var gadgetModel;
    var gadgetSchema;
    var gadgetMongoose;

    this.activateGadget     = function (id) { return activateGadget(id); };
    this.construct          = function (mongoose) { return construct(mongoose); };
    this.create             = function (gadgetName) { return create(gadgetName); };
    this.deactivateGadget   = function (id) { return deactivateGadget(id); };
    this.findGadgetById     = function (id, callback) { return findGadgetById(id, callback); };
    this.update             = function (gadgetName, userId, userName) { return update(gadgetName, userId, userName); };

    /**
     * Changes the gadget status to active.
     *
     * @param id - Integer value with the gadget number.
     * @returns {*}
     */
    activateGadget = function (id) {
        gadgetModel.findOneAndUpdate({gadgetId: id}, {$set: {gadgetIsRunning: 1}}, function (err) {
            if (err) {
                console.log(id + ' does not yet exist in the DB!');
            } else {
                console.log('Gadget ' + id + ' is now active!');
            }
        });
    };

    /**
     * Construct the MoodSchema and the MoodModel.
     * Do it the mongoose way.
     *
     * @param mongoose
     */
    construct = function (mongoose) {

        gadgetMongoose = mongoose;

        var Schema = gadgetMongoose.Schema;

        gadgetSchema = new Schema({
            gadgetId: Number,
            gadgetIsRunning: Number,
            lastUser: String,
            lastUserName: String
        });

        gadgetModel = gadgetMongoose.model('gadgetModel', gadgetSchema);
        console.log('constructed the gadgetModel!');
    };

    /**
     * Creates the default mood Model.
     *@param gadgetName: Integer value, also called gadget ID.
     *@param userName: User to which the gadget should be linked.
     * 
     * @returns {*}
     */
    create = function (gadgetName, userName) {

        var createdGadget = new gadgetModel({
            gadgetId: gadgetName,
            gadgetIsRunning: 0,
            lastUser: userName
        });

        gadgetModel.findOne({gadgetId: gadgetName}, function(err, result) {

            if (result === null) {
                createdGadget.save(function (err, result) {
                    if (err) {
                        console.log('Gadget could not be created in DB!');
                    } else {
                        console.log(result);
                    }
                });
            } else {
                console.log('Gadget already existing in DB');
            }
        });
    };

    /**
     * Changes the gadget status to inactive.
     *
     * @param id - Integer value with the gadget number.
     * @returns {*}
     */
    deactivateGadget = function (id) {
        gadgetModel.findOneAndUpdate({gadgetId: id}, {$set: {gadgetIsRunning: 0}}, function (err) {
            if (err) {
                console.log(id + ' does not yet exist in the DB!');
            } else {
                console.log('Gadget ' + id + ' is now inactive again!');
            }
        });
    };

    findGadgetById = function (id, callback) {
        gadgetModel.findOne({gadgetId: id}, function (err, result) {
            callback(err, result);
        });
    };

    /**
     * Changes the gadget of a user.
     *
     *@param gadgetName: Integer value, also called gadget ID.
     *@param userId: ID of the user which should be linked to the gadget.
     *@param userName: Name of the user which should be linked to the gadget.
     * @returns {*}
     */
    update = function (gadgetName, userId, userName) {

        gadgetModel.findOneAndUpdate({gadgetId: gadgetName}, {$set:{lastUser:userId, lastUserName:userName}}, function (err) {
            if (err) {
                // an error occured
                console.log(gadgetName + ' does not yet exist in the DB!');
            } else {
                console.log('Gadget ' + gadgetName + ' is now linked to ' + userName);
            }
        });

    };

}


module.exports = gadget;
    

