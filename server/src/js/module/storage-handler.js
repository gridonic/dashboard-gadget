storageHandler = function () {

    // Functions
    var clearStorage;
    var getItem;
    var getToken;
    var getUsername;
    var init;
    var removeItem;
    var setItem;
    var setToken;
    var setUsername;

    // Constants
    var PREFIX = '_dashboard';
    var ITEM_USERNAME = PREFIX + '_username';
    var ITEM_TOKEN = PREFIX + '_token';
    var ITEM_VERSION = PREFIX + '_version';

    // Variables
    var storage = window.localStorage;
    var version = '1.0.0';

    // Getters & Setters
    getToken    = function () { return getItem(ITEM_TOKEN); };
    getUsername = function () { return getItem(ITEM_USERNAME); };
    setToken    = function (token) { setItem(ITEM_TOKEN, token); };
    setUsername = function (username) { setItem(ITEM_USERNAME, username); };

    /**
     * Clear the storage
     */
    clearStorage = function () {
        storage.clear();
        storage.setItem(ITEM_VERSION, version);
    };

    /**
     * Get an item from the storage and return it.
     *
     * @param key
     */
    getItem = function (key) {
        return storage.getItem(key);
    };

    /**
     * Initialize Storage Handler by adding a version to the storage
     * or by sending Error to the browser.
     */
    init = function () {
        console.log('init storageHandler');

        if (typeof(storage) !== "undefined") {
            storage.setItem(ITEM_VERSION, version);
        } else {
            console.error('LocalStorage could not be initialized. Please update your browser.');
        }
    };

    removeItem = function (key) {
        storage.removeItem(key);
    };

    /**
     * Set item to the storage.
     *
     * @param key
     * @param value
     */
    setItem = function (key, value) {
        storage.setItem(key, value);
    };

    // Return all public functions
    return {
        delete: clearStorage,
        getToken: getToken,
        getUser: getUsername,
        init: init,
        setToken: setToken,
        setUser: setUsername,
    };
};