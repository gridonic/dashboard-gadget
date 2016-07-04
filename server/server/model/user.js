'use strict';

function user () {

    // functions
    var construct;
    var create;

    // variables
    var userModel;
    var userSchema;
    var userMongoose;

    this.construct = function (mongoose) { return construct(mongoose); };
    this.create = function (username, password) { return create(username, password); };

    construct = function (mongoose) {

        userMongoose = mongoose;

        var Schema = userMongoose.Schema;

        userSchema = new Schema({
            username: String,
            id: Number,
            password: String,
            appActivated: Array,
            appSettings: Array,
            gadgetId: Number,
            actualMoodId: Number,
            actualProjectId: Number
        });

        userSchema.methods.sayHello = function () {
            var greeting = this.username ? "Hello! My username is " + this.username : "Ouch, I don't have a username";
            console.log(greeting);
        };

        userModel = userMongoose.model('userModel', userSchema);
        console.log('constructed the userModel!');
    };

    create = function (username, password) {

        // todo: hash the password with bcrypt (https://github.com/ncb000gt/node.bcrypt.js)
        var createdUser = new userModel({
            username: username,
            password: password
        });

        createdUser.save(function (err, createdUser) {
            if (err) {
                console.log('could not save createdUser.');
                console.log(err);
                return false;
            }

            createdUser.sayHello();
        });

        console.log('user successfully created, return it.');
        return createdUser;
    }
    
}

module.exports = user;
