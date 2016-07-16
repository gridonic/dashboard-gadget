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
    this.create = function () {
        return create();
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
    create = function () {

        moodModel.find({}, function (err, result) {
            if (err) {
                console.log('Could not load DB');
            } else if (result == null) {

                var defaultMoods = new moodModel({
                    name: 'Gadget1',
                    currentMood: 1

                });

                defaultMoods.save(function (err, result) {
                    if (err) {
                        console.log('Default moods not created');
                        console.log(err);
                        return false;
                    } else {
                        console.log(result);
                    }
                });

                var defaultMoods2 = new moodModel({
                    name: 'Gadget2',
                    currentMood: 1

                });

                defaultMoods2.save(function (err, result) {
                    if (err) {
                        console.log('Default moods 2 not created');
                        console.log(err);
                        return false;
                    } else {
                        console.log(result);
                    }

                });
            }
        })
    };

    /**
     * Changes the mood of a user.
     *
     * @param name - Static Name of the gadget e.g. 'Gadget2'.
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