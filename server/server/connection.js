'use strict';

function connection () {

    // functions
    var add;
    var remove;
    var getPosition;

    // variables
    var connections = [];

    this.add = function (id) { return add(id); };
    this.delete = function (id) { return remove(id); };

    add = function (id) {
        if (getPosition(id) === null) {
            connections.push({'id': id});
            console.log(connections);
        } else {
            console.log('error: id already added.');
        }
    };

    remove = function (id) {
        var i = getPosition(id);
        connections.splice(i, 1);
        console.log(connections);
    };


    getPosition = function (id) {
        var j = null;
        for (var i = 0; i < connections.length; i++) {
            if (connections[i]['id'] === id) {
                j = i;
                break;
            }
        }
        return j;
    };
}

module.exports = connection;
