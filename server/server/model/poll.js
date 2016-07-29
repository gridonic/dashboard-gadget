'use strict';

function poll (DB) {

    var mongodb = require('mongodb');
    var mongoose = require('mongoose');


    //Functions
    var construct;
    var create;
    var update;
    var calculateResult;
    var checkResponses;
    var drawResult;
    var startPoll;

    //Variables
    var pollModel;
    var pollSchema;
    var pollMongoose;
    var timeout;


    this.construct = function (mongoose) {
        return construct(mongoose);
    };

    this.create = function (type, sockets, connectionId, socket) {
        return create(type, sockets, connectionId, socket);
    };

    this.update = function (name, currentMood) {
        return update(name, currentMood);
    };

    this.startPoll = function (socketArray, type, connectionId, socket) {
        return startPoll(socketArray, type, connectionId, socket);
    };
    this.calculateResult = function (socketId, answer) {
        return calculateResult(socketId, answer);
    };
    this.checkResponses = function (sockets, type) {
        return checkResponses(sockets, type);
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
            started: Boolean,
            answers: {}
        });

        pollModel = pollMongoose.model('pollModel', pollSchema);
        console.log('constructed the pollModel!');
    };

    /**
     * Creates a new poll in DB.
     *
     * @returns {*}
     */
    create = function (type, sockets, connectionId, socket) {

        var participants = {};
        
        //all the sockets who are connected except the one which started the poll.

        participants[connectionId] = true;

        for (var i=0; i<sockets.length; i++){
            participants[sockets[i]] = null;
        }

        var newPoll = new pollModel({
            type: type,
            status: false,
            answers: participants
        });

        pollModel.findOne({name: type}, function(err, result) {

            if (result === null) {
                newPoll.save(function (err, result) {
                    if (err) {
                        console.log('New Poll could not be saved.');
                    } else {
                        console.log(result);
                        startPoll(sockets, type, connectionId, socket);
                    }
                });
            } else {
                console.log('Poll of this type already ongoing.');
            }
        });

        //update of the answer list with the answer of the user who initiated the poll. His answer is always 'yes'
        update(type, connectionId, true);

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

        console.log('-------- ' + type + '   ' + connectionId + '   ' + answer);

        pollModel.findOne({type: type}, function (err, result) {
            if (err){
                console.log('No poll of this type ongoing anymore, your answer comes to late.');
            }else {
                var answers = result.answers;
                answers[connectionId] = answer;
            }

            pollModel.findOneAndUpdate({type: type}, {$set:{answers:answers}}, function (err) {
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
     * @param sockets: Array of all sockets connected to the server except the one who started the poll.
     * @param type: Type of the poll the user wants to start via gadget.
     * @param connectionId: Connection ID of the gadget who started the poll.
     * @param socket:
     */
    startPoll = function (sockets, type, connectionId, socket) {
        for (var i = 0; i<sockets.length; i++) {
            console.log(sockets[i]);
            socket.to(sockets[i]).emit('show', {type: type});
        }

    };
    

    /**
     * Collects all answers from the joining gadgets and calculates the overall result.
     * @param socketId: Id of the gadget the specific answer comes from.
     * @param answer: Either 'true' for positive or 'false' for negative answer.
     */
    calculateResult = function (socketId, answer) {
        timeout = setTimeout(function () { alert("Waiting for results"); }, 300000);

        

    };

    /**
     * Checks if all the users have yet responded to the poll.
     * @param sockets: All the sockets the poll has been sent to.
     * @param type: Type of the poll.
     */
    checkResponses = function (sockets, type) {
        var positiveResponsesCount = 0;
        pollModel.findOne({name: type}, function(err, result) {
            if (err) {
                console.log('Poll of the type ' + type + ' not yet started.');
            } else {
                for(var i=0; i<sockets.length; i++) {
                    if(result[sockets[i]] !== null) {
                        positiveResponsesCount ++;
                    }
                }
            }
        });

        if(positiveResponsesCount === sockets.length) {
            calculateResult(type);
        }

    };

}

module.exports = poll;