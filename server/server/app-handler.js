'use strict';
var graphic = require('./module/graphic.js');
var http = require('http');
var https = require('https');

function appHandler () {

    // Functions
    var getActualAppDisplay;
    var getAppAtmung;
    var getAppMenu;
    var getAppMood;
    var getAppMoodMenu;
    var getAppMoodStep;
    var getAppPollRoom;
    var getAppPollSound;
    var getAppServer;
    var getAppTest;
    var prepareAppDisplay;
    var getDisplayAppActiveMood;
    var getDisplayAppAtmung;
    var getDisplayAppMood;
    var getDisplayAppPollRoom;
    var getDisplayAppPollSound;
    var getDisplayAppServer;
    var getDisplayAppTest;
    var checkHTTP;
    var checkHTTPS;

    // Variables
    var actualDisplay   = null;
    var appServerText   = {};
    var Graphic         = new graphic();
    var self            = this;
    var actualPollStep  = 0;

    // Constants
    var APP_ATMUNG_NAME         = 'Atmung';
    var APP_MOOD_NAME           = 'Mood-App';
    var APP_POLL_ROOM_NAME      = 'Poll-Room-App';
    var APP_POLL_SOUND_NAME     = 'Poll-Sound-App';
    var APP_TEST_NAME           = 'Test-App';
    var APP_SERVERSTATUS_NAME   = 'Serverstatus';

    this.POLL_TO_FILL           = 'poll-to-fill';
    this.APP_MOOD_NAME          = APP_MOOD_NAME;

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.getActualAppDisplay    = function (step, stepDuration) { return getActualAppDisplay(step, stepDuration); };
    this.getAppBreathing        = function () { return getAppAtmung(); };
    this.getAppMenu             = function (app) { return getAppMenu(app); };
    this.getAppMood             = function () { return getAppMood(); };
    this.getAppMoodStep         = function () { return getAppMoodStep(); };
    this.getAppPollRoom         = function () { return getAppPollRoom(); };
    this.getAppPollSound        = function () { return getAppPollSound(); };
    this.getAppServer           = function () { return getAppServer(); };
    this.getAppTest             = function () { return getAppTest(); };
    this.prepareAppDisplay      = function (app, settings) { return prepareAppDisplay(app, settings); };
    this.updatePollStep         = function (value) { actualPollStep = actualPollStep + value; console.log(value); };

    /* ======================================================================
     * Private functions
     * ====================================================================== */

    checkHTTPS = function (url) {
        https.get(url, function(res) {
            appServerText[url] = res.statusCode;
        }).on('error', function(e) {
            console.log("Got error: " + e.message + '  ' + url);
        });
    };

    checkHTTP = function (url) {
        http.get(url, function(res) {
            appServerText[url] = res.statusCode;
        }).on('error', function(e) {
            console.log("Got error: " + e.message + '  ' + url);
        });
    };

    getActualAppDisplay = function (step, stepDuration) {
        if (actualDisplay === null) {
            return null;
        } else if (actualDisplay.app) {
            if (actualDisplay.app.name === APP_ATMUNG_NAME) {
                return getDisplayAppAtmung(actualDisplay.settings, step, stepDuration);
            } else if (actualDisplay.app.name === APP_SERVERSTATUS_NAME) {
                return getDisplayAppServer(actualDisplay.settings);
            } else if (actualDisplay.app.name === APP_TEST_NAME) {
                return getDisplayAppTest();
            } else if (actualDisplay.app.name === APP_MOOD_NAME) {
                return getDisplayAppMood();
            } else if (actualDisplay.app.name === APP_POLL_ROOM_NAME) {
                return getDisplayAppPollRoom();
            } else if (actualDisplay.app.name === APP_POLL_SOUND_NAME) {
                return getDisplayAppPollSound();
            }
        } else if (actualDisplay.poll) {
            if (actualDisplay.poll.name === APP_MOOD_NAME) {
                getDisplayAppActiveMood();
            } else {
                console.log('return Display of poll');
                console.log(actualDisplay.poll);
            }
        }

        return null;
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

    getAppMenu = function (app) {
        if (app.name === APP_MOOD_NAME) {
            return getAppMoodMenu();
        }

        return null;
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

    getAppMood = function () {
        return {
            name: APP_MOOD_NAME,
            description: 'Die Mood-App zum einstellen des Moods',
            settings: {
                activated: true
            }
        };
    };

    getAppMoodMenu = function () {
        return {
            counts: 4,
            active: actualPollStep % 4
        }
    };

    getAppMoodStep = function () {
        return actualPollStep % 4;
    };

    getAppPollRoom = function () {
        return {
            name: APP_POLL_ROOM_NAME,
            description: 'Die Poll-App für Temperatur-Umfragen',
            settings: {
                activated: true
            }
        }
    };

    getAppPollSound = function () {
        return {
            name: APP_POLL_SOUND_NAME,
            description: 'Die Poll-App für Lautstärke-Umfragen',
            settings: {
                activated: true
            }
        }
    };

    prepareAppDisplay = function (app, settings) {
        if (settings === self.POLL_TO_FILL) {
            actualDisplay = {
                poll: app
            };
        } else {
            actualDisplay = {
                app: app,
                settings: settings
            };
        }
    };

    getDisplayAppActiveMood = function () {
        var step = actualPollStep % 4;

        // 0: everything is okay
        // 1: coffee
        // 2: food
        // 3: do not disturb

        switch(step) {
            case 0:
                console.log('show mood poll everything ok');
                break;
            case 1:
                console.log('show mood poll coffee');
                break;
            case 2:
                console.log('show mood poll food');
                break;
            case 3:
                console.log('show mood poll do not disturb');
                break;
        }
    };

    getDisplayAppAtmung = function (settings, step, stepDuration) {
        var time = step * stepDuration;
        var size = (time / settings.Geschwindigkeit) % 2;
        if (size > 1) {
            size = 2 - size;
        }

        return Graphic.getDisplayAtmung(size);
    };

    /**
     * Return the display-string.
     *  MEN: show menu with circle
     *  1: show Big circle in the middle
     * @returns {string}
     */
    getDisplayAppMood = function () {
        var icon = Graphic.getIconBitwise(Graphic.iconMood84);
        return 'MEN|1|MOOD';
    };

    getDisplayAppPollRoom = function () {
        var icon = Graphic.getIconBitwise(Graphic.iconRoom84);
        return 'MEN|1|ROOM';
    };

    getDisplayAppPollSound = function () {
        var icon = Graphic.getIconBitwise(Graphic.iconSound84);
        return 'MEN|1|SOUND';
    };

    getDisplayAppTest = function () {
        return Graphic.getDisplayTest();
    };

    getDisplayAppServer = function (settings) {
        var noSpaces = settings.URL.replace(/\s/g,'');
        var splittedURL = noSpaces.split(",");
        var keys;
        var i;
        var serverResult = '';

        for (i = 0; i < splittedURL.length; i++) {
            if (splittedURL[i].substring(0, 5) === 'https') {
                checkHTTPS(splittedURL[i]);

            } else if (splittedURL[i].substring(0, 4) !== "http") {
                 var httpAdded = 'http://' + splittedURL[i];
                     checkHTTP(httpAdded);
            } else {
                checkHTTP(splittedURL[i]);
            }
        }

        keys = Object.keys(appServerText);
        for (i in keys) {
            if (i > 0) {
                serverResult += '%';
            }

            serverResult += keys[i] + ': ' + appServerText[keys[i]];
        }

        if (serverResult === "") {
            serverResult = "No URLs checked.";
        }

        return Graphic.getDisplayServer(serverResult);
    };

}

module.exports = appHandler;
