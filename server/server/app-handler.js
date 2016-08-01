'use strict';

function appHandler () {

    // Functions
    var getAppBreathing;
    var getAppTest;

    // Variables

    // Constants

    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.getAppBreathing    = function () { return getAppBreathing(); };
    this.getAppTest         = function () { return getAppTest(); };

    /* ======================================================================
     * Private functions
     * ====================================================================== */

    /**
     * Get structure of the app "Atmung"
     * @returns {{name: string, description: string, settings: Object}}
     */
    getAppBreathing = function () {
        return {
            name: 'Atmung',
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
}

module.exports = appHandler;
