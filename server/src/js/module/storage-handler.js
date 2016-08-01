storageHandler = function () {

    // Functions
    var clearStorage;
    var getApps;
    var getItem;
    var getToken;
    var getUserApps;
    var getUserAppSettings;
    var getUsername;
    var getUserSettings;
    var init;
    var removeItem;
    var setApps;
    var setItem;
    var setToken;
    var setUserApps;
    var setUserAppSettings;
    var setUsername;
    var setUserSettings;

    // Constants
    var PREFIX = '_dashboard';
    var ITEM_APPS = PREFIX + '_apps';
    var ITEM_USERNAME = PREFIX + '_username';
    var ITEM_USER_APPS = PREFIX + '_user-apps';
    var ITEM_USER_APP_SETTINGS = PREFIX + '_user-app-settings';
    var ITEM_USER_SETTINGS = PREFIX + '_user-settings';
    var ITEM_TOKEN = PREFIX + '_token';
    var ITEM_VERSION = PREFIX + '_version';

    // Variables
    var storage = window.localStorage;
    var version = '1.0.0';

    // Getters & Setters
    getApps             = function () { return JSON.parse(getItem(ITEM_APPS)); };
    getToken            = function () { return getItem(ITEM_TOKEN); };
    getUserApps         = function () { return JSON.parse(getItem(ITEM_USER_APPS)); };
    getUserAppSettings  = function () { return JSON.parse(getItem(ITEM_USER_APP_SETTINGS)); };
    getUsername         = function () { return getItem(ITEM_USERNAME); };
    getUserSettings     = function () { return getItem(ITEM_USER_SETTINGS); };
    setApps             = function (apps) { return setItem(ITEM_APPS, JSON.stringify(apps)); };
    setToken            = function (token) { setItem(ITEM_TOKEN, token); };
    setUserApps         = function (userApps) { setItem(ITEM_USER_APPS, JSON.stringify(userApps)); };
    setUserAppSettings  = function (userAppSettings) { setItem(ITEM_USER_APP_SETTINGS, userAppSettings); };
    setUsername         = function (username) { setItem(ITEM_USERNAME, username); };
    setUserSettings     = function (settings) { setItem(ITEM_USER_SETTINGS, settings); };

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
        delete:                 clearStorage,
        getApps:                getApps,
        getToken:               getToken,
        getUserApps:            getUserApps,
        getUserAppSettings:     getUserAppSettings,
        getUser:                getUsername,
        getUserSettings:        getUserSettings,
        init:                   init,
        setApps:                setApps,
        setToken:               setToken,
        setUserApps:            setUserApps,
        setUserAppSettings:     setUserAppSettings,
        setUser:                setUsername,
        setUserSettings:        setUserSettings,
    };
};