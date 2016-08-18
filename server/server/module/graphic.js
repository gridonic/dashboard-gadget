'use strict';

function graphic () {

    // Functions
    var generateCircle;
    var generateEmptyLines;
    var generateFullLines;
    var generateHorizontalLine;
    var generateLines;
    var generateMenu;
    var generateRectangle;
    var generateText;
    var generateWorkTime;
    var getActualTimeDisplay;
    var getBlackDisplay;
    var getDecisionDisplay;
    var getDefaultDisplay;
    var getDisplayAtmung;
    var getDisplayServer;
    var getIconBitwise;
    var getStartDisplay;
    var getWhiteDisplay;
    var getWorktimeDisplay;
    var readImage;
    var replacePart;
    var stringToBits;

    // Variables
    var displayWidth = 320;
    var displayHeight = 240;
    var displayPadding = 10;
    var workTimeHeight = 12;
    var workIconSize = 12;
    var displayMainTop = displayHeight - displayHeight / 4 * 3;
    var displayMainSize = displayHeight / 2;
    var displayMainLeft = displayWidth / 2 - displayMainSize / 2;

    // Constants
    var COLOR_WHITE = '0';
    var COLOR_BLACK = '1';

    // JSON-Files
    this.iconCoffee84    = require('./../png-json/icon-mood-coffee-84.json');
    this.iconCold84      = require('./../png-json/icon-cold-84.json');
    this.iconFocused84   = require('./../png-json/icon-mood-focused-84.json');
    this.iconFood84      = require('./../png-json/icon-mood-food-84.json');
    this.iconHot84       = require('./../png-json/icon-hot-84.json');
    this.iconLoud84      = require('./../png-json/icon-sound-loud-84.json');
    this.iconMood84      = require('./../png-json/icon-mood-84.json');
    this.iconMood44      = require('./../png-json/icon-mood-44.json');
    this.iconOk84        = require('./../png-json/icon-mood-ok-84.json');
    this.iconPoll84      = require('./../png-json/icon-poll-84.json');
    this.iconRoom44      = require('./../png-json/icon-room-44.json');
    this.iconRoom84      = require('./../png-json/icon-room-84.json');
    this.iconSound44     = require('./../png-json/icon-sound-44.json');
    this.iconSound84     = require('./../png-json/icon-sound-84.json');

    var workIconRaw      = require('./../png-json/work-icon.json');
    var startImageRaw    = require('./../png-json/start-image.json');


    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.getActualTimeDisplay   = function () { return getActualTimeDisplay(); };
    this.getBlackDisplay        = function () { return getBlackDisplay(); };
    this.getDecisionDisplay     = function () { return getDecisionDisplay(); };
    this.getDefaultDisplay      = function (time, workingPercent, icon) { return getDefaultDisplay(time, workingPercent, icon); };
    this.getDisplayTest         = function () { return generateRectangle(100, 100, 120, 40, COLOR_BLACK, COLOR_WHITE); };
    this.getDisplayAtmung       = function (size) { return getDisplayAtmung(size); };
    this.getDisplayServer       = function (string) { return getDisplayServer(string);};
    this.getIconBitwise         = function (icon) { return getIconBitwise(icon); };
    this.getMenu                = function (menu) { return generateMenu(menu.counts, menu.active); };
    this.getStartDisplay        = function () { return getStartDisplay(); };
    this.getWhiteDisplay        = function () { return getWhiteDisplay(); };
    this.getWorktimeDisplay     = function (workingPercent) { return getWorktimeDisplay(workingPercent); };

    /* ======================================================================
     * Private functions
     * ====================================================================== */

    /**
     * Returns a circle, based on a borderColor and a rectangleColor
     *
     * @param x
     * @param y
     * @param rad
     * @param borderColor
     * @param rectColor
     * @returns {string}
     */
    generateCircle = function (x, y, rad, borderColor, rectColor) {
        return 'CIRC' + '|' + x + '|' + y + '|' + rad + '|' + borderColor + '|' + rectColor;
    };

    /**
     * Generates empty lines.
     *
     *  |                    |
     *
     * @param lines
     * @returns {*}
     */
    generateEmptyLines = function (lines) {
        return generateLines(lines, COLOR_WHITE);
    };

    /**
     * Generates filled lines.
     *
     *  |xxxxxxxxxxxxxxxxxxxx|
     *
     * @param lines
     * @returns {*}
     */
    generateFullLines = function (lines) {
        return generateLines(lines, COLOR_BLACK);
    };

    /**
     * Generates a horizontal spacer.
     *
     *  |   xxxxxxxxxxxxxx   |
     *
     * @returns {string}
     */
    generateHorizontalLine = function () {
        var lineString = "";

        for (var i = 0; i < displayWidth; i++) {
            if (i < displayPadding || i >= displayWidth - displayPadding) {
                lineString += COLOR_WHITE;
            } else {
                lineString += COLOR_BLACK;
            }
        }
        return lineString;
    };

    /**
     * Generates a horizontal line in a specific color
     *
     * @param lines
     * @param color
     * @returns {string}
     */
    generateLines = function (lines, color) {
        var lineString = "";
        for (lines; lines > 0; lines--) {
            for (var i = 0; i < displayWidth; i++) {
                lineString += color;
            }
        }
        return lineString;
    };

    /**
     * Generates a menu-string
     *
     * @param counts
     * @param active
     * @returns {string}
     */
    generateMenu = function (counts, active) {
        return '206|' + displayPadding + '|' + counts + '|' + active + '|2';
    };

    /**
     * Returns a rectangle, based on a borderColor and a rectangleColor
     *
     * @param x
     * @param y
     * @param w
     * @param h
     * @param borderColor
     * @param rectColor
     * @returns {string}
     */
    generateRectangle = function (x, y, w, h, borderColor, rectColor) {
        return 'RECT' + '|' + x + '|' + y + '|' + w + '|' + h + '|' + borderColor + '|' + rectColor;
    };

    /**
     * Returns a string to show in mainsection of display.
     *
     * @param text
     * @returns {string}
     */
    generateText = function (text) {
        return 'TXT' + '|' + displayPadding + '|' + text;
    };

    /**
     * Generate the working-time stati on top of the screen.
     *
     * @param percent
     * @returns {string}
     */
    generateWorkTime = function (percent) {
        var lineString = "";
        var start = displayPadding + workIconSize + 4;
        var stop = displayWidth - displayPadding;
        var workingWidth = Math.round((stop - start) / 100 * percent);

        if (percent <= 100) {
            for (var j = 0; j < workTimeHeight; j++) {
                for (var i = 0; i < displayWidth; i++) {
                    if (
                        ((j == 0 || j == 1 || j == workTimeHeight - 1 || j == workTimeHeight - 2) && (i > start && i <= stop))
                        || i == start + 1 || i == start + 2
                        || i == stop || i == stop - 1
                        || (i > start && i < (start + workingWidth))
                    ) {
                        lineString += COLOR_BLACK;
                    } else {
                        lineString += COLOR_WHITE;
                    }
                }
            }
        } else {
            workingWidth = Math.round((displayWidth - 2 * displayPadding) / percent * 100);

            for (var j = 0; j < workTimeHeight; j++) {
                for (var i = 0; i < displayWidth; i++) {
                    if (i <= start
                        || i > stop
                        || i == start + workingWidth - 1
                        || i == start + workingWidth - 2
                    ) {
                        lineString += COLOR_WHITE;
                    } else {
                        lineString += COLOR_BLACK;
                    }
                }
            }
        }

        return replacePart(lineString, displayPadding, 0, 12, 12, workIconRaw);
    };

    getActualTimeDisplay = function () {
        var date = new Date();
        var timeString;

        var addLeadingZero = function (number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        };

        timeString = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + addLeadingZero(date.getHours()) + ':' + addLeadingZero(date.getMinutes());

        return displayPadding + "|" + timeString;
    };

    /**
     * Get a full black display.
     * @returns {*}
     */
    getBlackDisplay = function () {
        return stringToBits(generateFullLines(displayHeight));
    };

    /**
     * Get the answer-text for the decisions.
     * @returns {string}
     */
    getDecisionDisplay = function () {
        return displayPadding + "|" + " NO                  YES";
    };

    /**
     * Get the default Display with the workingtime-state, an icon and the time.
     * @param time
     * @param workingPercent
     * @param icon
     * @returns {*}
     */
    getDefaultDisplay = function (time, workingPercent, icon) {

        return stringToBits(
            generateEmptyLines(displayPadding)
            + generateWorkTime(workingPercent)
            + generateEmptyLines(displayHeight - displayPadding - workTimeHeight)
        );

    };

    getDisplayAtmung = function (size) {
        var color = COLOR_BLACK;
        var circleSize = (displayMainSize / 2) * size;
        if (circleSize == 0) {
            circleSize = 4;
        }

        // return generateRectangle(displayMainLeft, displayMainTop, displayMainSize, displayMainSize, COLOR_BLACK, rectColor);
        return generateCircle(displayMainLeft + displayMainSize / 2, displayMainTop + displayMainSize / 2, circleSize, color, color);
    };

    getDisplayServer = function (string) {
        return generateText(string);
    };

    getIconBitwise = function (icon) {
        var iconString = readImage(icon);
        return stringToBits(iconString);
    };

    /**
     * Get the startdisplay with the logo of gridonic (atm)
     * @returns {*}
     */
    getStartDisplay = function () {
        return stringToBits(
            readImage(
                startImageRaw
            )
        );
    };

    /**
     * Get a full white display.
     * @returns {*}
     */
    getWhiteDisplay = function () {
        return stringToBits(generateEmptyLines(displayHeight));
    };

    /**
     * returns an array, converted to a string
     *
     * content:
     *  0: start
     *  1: padding
     *  2: height of worktime
     *  3: percent of worktime (how long user is working)
     *
     * @param workingPercent
     * @returns {string}
     */
    getWorktimeDisplay = function (workingPercent) {
        return "0|" + displayPadding + "|" + workTimeHeight + "|" +  workingPercent;
    };

    /**
     * Replace a part of a display-string with an icon.
     *
     * @param   imageString     The finished string for the display.
     * @param   startY          On which line of the string do we start?
     * @param   startX          On which position?
     * @param   width           Width of the icon we will insert.
     * @param   height          Height of the icon we will insert.
     * @param   icon            Raw Json-data to insert.
     * @returns {*}
     */
    replacePart = function (imageString, startX, startY, width, height, icon) {
        var i = 0;

        for (var j = startY; j < height; j++) {
            imageString = imageString.substring(0, startX + displayWidth * j) + icon[i] + imageString.substring(startX + width + displayWidth * j, imageString.length);
            i++;
        }

        return imageString;
    };

    readImage = function (image) {
        var imageString = "";
        for (var i = 0; i < image.length; i++) {
            imageString += image[i];
        }
        return imageString;
    };

    stringToBits = function (imageString) {

        var hexChar = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
        var byteChar = [
            "0000", "0001", "0010", "0011",
            "0100", "0101", "0110", "0111",
            "1000", "1001", "1010", "1011",
            "1100", "1101", "1110", "1111",
        ];

        function byteToHex(b) {
            return hexChar[byteChar.indexOf(b)];
        }

        var bitString = "";
        var byte = "";
        var hex;
        var iBlack = 0;
        var iWhite = 0;

        for (var i = 0; i < imageString.length; i = i + 4) {
            byte = imageString.substr(i, 4);
            hex = byteToHex(byte);

            if (iWhite > 0 && hex != 'A') {
                bitString += '-' + iWhite;
                bitString += hex;
                iWhite = 0;
            } else if (iBlack > 0 && hex != 'P') {
                bitString += 'x' + iBlack;
                bitString += hex;
                iBlack = 0;
            } else if (hex === 'A') {
                iWhite++;
            } else if (hex === 'P') {
                iBlack++;
            } else {
                bitString += hex;
            }
        }

        if (iBlack > 0) {
            bitString += 'x' + iBlack;
        } else if (iWhite > 0) {
            bitString += '-' + iWhite;
        }

        return bitString;
    };
}

module.exports = graphic;
