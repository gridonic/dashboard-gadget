'use strict';
var graphic = require('./module/graphic.js');
var http = require('http');
var https = require('https');

function appHandler () {

    // Functions
    var checkHTTP;
    var checkHTTPS;
    var getActualAppDisplay;
    var getAppAtmung;
    var getAppMenu;
    var getAppMood;
    var getAppMoodMenu;
    var getAppMoodStep;
    var getAppPollRoom;
    var getAppPollRoomMenu;
    var getAppPollRoomStep;
    var getAppPollSound;
    var getAppPollSoundMenu;
    var getAppPollSoundStep;
    var getAppServer;
    var getAppTest;
    var getDisplayAppActiveMood;
    var getDisplayAppActivePollRoom;
    var getDisplayAppActivePollSound;
    var getDisplayAppAtmung;
    var getDisplayAppMood;
    var getDisplayAppPollRoom;
    var getDisplayAppPollSound;
    var getDisplayDecisionPollBreak;
    var getDisplayDecisionPollLunch;
    var getDisplayDecisionPollCold;
    var getDisplayDecisionPollHot;
    var getDisplayDecisionPollLoud;
    var getDisplayResultPositiveBreak;
    var getDisplayResultPositiveLunch;
    var getDisplayResultPositiveCold;
    var getDisplayResultPositiveHot;
    var getDisplayResultPositiveLoud;
    var getDisplayResultNegativeBreak;
    var getDisplayResultNegativeLunch;
    var getDisplayResultNegativeCold;
    var getDisplayResultNegativeHot;
    var getDisplayResultNegativeLoud;
    var getDisplayAppServer;
    var getDisplayAppTest;
    var getPollDecisionDisplay;
    var getPollResultDisplay;
    var mod;
    var prepareAppDisplay;

    // Variables
    var actualDisplay           = null;
    var appServerText           = {};
    var Graphic                 = new graphic();
    var self                    = this;
    var actualPollStep          = 0;

    // Constants
    var APP_ATMUNG_NAME         = 'Atmung';
    var APP_MOOD_NAME           = 'Mood-App';
    var APP_POLL_ROOM_NAME      = 'Poll-Room-App';
    var APP_POLL_SOUND_NAME     = 'Poll-Sound-App';
    var APP_TEST_NAME           = 'Test-App';
    var APP_SERVERSTATUS_NAME   = 'Serverstatus';

    this.POLL_TO_FILL           = 'poll-to-fill';
    this.APP_MOOD_NAME          = APP_MOOD_NAME;
    this.APP_POLL_ROOM_NAME     = APP_POLL_ROOM_NAME;
    this.APP_POLL_SOUND_NAME    = APP_POLL_SOUND_NAME;

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.getActualAppDisplay    = function (step, stepDuration) { return getActualAppDisplay(step, stepDuration); };
    this.getAppBreathing        = function () { return getAppAtmung(); };
    this.getAppMenu             = function (app) { return getAppMenu(app); };
    this.getAppMood             = function () { return getAppMood(); };
    this.getAppMoodStep         = function () { return getAppMoodStep(); };
    this.getAppPollRoom         = function () { return getAppPollRoom(); };
    this.getAppPollRoomStep     = function () { return getAppPollRoomStep(); };
    this.getAppPollSound        = function () { return getAppPollSound(); };
    this.getAppPollSoundStep    = function () { return getAppPollSoundStep(); };
    this.getAppServer           = function () { return getAppServer(); };
    this.getAppTest             = function () { return getAppTest(); };
    this.getPollDecisionDisplay = function (decisionData) { return getPollDecisionDisplay(decisionData);};
    this.getPollResultDisplay   = function (resultData) {return getPollResultDisplay(resultData);};
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
                return getDisplayAppActiveMood();
            } else if (actualDisplay.poll.name === APP_POLL_ROOM_NAME) {
                return getDisplayAppActivePollRoom();
            } else if (actualDisplay.poll.name === APP_POLL_SOUND_NAME) {
                return getDisplayAppActivePollSound();
            } else {
                console.log('return Display of poll');
                console.log(actualDisplay.poll);
            }
        }

        return null;
    };

    getPollDecisionDisplay = function (decisionData) {
        if (decisionData === 'POLL_COFFEE') {
            return getDisplayDecisionPollBreak();
        } else if (decisionData === 'POLL_LUNCH') {
            return getDisplayDecisionPollLunch();
        } else if (decisionData === 'POLL_HOT') {
            return getDisplayDecisionPollHot();
        } else if (decisionData === 'POLL_COLD') {
            return getDisplayDecisionPollCold();
        } else if (decisionData === 'POLL_LOUD') {
            return getDisplayDecisionPollLoud();
        } else {
            console.log('No Poll choosen!');
        }

    };

        getPollResultDisplay = function (resultData) {
            if (resultData.result) {
                if (resultData.type === 'POLL_COFFEE') {
                    return getDisplayResultPositiveBreak();
                } else if ( resultData.type=== 'POLL_LUNCH') {
                    return getDisplayResultPositiveLunch();
                } else if (resultData.type === 'POLL_HOT') {
                    return getDisplayResultPositiveHot();
                } else if (resultData.type === 'POLL_COLD') {
                    return getDisplayResultPositiveCold();
                } else if (resultData.type === 'POLL_LOUD') {
                    return getDisplayResultPositiveLoud();
                } else {
                console.log('No Poll started!');
                }
            } else {
                if (resultData.type === 'POLL_COFFEE') {
                    return getDisplayResultNegativeBreak();
                } else if (resultData.type === 'POLL_LUNCH') {
                    return getDisplayResultNegativeLunch();
                } else if (resultData.type === 'POLL_HOT') {
                    return getDisplayResultNegativeHot();
                } else if (resultData.type === 'POLL_COLD') {
                    return getDisplayResultNegativeCold();
                } else if (resultData.type === 'POLL_LOUD') {
                    return getDisplayResultNegativeLoud();
                } else {
                    console.log('No Poll started!');
                }
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

    getAppMenu = function (app) {
        if (app.name === APP_MOOD_NAME) {
            return getAppMoodMenu();
        } else if (app.name === APP_POLL_ROOM_NAME) {
            return getAppPollRoomMenu();
        } else if (app.name === APP_POLL_SOUND_NAME) {
            return getAppPollSoundMenu();
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
            active: getAppMoodStep()
        }
    };

    getAppMoodStep = function () {
        return mod(actualPollStep, 4);
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

    getAppPollRoomStep = function () {
        return mod(actualPollStep, 3);
    };

    getAppPollRoomMenu = function () {
        return {
            counts: 3,
            active: getAppPollRoomStep()
        };
    };

    getDisplayAppActivePollRoom = function () {
        var step = getAppPollRoomStep();

        // 0: everything is okay
        // 1: too cold
        // 2: too hot

        switch (step) {
            case 0:
                return 'MEN|2|ROOM|OK';
                break;
            case 1:
                return 'MEN|2|ROOM|COLD';
                break;
            case 2:
                return 'MEN|2|ROOM|HOT';
                break;
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

    getAppPollSoundMenu = function () {
        return {
            counts: 2,
            active: getAppPollSoundStep()
        };
    };

    getAppPollSoundStep = function () {
        return mod(actualPollStep, 2);
    };

    getDisplayAppActivePollSound = function () {
        var step = getAppPollSoundStep();

        // 0: everything is okay
        // 1: too loud

        switch (step) {
            case 0:
                return 'MEN|2|SOUND|OK';
                break;
            case 1:
                return 'MEN|2|SOUND|LOUD';
                break;
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
        var step = getAppMoodStep();

        // 0: everything is okay
        // 1: coffee
        // 2: food
        // 3: focus

        switch (step) {
            case 0:
                return 'MEN|2|MOOD|OK'; // + '|' + Graphic.getIconBitwise(Graphic.iconDecline84);
                break;
            case 1:
                return 'MEN|2|MOOD|COFFEE'; // + '|' + Graphic.getIconBitwise(Graphic.iconCoffee84);
                break;
            case 2:
                return 'MEN|2|MOOD|FOOD'; // + '|' + Graphic.getIconBitwise(Graphic.iconFood84);
                break;
            case 3:
                return 'MEN|2|MOOD|FOCUS'; // + '|' + Graphic.getIconBitwise(Graphic.iconFocused84);
                break;
        }
    };

    getDisplayAppAtmung = function (settings, step, stepDuration) {
        var time = step * stepDuration;
        var size = (time / settings.Geschwindigkeit) % 2;
        if (size > 1) {
            size = 2 - size;
        }

        // return Graphic.getDisplayAtmung(size);
        return 'APP|ATM|' + settings.Geschwindigkeit;
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

    /**
     * Return the display-string.
     *  MEN: show menu with circle
     *  3: show two big circles in the middle
     * @returns {string}
     */
    getDisplayDecisionPollBreak = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconCoffee84);
        return 'MEN|3|BREAK';
    };

    getDisplayDecisionPollLunch = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconFood84);
        return 'MEN|3|LUNCH';
    };

    getDisplayDecisionPollCold = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconCold84);
        return 'MEN|3|COLD';
    };

    getDisplayDecisionPollHot = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconHot84);
        return 'MEN|3|HOT';
    };

    getDisplayDecisionPollLoud = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconLoud84);
        return 'MEN|3|LOUD';
    };

    /**
     * Return the display-string.
     *  MEN: show menu with circle
     *  3: show two big circles in the middle
     * @returns {string}
     */
    getDisplayResultPositiveBreak = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconCoffee84);
        return 'MEN|3|BREAK|POS';
    };

    getDisplayResultPositiveLunch = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconFood84);
        return 'MEN|3|LUNCH|POS';
    };

    getDisplayResultPositiveCold = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconCold84);
        return 'MEN|3|COLD|POS';
    };

    getDisplayResultPositiveHot = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconHot84);
        return 'MEN|3|HOT|POS';
    };

    getDisplayResultPositiveLoud = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconLoud84);
        return 'MEN|3|LOUD|POST';
    };

    getDisplayResultNegativeBreak = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconCoffee84);
        return 'MEN|3|BREAK|NEG';
    };

    getDisplayResultNegativeLunch = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconFood84);
        return 'MEN|3|LUNCH|NEG';
    };

    getDisplayResultNegativeCold = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconCold84);
        return 'MEN|3|COLD|NEG';
    };

    getDisplayResultNegativeHot = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconHot84);
        return 'MEN|3|HOT|NEG';
    };

    getDisplayResultNegativeLoud = function() {
        var icon = Graphic.getIconBitwise(Graphic.iconLoud84);
        return 'MEN|3|LOUD|NEG';
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

            serverResult += (keys[i] + ': ' + appServerText[keys[i]]).replace('http://', '').replace('https://', '');
        }

        if (serverResult === "") {
            serverResult = "No URLs checked.";
        }

        return Graphic.getDisplayServer(serverResult);
    };

    mod = function (n, m) {
        return ((n % m) + m) % m;
    };

}

module.exports = appHandler;
