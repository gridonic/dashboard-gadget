'use strict';

function token () {

    // functions
    var construct;
    var create;

    // variables
    var tokenModel;
    var tokenSchema;
    var tokenMongoose;
    var jwt = require('jsonwebtoken');

    this.construct = function (mongoose) {return construct(mongoose);};
    this.create = function (id) {return create(id)};

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
     * Create a token by user id in DB.
     *
     * @param id - Indicates the ID of the user we want to create a Token for.
     * @returns {*}
     */
    create = function (id) {
        var token = jwt.sign({foo: 'bar'}, 'shhhhh');

        var createdToken = new tokenModel({
            _id: id,
            token: token
        });

        createdToken.save(function (err, createdToken) {
            if (err) {
                console.log('could not save createdToken.');
                console.log(err);
                return false;
            }
            console.log(createdToken);
        });
    };

}

module.exports = token;