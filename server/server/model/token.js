'use strict';

function token (DB) {

    // functions
    var construct;
    var create;
    var update;
    var checkIfTokenExists;

    // variables
    var tokenModel;
    var tokenSchema;
    var tokenMongoose;
    var jwt = require('jsonwebtoken');

    this.construct = function (mongoose) {return construct(mongoose);};
    this.create = function (id) {return create(id)};
    this.checkIfTokenExists = function (id, username, gadget) {return checkIfTokenExists(id, username, gadget);};
    this.update = function (id) {return update(id);};

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
            }else{
                console.log('Token saved: ' + result);
            }
        });
    };

    /**
     * Creates a new token by user id in DB.
     * @param id - Indicates the ID of the user we want to create a Token for.
     * @returns {*}
     */
    update = function (id) {
        var token = jwt.sign({foo: 'bar'}, 'shhhhh', {expiresIn: '10h'});

        var createdToken = new tokenModel({
            _id: id,
            token: token

        });

        tokenModel.findOneAndUpdate({_id: id}, createdToken, function (err) {
            if (err) {
                console.log('Failed creating a new Token for User ID: ' + id);
            } else {
                console.log('New Token for User ID: ' + id + ' is token: ' + token);
            }
        });
    };


    /**
     * Compare the input data with the data in Database.
     * @param id: id of the user.
     * @param username: Username.
     * @param gadget: The user's gadget.
     */
    //TODO Was passiert mit Token danach?
    checkIfTokenExists = function (id, username, gadget) {
        tokenModel.findOne({_id: id}, function (err, result) {
           if(result == null){
                DB.createTokenFinally(id, username);
                DB.connectGadgetToUserModel(username, gadget);
           } else {
               var foundToken = result.token;
                   try {
                       var decoded = jwt.verify(foundToken, 'shhhhh');
                       console.log('------------------------ ' + decoded.foo);
                       DB.connectGadgetToUserModel(username, gadget);

                       //Token zum zurücksenden
                   }
                   catch (e) {
                       console.log("Error: Token no longer valid!" );
                       DB.createNewToken(id);
                       DB.connectGadgetToUserModel(username, gadget);

                   }
           }
        })
    };

}

module.exports = token;