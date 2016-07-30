'use strict';

function connection (ModelHandler) {

    // functions
    var construct;
    var create;
    var deleteConnection;
    var findConnectionToDelete;
    var findConnectionAndChangeMood;
    var getGadgetArray;

    // variables
    var connectionModel;
    var connectionSchema;
    var connectionMongoose;
    var self = this;

    // constants
    this.TYPE_GADGET = 'gadget';
    this.TYPE_USER = 'user';
    this.TYPE_UNDEFINED = 'undefined';

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.construct                      = function (mongoose) { return construct(mongoose); };
    this.create                         = function (connectionId, id, type) { return create(connectionId, id, type, false); };
    this.deleteConnection               = function (connectionId) { return deleteConnection(connectionId); };
    this.findConnectionAndChangeMood    = function (connectionId, currentMood) { return findConnectionAndChangeMood(connectionId, currentMood); };
    this.findConnectionToDelete         = function (connectionId, callback) { return findConnectionToDelete(connectionId, callback); };
    this.getGadgetArray                 = function (connectionId, type, socket) { return getGadgetArray(connectionId, type, socket); };
    this.update                         = function (connectionId, id, type) { return create(connectionId, id, type, true); };

    /* ======================================================================
     * Private functions
     * ====================================================================== */
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
                        console.log('Connection could not be created in database!');
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
                //             console.log('Connection could not be created in database!');
                //         } else {
                //             console.log(result);
                //         }
                //     });
                // } else {
                    connectionModel.findOneAndUpdate(
                        {connectionId: connectionId},
                        {$set: {
                            gadgetId: connModel.gadgetId,
                            userId: connModel.userId
                        }}, function (err) {
                            if (err) {
                                console.log(connectionId + ' does not yet exist in the database!');
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
                            console.log('Model could not be deleted from database.');
                        } else {
                            console.log('Connection successfully deleted!');
                        }
                    });
                }
            }
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
                ModelHandler.changeMoodFinally(result.gadgetId, currentMood);
            }
        });
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
     * Sends back an Array with all the gadget connections to start a poll.
     *
     * @param connectionId: Socket ID of the gadget who started the poll.
     * @param type: Specific type of the poll.
     * @param socket:
     * @returns {*}
     */
    getGadgetArray = function (connectionId, type, socket) {
        var query = connectionModel.find({$and: [ {connectionId: {'$ne':connectionId}}, {gadgetId: {'$ne': null}}]}).select('connectionId -_id');
        query.exec(function (err, result) {
            if (err){
                console.log('no gadget other gadget connected at the moment, no poll possible.');
            }else {
                var gadgets = [];
                for(var i=0; i< result.length; i++) {
                    gadgets.push(result[i].connectionId);
                }
                ModelHandler.createPollFinally(gadgets, type, connectionId, socket);
            }
        });
    };
}

module.exports = connection;