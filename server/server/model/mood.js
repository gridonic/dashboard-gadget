'use strict';

function mood (DB) {

    // functions
    var construct;
    var create;
    var getMoodColor;
    var update;

    // variables
    var moodModel;
    var moodSchema;
    var moodMongoose;

    var moodColors = {
        '1':    0   + '|' + 0   + '|' + 128,    // navy
        '2':    0   + '|' + 128 + '|' + 128,    // teal
        '3':    0   + '|' + 255 + '|' + 0,      // lime
        '4':    128 + '|' + 0   + '|' + 0,      // maroon
        '5':    128 + '|' + 0   + '|' + 128,    // purple
        '6':    128 + '|' + 128 + '|' + 128,    // gray
        '7':    255 + '|' + 255 + '|' + 0,      // yellow
        '8':    255 + '|' + 255 + '|' + 255,    // white
    };

    this.construct      = function (mongoose) { return construct(mongoose); };
    this.create         = function (gadgetName) { return create(gadgetName); };
    this.getMoodColor   = function (name, callback) { return getMoodColor(name, callback); };
    this.update         = function (name, currentMood, callback) { return update(name, currentMood, callback); };

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
     * Get the current mood by a name.
     *
     * @param name
     * @param callback
     */
    getMoodColor = function (name, callback) {
        moodModel.findOne({name: name}, function (err, result) {
            if (err) {
                // todo: handle Error
            } else {
                callback(moodColors[result.currentMood]);
            }
        });
    };

    /**
     * Changes the mood of a user.
     *
     * @param name - Static Name of the gadget e.g. '2'.
     * @param currentMood - Integer value which is linked to a specific mood status.
     * @param callback - call to update mood finally
     * @returns {*}
     */
    update = function (name, currentMood, callback) {
        
        moodModel.findOneAndUpdate({name: name}, {$set:{currentMood:currentMood}}, function (err) {
            if (err) {
                console.log('Failed changing the mood of ' + name);
            } else {
                console.log('Gadget ' + name + ' is changed to mood ' + currentMood);
                if (typeof callback === 'function') {
                    callback();
                }
            }
        });

    };

}

module.exports = mood;