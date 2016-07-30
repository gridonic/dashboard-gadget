'use strict';

function token (ModelHandler) {

    // functions
    var isValid;
    var construct;
    var create;
    var update;
    var getUserToken;

    // variables
    var tokenModel;
    var tokenSchema;
    var tokenMongoose;
    var jwt = require('jsonwebtoken');
    var key = 'nq77738ORmx5bbeb';

    /* =====================================================================
     * Public functions
     * ===================================================================== */

    this.getUserToken           = function (id, username, gadget, socketId, callback) {return getUserToken(id, username, gadget, socketId, callback); };
    this.construct              = function (mongoose) { return construct(mongoose); };
    this.create                 = function (id) { return create(id); };
    this.update                 = function (id) { return update(id); };

    /* =====================================================================
     * Private functions
     * ===================================================================== */

    /**
     * Check if token is valid.
     * @param token
     */
    isValid = function (token) {
        try {
            jwt.verify(token, key);
            return true;
        }
        catch (e) {
            return false;
        }
    };

    /**
     * Construct the TokenSchema and the TokenModel.
     * Do it the mongoose way.
     *
     * @param mongoose
     */
    construct = function (mongoose) {

        tokenMongoose = mongoose;

        var Schema = tokenMongoose.Schema;

        tokenSchema = new Schema({
            id: Number,
            token: String
        });

        tokenModel = tokenMongoose.model('tokenModel', tokenSchema);
        console.log('constructed the tokenModel!');
    };

    /**
     * Creates a token by user id in DB.
     *
     * Ich habe das mal angepasst, so dass es für mich korrekt aussieht, kannst du das bitte noch durchschauen? (TODO: Beni)
     *
     * @param id - Indicates the ID of the user we want to create a Token for.
     * @param callback - to call when token is created.
     */
    create = function (id, callback) {
        var token = jwt.sign({token: id}, key, {expiresIn: '10h'});

        var createdToken = new tokenModel({
            _id: id,
            token: token
        });
        
        createdToken.save(function (err, result) {
            if (err) {
                console.log('could not save createdToken.');
                console.log(err);
                callback(null);
            } else {
                callback(token);
            }
        });
    };

    /**
     * Creates a new token by user id in DB.
     * @param id - Indicates the ID of the user we want to create a Token for.
     * @param callback - To call with the updated token.
     */
    update = function (id, callback) {
        var token = jwt.sign({token: id}, key, {expiresIn: '10h'});

        var createdToken = new tokenModel({
            _id: id,
            token: token
        });

        tokenModel.findOneAndUpdate({_id: id}, createdToken, function (err) {
            if (err) {
                console.log('Failed creating a new Token for User ID: ' + id);
                callback(null);
            } else {
                console.log('New Token for User ID: ' + id + ' is token: ' + token);
                callback(token);
            }
        });
    };


    /**
     * Compare the input data with the data in Database.
     * @param id: id of the user.
     * @param callback: Call this with the new token.
     */
    getUserToken = function (id, callback) {
        tokenModel.findOne({_id: id}, function (err, result) {
            if (result == null) {
                // No token found for this user-id. Create one.
                create(id, callback);
            } else {
                var foundToken = result.token;

                if (isValid(foundToken)) {
                    callback(foundToken);
                } else {
                    update(id, callback);
                }
            }
        });
    };
}

module.exports = token;