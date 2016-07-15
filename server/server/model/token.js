'use strict';

function token (DB) {

    // functions
    var construct;
    var create;
    var checkIfTokenExists;

    // variables
    var tokenModel;
    var tokenSchema;
    var tokenMongoose;
    var jwt = require('jsonwebtoken');

    this.construct = function (mongoose) {return construct(mongoose);};
    this.create = function (id) {return create(id)};
    this.checkIfTokenExists = function (id, username) {return checkIfTokenExists(id, username);};

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
        var token = jwt.sign({foo: 'bar'}, 'shhhhh', {expiresIn: '10h'});

        var createdToken = new tokenModel({
            _id: id,
            token: token

        });

        
        createdToken.save(function (err, result) {
            if (err) {
                console.log('could not save createdToken.');
                console.log(err);
                return false;
            }
        });
    };

    /**
     * Compare the input data with the data in Database.
     * @param id: id of the user.
     * @param username
     */
    //TODO Wass passiert mit Token danach?
    checkIfTokenExists = function (id, username) {
        tokenModel.findOne({_id: id}, function (err, result) {
           if(result == null){
                DB.createTokenFinally(id, username);
           } else {
               var foundToken = result.token;
                   try {
                       var decoded = jwt.verify(foundToken, 'shhhhh');
                       console.log('------------------------ ' + decoded.foo);
                       //Token zum zurücksenden
                   }
                   catch (e) {
                       console.log("Error: Token no longer valid!" );
                       
                   }
           }
        })
    };

}

module.exports = token;