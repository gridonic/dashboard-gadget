'use strict';

function mood (DB) {

    // functions
    var construct;
    var create;
    var update;

    // variables
    var moodModel;
    var moodSchema;
    var moodMongoose;

    this.construct = function (mongoose) {
        return construct(mongoose);
    };
    this.create = function (gadgetName) {
        return create(gadgetName);
    };
    this.update = function (name, currentMood) {
        return update(name, currentMood);
    };

    /**
     * Construct the MoodSchema and the MoodModel.
     * Do it the mongoose way.
     *
     * @param mongoose
     */
    construct = function (mongoose) {

        moodMongoose = mongoose;

        var Schema = moodMongoose.Schema;

        moodSchema = new Schema({
            name: String,
            currentMood: Number
        });

        moodModel = moodMongoose.model('moodModel', moodSchema);
        console.log('constructed the moodModel!');
    };

    /**
     * Creates the default mood Model.
     *
     * @returns {*}
     */
    create = function (gadgetName) {

        var defaultMood = new moodModel({
            name: gadgetName,
            currentMood: 1
        });

        moodModel.findOne({name: gadgetName}, function(err, result) {

            if (result === null) {
                defaultMood.save(function (err, result) {
                    if (err) {
                        console.log('Default mood not created');
                    } else {
                        console.log(result);
                    }
                });
            } else {
                console.log('Gadget already created in DB');
            }
        });

    };

    /**
     * Changes the mood of a user.
     *
     * @param name - Static Name of the gadget e.g. '2'.
     * @param currentMood - Integer value which is linked to a specific mood status.
     * @returns {*}
     */
    update = function (name, currentMood) {

        var changedMood = new moodModel({
            name: name,
            currentMood: currentMood

        });

        moodModel._findOneAndUpdate({name: name}, changedMood, function (err) {
            if (err) {
                console.log('Failed changing the mood of ' + name);
            } else {
                console.log(name + ' is changed to mood ' + currentMood);
            }
        });

    };

}

module.exports = mood;