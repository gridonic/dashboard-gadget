'use strict';

function connections (DB) {

    // functions
    var construct;
    var create;
    var deleteConnection;
    var findConnectionToDelete;

    // variables
    var connectionsModel;
    var connectionsSchema;
    var connectionsMongoose;

    this.construct = function (mongoose) {
        return construct(mongoose);
    };
    this.create = function (connectionId, gadgetId) {
        return create(connectionId, gadgetId);
    };
    this.deleteConnection = function (connectionId) {
        return deleteConnection(connectionId);
    };
    this.findConnectionToDelete = function (connectionId) {
        return findConnectionToDelete(connectionId);
    };


        /**
         * Construct the ConnectionsSchema and the ConnectionsModel.
         * Do it the mongoose way.
         *
         * @param mongoose
         */
        construct = function (mongoose) {

            connectionsMongoose = mongoose;

            var Schema = connectionsMongoose.Schema;

            connectionsSchema = new Schema({
                connectionId: String,
                gadgetId: Number
            });

            connectionsModel = connectionsMongoose.model('connectionsModel', connectionsSchema);
            console.log('constructed the connectionsModel!');
        };

        /**
         * Creates the connections Model.
         * @param connectionId: ID of the connection which should be assigned.
         * @param gadgetId: ID of the gadget which is using the connection.
         *
         * @returns {*}
         */
        create = function (connectionId, gadgetId) {

            var createdGadget = new connectionsModel({
                connectionId: connectionId,
                gadgetId: gadgetId
            });

            connectionsModel.findOne({gadgetId: gadgetId}, function(err, result) {

                if (result === null) {
                    createdGadget.save(function (err, result) {
                        if (err) {
                            console.log('Connection could not be created in DB!');
                        } else {
                            console.log(result);
                        }
                    });
                } else {
                    console.log('Gadget is already linked to another connection!');
                }
            });

        };

        /**
         * Searches for the socketId which is using a certain connection atm.
         *
         * @param connectionId: ID of connection.
         * @returns {*}
         */
        findConnectionToDelete = function (connectionId) {
            connectionsModel.findOne({connectionId: connectionId}, function (err, result) {
                if(result!=null){
                    DB.deactivateGadget(connectionId, result.gadgetId);
                }else{
                    console.log('Connection not found in DB.')
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
            connectionsModel.findOne({ connectionId : connectionId}, function (err, model) {
                if (err) {
                    console.log('No open connection with this ID.');
                }else {
                    console.log(model);
                    model.remove(function (err) {
                        if (err) {
                            console.log('Model could not be delted from DB.');
                        } else {
                            console.log('Connection succesfully deleted!');
                        }
                    });
                }
            });
        };


    }


    module.exports = connections;