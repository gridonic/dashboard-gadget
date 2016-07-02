'use strict';

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

function db () {

    // functions
    var initDB;
    var remove;
    var getPosition;

    // variables
    var url = 'mongodb://localhost:27017/test';

    // this.add = function () { return add(); };

    initDB = function () {
        console.log('initDB');

        // Use connect method to connect to the Server
        MongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);

                // DB Stuff

                //Close connection
                db.close();
            }
        });
        
    };

    initDB();
}

module.exports = db;
