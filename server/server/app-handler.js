'use strict';
var graphic = require('./module/graphic.js');
var http = require('http');
var https = require('https');

function appHandler () {

    // Functions
    var getActualAppDisplay;
    var getAppAtmung;
    var getAppServer;
    var getAppTest;
    var prepareAppDisplay;
    var getDisplayAppAtmung;
    var getDisplayAppServer;
    var getDisplayAppTest;
    var checkHTTP;
    var checkHTTPS;

    // Variables
    var actualDisplay = null;
    var Graphic = new graphic();

    // Constants
    var APP_ATMUNG_NAME = 'Atmung';
    var APP_TEST_NAME = 'Test-App';
    var APP_SERVERSTATUS_NAME = 'Serverstatus';

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.getActualAppDisplay    = function (step, stepDuration) { return getActualAppDisplay(step, stepDuration); };
    this.getAppBreathing        = function () { return getAppAtmung(); };
    this.getAppServer           = function () {return getAppServer(); };
    this.getAppTest             = function () { return getAppTest(); };
    this.prepareAppDisplay      = function (app, settings) { return prepareAppDisplay(app, settings); };

    /* ======================================================================
     * Private functions
     * ====================================================================== */

    getActualAppDisplay = function (step, stepDuration) {
        if (actualDisplay === null) {
            return null;
        } else if (actualDisplay.app && actualDisplay.app.name === APP_ATMUNG_NAME) {
            return getDisplayAppAtmung(actualDisplay.settings, step, stepDuration);
        } else if (actualDisplay.app && actualDisplay.app.name === APP_SERVERSTATUS_NAME) {
            return getDisplayAppServer(actualDisplay.settings);
        } else if (actualDisplay.app && actualDisplay.app.name === APP_TEST_NAME) {
            return getDisplayAppTest();
        }
    };

    /**
     * Get structure of the app "Atmung"
     * @returns {{name: string, description: string, settings: Object}}
     */
    getAppAtmung = function () {
        return {
            name: APP_ATMUNG_NAME,
            description: 'Hilft dir, deine Atmung zu regulieren',
            settings: {
                Geschwindigkeit: 'number'
            }
        }
    };

    /**
     * Get structure of the app "Serverstatus"
     * @returns {{name: string, description: string, settings: Object}}
     */
    getAppServer = function () {
        return {
            name: APP_SERVERSTATUS_NAME,
            description: 'Zeigt dir die Stati der Server welche im Einsatz sind an.',
            settings: {
                URL: 'string'
            }
        }
    };

    /**
     * Get structure of the app "Test-App"
     * @returns {{name: string, description: string, settings: null}}
     */
    getAppTest = function () {
        return {
            name: APP_TEST_NAME,
            description: 'Eine App, nur um die Apps zu testen.',
            settings: null
        };
    };

    prepareAppDisplay = function (app, settings) {
        actualDisplay = {
            app: app,
            settings: settings
        };
    };

    getDisplayAppAtmung = function (settings, step, stepDuration) {
        var time = step * stepDuration;
        var size = (time / settings.Geschwindigkeit) % 2;
        if (size > 1) {
            size = 2 - size;
        }

        return Graphic.getDisplayAtmung(size);
    };
    
    getDisplayAppServer = function (settings) {
        var noSpaces = settings.URL.replace(/\s/g,'');
        var splittedURL = noSpaces.split(",");

        for (var i = 0; i < splittedURL.length; i++) {
            if (splittedURL[i].substring(0, 5) === 'https') {
                checkHTTPS(splittedURL[i]);

            } else if (splittedURL[i].substring(0, 4) !== "http") {
                 var httpAdded = 'http://' + splittedURL[i];
                     checkHTTP(httpAdded);
            } else {
                checkHTTP(splittedURL[i]);
            }
        }
    };

    getDisplayAppTest = function () {
        return Graphic.getDisplayTest();
    };

    checkHTTPS = function (url) {
        https.get(url, function(res) {
            console.log("Got response of " + url + " : " + res.statusCode);
        }).on('error', function(e) {
            console.log("Got error: " + e.message + '  ' + url);
        });
    };

    checkHTTP = function (url) {
        http.get(url, function(res) {
            console.log("Got response of " + url + " : " + res.statusCode);
        }).on('error', function(e) {
            console.log("Got error: " + e.message + '  ' + url);
        });
    };

}

module.exports = appHandler;
