'use strict';

function graphic () {

    // Functions
    var generateEmptyLines;
    var generateFullLines;
    var generateLines;
    var generateHorizontalLine;
    var generateWorkTime;
    var getBlackDisplay;
    var getDefaultDisplay;
    var getStartDisplay;
    var getWhiteDisplay;
    var readImage;
    var replacePart;
    var stringToBits;

    // Variables
    var displayWidth = 320;
    var displayHeight = 240;
    var displayPadding = 10;
    var workTimeHeight = 12;
    var workIconSize = 12;

    // Constants
    var WHITE = '0';
    var BLACK = '1';

    // JSON-Files
    var workIconRaw     = require('./png-json/work-icon.json');
    var startImageRaw   = require('./png-json/start-image.json');


    /* ======================================================================
     * Public functions
     * ====================================================================== */

    this.getBlackDisplay = function () { return getBlackDisplay(); };
    this.getDefaultDisplay = function (time, workingPercent, icon) { return getDefaultDisplay(time, workingPercent, icon); };
    this.getStartDisplay = function () { return getStartDisplay(); };
    this.getWhiteDisplay = function () { return getWhiteDisplay(); };

    /* ======================================================================
     * Private functions
     * ====================================================================== */

    /**
     * Generates empty lines.
     *
     *  |                    |
     *
     * @param lines
     * @returns {*}
     */
    generateEmptyLines = function (lines) {
        return generateLines(lines, WHITE);
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
        return generateLines(lines, BLACK);
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
                lineString += WHITE;
            } else {
                lineString += BLACK;
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
                        lineString += BLACK;
                    } else {
                        lineString += WHITE;
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
                        lineString += WHITE;
                    } else {
                        lineString += BLACK;
                    }
                }
            }
        }

        return replacePart(lineString, displayPadding, 0, 12, 12, workIconRaw);
    };

    getBlackDisplay = function () {
        return stringToBits(generateFullLines(displayHeight));
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

    getStartDisplay = function () {
        return stringToBits(
            readImage(
                startImageRaw
            )
        );
    };

    getWhiteDisplay = function () {
        return stringToBits(generateEmptyLines(displayHeight));
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

        console.log(imageString.length);
        console.log(bitString.length);

        return bitString;
    };
}

module.exports = graphic;
