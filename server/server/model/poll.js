'use strict';

function poll (DB) {

    var mongodb = require('mongodb');
    var mongoose = require('mongoose');


    //Functions
    var construct;
    var create;
    var update;
    var calculateResult;
    var drawResult;
    var startPoll;

    //Variables
    var pollModel;
    var pollSchema;
    var pollMongoose;

    this.construct = function (mongoose) {
        return construct(mongoose);
    };

    this.create = function (type) {
        return create(type);
    };

    this.update = function (name, currentMood) {
        return update(name, currentMood);
    };

    this.startPoll = function (socketArray, type) {
        return startPoll(socketArray, type);
    };
    this.calculateResult = function (socketId, answer) {
        return calculateResult(socketId, answer);
    };


    /**
     * Constructs the PollSchema and the PollModel.
     * Do it the mongoose way.
     *
     * @param mongoose
     */
    construct = function (mongoose) {

        pollMongoose = mongoose;

        var Schema = pollMongoose.Schema;

        pollSchema = new Schema({
            type: String,
            answers: []
        });

        pollModel = pollMongoose.model('pollModel', pollSchema);
        console.log('constructed the pollModel!');
    };

    /**
     * Creates a new poll in DB.
     *
     * @returns {*}
     */
    create = function (type) {

        var newPoll = new pollModel({
            type: type,
            answers: []
        });

        pollModel.findOne({name: type}, function(err, result) {

            if (result === null) {
                newPoll.save(function (err, result) {
                    if (err) {
                        console.log('New Poll could not be saved.');
                    } else {
                        console.log(result);
                    }
                });
            } else {
                console.log('Poll of this type already ongoing.');
            }
        });

    };

    /**
     * Updates the poll table with answers coming in from the specific gadgets.
     *
     * @param type - Type of the poll the answer is for.
     * @param connectionId - Id of the connection the answer comes from.
     * @param answer - Boolean value true=yes, false=no.
     * @returns {*}
     */
    update = function (type, connectionId, answer) {

        var answerToAdd = JSON.parse({connectionId: answer});
        console.log('this answer:   ' + answerToAdd);

        pollModel.findOne({type: type}, function (err, result) {
            if (err){
                console.log('No poll of this type ongoing anymore, your answer comes to late.');
            }else {
                var arrayToUpdate = result.answers;
                arrayToUpdate.push(answerToAdd);
            }

            pollModel.findOneAndUpdate({type: type}, {$set:{answers:arrayToUpdate}}, function (err) {
                if (err) {
                    console.log('Failed updating the Answers to the poll of type ' + type);
                } else {
                    console.log('Answer of gadget with the connection ID' + connectionId + ' has been added to the poll!');
                }
            });
            
        });

    };

    /**
     * Starts the poll process due to gadget request.
     * @param socketArray: Contains the ID's of all other gadgets to get contacted with the poll.
     * @param type: Type of the poll the user wants to start via gadget.
     */
    startPoll = function (socketArray, type) {
        for (var i = 0; i<socketArray.length; i++){
            console.log(socketArray[i]);
        }
        create(type);

    };

    /**
     * Collects all answers from the joining gadgets and calculates the overall result.
     * @param socketId: Id of the gadget the specific answer comes from.
     * @param answer: Either 'true' for positive or 'false' for negative answer.
     */
    calculateResult = function (socketId, answer) {

    };

}

module.exports = poll;