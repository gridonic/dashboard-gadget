'use strict';

function gadget (DB) {

    // functions
    var construct;
    var create;
    var update;
    var activateGadget;

    // variables
    var gadgetModel;
    var gadgetSchema;
    var gadgetMongoose;

    this.construct = function (mongoose) {
        return construct(mongoose);
    };
    this.create = function (gadgetName) {
        return create(gadgetName);
    };
    this.update = function (name, currentMood) {
        return update(name, currentMood);
    };
    this.activateGadget = function (gadgetName) {
        return activateGadget(gadgetName);
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
            lastUser: Number
        });

        gadgetModel = gadgetMongoose.model('gadgetModel', gadgetSchema);
        console.log('constructed the gadgetModel!');
    };

    /**
     * Creates the default mood Model.
     *@param gadgetName: An integer value, also called gadget ID.
     *@param userName: The user to which the gadget should be linked.
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
     * Changes the mood of a user.
     *
     * @param gadgetName - Integer value with the gadget number.
     * @param userName - Name of the user the gadget should be linked with after the change.
     * @returns {*}
     */
    update = function (gadgetName, userName) {

        gadgetModel.findOneAndUpdate({gadgetId: gadgetName}, {$set:{lastUser:userName}}, function (err) {
            if (err) {
                console.log(gadgetName + ' does not yet exist in the DB!');
            } else {
                console.log('Gadget ' + gadgetName + ' is now linked to ' + userName);
            }
        });

    };

    /**
     * Changes the gadget status to active.
     *
     * @param gadgetName - Integer value with the gadget number.
     * @returns {*}
     */
    activateGadget = function (gadgetName) {

        gadgetModel.findOneAndUpdate({gadgetId: gadgetName}, {$set:{gadgetIsRunning:1}}, function (err) {
            if (err) {
                console.log(gadgetName + ' does not yet exist in the DB!');
            } else {
                console.log('Gadget ' + gadgetName + ' is now active!');
            }
        });

    };

}


module.exports = gadget;
    

