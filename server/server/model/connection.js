'use strict';

function connection (DB) {

    // functions
    var construct;
    var create;
    var deleteConnection;
    var findConnectionToDelete;
    var findConnectionAndChangeMood;

    // variables
    var connectionModel;
    var connectionSchema;
    var connectionMongoose;
    var self = this;

    this.TYPE_GADGET = 'gadget';
    this.TYPE_USER = 'user';
    this.TYPE_UNDEFINED = 'undefined';

    this.construct = function (mongoose) {
        return construct(mongoose);
    };

    this.create = function (connectionId, id, type) {
        return create(connectionId, id, type, false);
    };

    this.deleteConnection = function (connectionId) {
        return deleteConnection(connectionId);
    };

    this.findConnectionToDelete = function (connectionId, callback) {
        return findConnectionToDelete(connectionId, callback);
    };

    this.update = function (connectionId, type, id) {
        return create(connectionId, type, id, true);
    };
    
    this.findConnectionAndChangeMood = function (connectionId, currentMood) {
        return findConnectionAndChangeMood(connectionId, currentMood);
    };


        /**
         * Construct the ConnectionsSchema and the ConnectionsModel.
         * Do it the mongoose way.
         *
         * @param mongoose
         */
        construct = function (mongoose) {

            connectionMongoose = mongoose;

            var Schema = connectionMongoose.Schema;

            connectionSchema = new Schema({
                connectionId: String,
                userId: String,
                gadgetId: Number
            });

            connectionModel = connectionMongoose.model('connectionModel', connectionSchema);
            console.log('constructed the connectionModel!');
        };

        /**
         * Creates the connections Model.
         * @param connectionId: ID of the connection which should be assigned.
         * @param id: ID of the user or gadget which is using the connection.
         *
         * @returns {*}
         */
        create = function (connectionId, id, type, update) {
            
            var model;
            var saveModel = function (connModel, err, result) {
                console.log('create connectionModel');

                if (result === null) {
                    connModel.save(function (err, result) {
                        if (err) {
                            console.log('Connection could not be created in DB!');
                        } else {
                            console.log(result);
                        }
                    });
                } else {
                    console.log('Connection ID found already in the database!');
                }
            };

            if (update) {
                saveModel = function (connModel, err, result) {
                    console.log('update connectionModel');
                    console.log(result);

                    // if (!result) {
                    //     connModel.save(function (err, result) {
                    //         if (err) {
                    //             console.log('Connection could not be created in DB!');
                    //         } else {
                    //             console.log(result);
                    //         }
                    //     });
                    // } else {
                        connectionModel.findOneAndUpdate(
                            {connectionId: connectionId},
                            {$set: {
                                gadgetId: connModel.gadgetId,
                                userId: id
                            }}, function (err) {
                                if (err) {
                                    console.log(connectionId + ' does not yet exist in the DB!');
                                } else {
                                    console.log('Connection ' + connectionId + ' is updated!');
                                }
                            }
                        );
                    // }
                }
            }

            if (type === self.TYPE_UNDEFINED) {

                // create new connection
                model = new connectionModel({
                    connectionId: connectionId,
                    gadgetId: null,
                    userId: null
                });

                connectionModel.findOne({connectionId: connectionId}, function(err, result) {
                    saveModel(model, err, result);
                });
            } else if (type === self.TYPE_GADGET) {

                // create connection for this gadget
                model = new connectionModel({
                    connectionId: connectionId,
                    gadgetId: id,
                    userId: null
                });

                connectionModel.findOne({gadgetId: id}, function(err, result) {
                    saveModel(model, err, result);
                });

            } else if (type === self.TYPE_USER) {

                // add new connection for this user.
                model = new connectionModel({
                    connectionId: connectionId,
                    gadgetId: null,
                    userId: id
                });

                connectionModel.findOne({userId: id}, function(err, result) {
                    saveModel(model, err, result);
                });
            }
        };

        /**
         * Searches for the socketId which is using a certain connection atm.
         *
         * @param connectionId: ID of connection.
         * @returns {*}
         */
        findConnectionToDelete = function (connectionId, callback) {
            connectionModel.findOne({connectionId: connectionId}, function (err, result) {
                callback(err, result);
            });
        };

        /**
         * Searches the gadgetId for a certain connection to change mood of the person using it.
         *
         * @param connectionId: ID of connection.
         * @param currentMood: The mood the user wants to set.
         * @returns {*}
         */
        findConnectionAndChangeMood = function (connectionId, currentMood) {
            connectionModel.findOne({connectionId: connectionId}, function (err, result) {
                if (err){
                    console.log('no gadget connection found - unable to change mood!');
                }else {
                    DB.changeMoodFinally(result.gadgetId, currentMood);
                }
            });
        };


        /**
         * Drops a connection which is not used anymore.
         *
         * @param connectionId: ID of the unused connection.
         * @returns {*}
         */
        deleteConnection = function (connectionId) {
            connectionModel.findOne({ connectionId : connectionId}, function (err, model) {
                if (err) {
                    console.log('No open connection with this ID.');
                } else {
                    if (model) {
                        model.remove(function (err) {
                            if (err) {
                                console.log('Model could not be deleted from DB.');
                            } else {
                                console.log('Connection successfully deleted!');
                            }
                        });
                    }
                }
            });
        };


    }


    module.exports = connection;