'use strict';

function poll (DB) {

    var mongodb = require('mongodb');
    var mongoose = require('mongoose');


    //Functions
    var construct;
    var create;
    var update;
    var calculateResult;
    var calculateResultAnyway;
    var checkResponses;
    var startPoll;

    //Variables
    var pollModel;
    var pollSchema;
    var pollMongoose;
    var pollEnd;


    this.construct = function (mongoose) {
        return construct(mongoose);
    };

    this.create = function (type, sockets, connectionId, socket) {
        return create(type, sockets, connectionId, socket);
    };

    this.update = function (type, connectionId, socket, answer) {
        return update(type, connectionId, socket, answer);
    };

    this.startPoll = function (sockets, type, connectionId, socket) {
        return startPoll(sockets, type, connectionId, socket);
    };
    this.calculateResult = function (sockets, type) {
        return calculateResult(type);
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

        console.log('this is the new poll ----------- ' + newPoll);

        pollModel.findOne({type: type}, function(err, result) {
            if (result === null) {

                newPoll.save(function (err, result) {
                    if (err) {
                        console.log('New Poll could not be saved.');
                    } else {
                        //update of the answer list with the answer of the user who initiated the poll. His answer is always 'yes'
                        update(type, connectionId, socket, true);
                        DB.startPoll(sockets, type, connectionId, socket);
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
     * @param socket
     * @param answer - Boolean value true=yes, false=no.
     * @returns {*}
     */
    update = function (type, connectionId, socket, answer) {

        console.log('-------- ' + type + '   ' + connectionId + '   ' + answer);

        pollModel.findOne({type: type}, function (err, result) {
            if (err || result === null){
                console.log('No poll of this type ongoing anymore, your answer comes to late.');
            }else {
                console.log('the result: ' + result);
                var answers = result.answers;
                answers[connectionId] = answer;
            }

            pollModel.findOneAndUpdate({type: type}, {$set:{answers:answers}}, function (err) {
                if (err) {
                    console.log('Failed updating the Answers to the poll of type ' + type);
                } else {
                    console.log('Answer of gadget with the connection ID' + connectionId + ' has been added to the poll!');
                    checkResponses(socket,type);
                    //wait five minutes before finishing the poll automatically
                    pollEnd = setTimeout(function () { calculateResultAnyway(socket, type); }, 300000)                }
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
            socket.to(sockets[i]).emit('newPoll', {type: type});
            console.log('socket ' + sockets[i] + ' emited!');
        }

    };
    
    /**
     * Collects all answers from the joining gadgets and calculates the overall result.
     * @param socket: 
     * @param type: Type of the poll to calculate result for.
     */
    calculateResult = function (socket, type) {
        var positiveResponses = 0;
        var negativeResponses = 0;

        pollModel.findOne({type:type}, function(err, result) {
            if (err || result === null) {
                console.log('No poll found to calculate result for.');
            } else {
                var respondingUsers = Object.getOwnPropertyNames(result.answers);
                for (var i = 0; i<respondingUsers.length; i++) {
                    if (result.answers[respondingUsers[i]] === true) {
                        positiveResponses ++;
                    } else if (result.answers[respondingUsers[i]] === false) {
                        negativeResponses ++;
                    }
                }
                if (positiveResponses > negativeResponses) {
                    console.log('The poll ended positive');
                    DB.showPollResult(socket, socket.id, true);
                } else if (negativeResponses > positiveResponses) {
                    console.log('The poll ended negative');
                    DB.showPollResult(socket, socket.id, false);
                } else {
                    console.log('The poll ended with a tie');
                }
                //cleanup
                positiveResponses = 0;
                negativeResponses = 0;
                result.remove(function (err) {
                    if (err) {
                        console.log('Poll could not be removed from data model.');
                    } else {
                        console.log('Poll has been removed from data model.');
                    }
                });
            }
        });

    };

    /**
     * Calculates the result of the poll after five minutes without checking if all users responded.
     * @param socket:
     * @param type: Type of the poll to calculate result for.
     */
    calculateResultAnyway = function(socket, type) {
        pollModel.findOne({type: type}, function(err, result) {
            if (err){
                console.log('Pollsearch failed');
            } else if (result !== null){
                calculateResult(socket, type);
            }
        });
        calculateResult(socket, type);
        pollEnd = clearTimeout(calculateResultAnyway);
    };

    /**
     * Checks if all the users have yet responded to the poll.
     * @param socket: 
     * @param type: Type of the poll.
     */
    checkResponses = function (socket, type) {
        var responsesCount = 0;
        pollModel.findOne({type: type}, function(err, result) {
            if (err || result === null) {
                console.log('Poll of the type ' + type + ' not yet started.');
            } else {
                var invitedUsers = Object.getOwnPropertyNames(result.answers);
                for(var i=0; i<invitedUsers.length; i++) {
                    if(result.answers[invitedUsers[i]] !== null) {
                        responsesCount ++;
                        if(responsesCount === invitedUsers.length){
                            calculateResult(socket, type);
                        }
                    }
                }
            }
        });
    };


}

module.exports = poll;