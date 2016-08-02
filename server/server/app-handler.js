'use strict';
var graphic = require('./module/graphic.js');

function appHandler () {

    // Functions
    var getActualAppDisplay;
    var getAppAtmung;
    var getAppTest;
    var prepareAppDisplay;
    var getDisplayAppAtmung;

    // Variables
    var actualDisplay = null;
    var Graphic = new graphic();

    // Constants
    var APP_ATMUNG_NAME = 'Atmung';

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.getActualAppDisplay    = function (step, stepDuration) { return getActualAppDisplay(step, stepDuration); };
    this.getAppBreathing        = function () { return getAppAtmung(); };
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
     * Get structure of the app "Test-App"
     * @returns {{name: string, description: string, settings: null}}
     */
    getAppTest = function () {
        return {
            name: 'Test-App',
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

}

module.exports = appHandler;
