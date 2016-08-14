displayDrawer = function () {

    // Functions
    var bitToImage;
    var clearMainDisplay;
    var drawWorkingIcon;
    var init;
    var log;
    var showDisplay;
    var showMainDisplay;
    var showMainMenuCircle;
    var showSubmenuCircle;
    var showPollCircles;
    var showMenu;
    var showMood;
    var showProject;
    var showTime;
    var showWorkTime;

    // Constants
    var DISPLAY_WIDTH = 320;
    var DISPLAY_HEIGHT = 240;
    var COLOR_WHITE = '#ffffff';
    var COLOR_BLACK = '#000000';

    // Variables
    var canvas = document.getElementById("display");
    var projectBox = document.getElementById("project-box");
    var moodBox = document.getElementById("mood-box");
    var context;

    // Icons
    var iconRoom84 = 'x51I-1Dx17O-3Px16M-3Dx16A-3Bx15O-5Px14O-5Hx14M-1Bx1I-1Dx14I-1Hx1M-1Dx14I-1Px1O-1Bx14IBx3ABx14ABx3IBx14ABx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx1Ax1IBx14ADO-1HIBx14ADO-1HIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DI-1Px12O-1DM-1DI-1Px12O-1DM-1DI-1Hx12M-1DM-1DI-1Dx12I-1DM-1DM-1Bx12A-1PM-1DO-1Bx12A-1PM-1Dx1A-1Px10O-1Bx1I-1Dx1I-1Px10O-1Dx1A-2PM-1Hx10M-1HO-3HM-1Hx10M-1HM-3DO-1Hx10M-1HM-3DO-1Dx10M-1PI-3BO-1Dx10I-1PI-3Bx1ADx10I-1PI-3Bx1ADx10I-1P-5P-1Dx10I-1PI-3Bx1ADx10I-1PI-3Bx1ADx10M-1PI-3BO-1Dx10M-1PI-3BO-1Dx10M-1HM-3DO-1Dx10M-1HM-3HO-1Hx10O-1HO-3HM-1Hx10O-1Dx1I-1Bx1M-1Hx10O-1Bx1O-1Dx1I-1Px11ABx5A-1Px11A-1Hx3O-1Bx12I-1Dx3M-1Bx12M-2Px2A-1Dx12O-2Dx1I-2Hx13A-6Px13I-5Bx14M-5Dx15A-4Px15M-3Dx17A-1Bx51';
    var iconSound84 = 'x142IDx19ADx18M-1Dx18M-1Dx18A-1Dx18A-1Dx17M-2Dx17M-2Dx17A-2Dx17A-2Dx16M-3Dx16M-3Dx16A-3Dx15O-4Dx15O-4Dx15I-4Dx15I-4Dx14O-5Dx14O-5Dx8A-4DM-5Dx7M-5DM-5Dx7M-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7M-5DM-5Dx7M-5DM-5Dx8A-4DM-5Dx14O-5Dx15A-4Dx15I-4Dx15M-4Dx15O-4Dx16A-3Dx16I-3Dx16M-3Dx16O-3Dx17A-2Dx17I-2Dx17M-2Dx17O-2Dx18A-1Dx18I-1Dx18M-1Dx18O-1Dx19ADx19IDx129';
    var iconMood84 = 'x198M-1Dx17O-3Hx16I-3Bx16A-4Px14O-5Dx14M-5Bx14I-5Bx14A-6Px13A-6Hx12O-7Hx12M-7Dx12M-7Dx12M-7Dx12M-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12M-7Bx12M-7Dx12M-7Dx12O-7Dx12O-7Hx13A-6Hx13A-6Px13I-5Bx14M-5Dx14O-5Dx15A-4Px15I-3Bx16I-4Hx14O-6Px13I-6Hx12O-7Bx12M-8Hx11I-8Dx11A-8Bx10O-10Px9M-10Hx9I-10Dx9A-10Dx9A-10Bx8O-12Px7M-12Px7M-12Hx7I-12Hx7I-12Dx7I-12Dx7A-12Dx7A-12Bx7A-12Bx7A-12Bx6O-13Bx6O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px212';

    /**
     * Generate an image out of a bitString.
     * @param bitString
     * @returns {string}
     */
    bitToImage = function (bitString) {
        var imageString = "";
        var bitStringArray = bitString.split('');
        var current;
        var numberString;
        var i = 0;
        var j;
        var hexChar = {
            A: '0000',
            B: '0001',
            C: '0010',
            D: '0011',
            E: '0100',
            F: '0101',
            G: '0110',
            H: '0111',
            I: '1000',
            J: '1001',
            K: '1010',
            L: '1011',
            M: '1100',
            N: '1101',
            O: '1110',
            P: '1111',
        };
        var hexCharSix = {
            A: '000000',
            B: '000001',
            C: '000010',
            D: '000011',
            E: '000100',
            F: '000101',
            G: '000110',
            H: '000111',
            I: '001000',
            J: '001001',
            K: '001010',
            L: '001011',
            M: '001100',
            N: '001101',
            O: '001110',
            P: '001111',
            Q: '010000',
            R: '010001',
            S: '010010',
            T: '010011',
            U: '010100',
            V: '010101',
            W: '010110',
            X: '010111',
            Y: '011000',
            Z: '011001',
            a: '011010',
            b: '011011',
            c: '011100',
            d: '011101',
            e: '011110',
            f: '011111',
            g: '100000',
            h: '100001',
            i: '100010',
            j: '100011',
            k: '100100',
            l: '100101',
            m: '100110',
            n: '100111',
            o: '101000',
            p: '101001',
            q: '101010',
            r: '101011',
            s: '101100',
            t: '101101',
            u: '101110',
            v: '101111',
            w: '110000',
            x: '110001',
            y: '110010',
            z: '110011',
            '0': '110100',
            '1': '110101',
            '2': '110110',
            '3': '110111',
            '4': '111000',
            '5': '111001',
            '6': '111010',
            '7': '111011',
            '8': '111100',
            '9': '111101',
            'ä': '111110',
            'ö': '111111',
        };

        for (i; i < bitString.length; i++) {
            current = bitStringArray[i];

            if (current == '-' || current == 'x') {
                numberString = "";
                i++;
                while (bitStringArray[i] != 'x' && bitStringArray[i] != '-' && !hexChar[bitStringArray[i]] && i < bitString.length) {
                    numberString += bitStringArray[i];
                    i++;
                }
                i--;

                for (j = 0; j < parseInt(numberString); j++) {
                    imageString += current == "x" ? '1111' : '0000';
                }
            } else if (hexChar[current]) {
                imageString += hexChar[current];
            }
        }

        return imageString;
    };

    clearMainDisplay = function () {
        context.fillStyle = COLOR_WHITE;
        context.fillRect(0, 50, 320, 140);
    };

    /**
     * Draw the working icon.
     * @param x
     * @param y
     */
    drawWorkingIcon = function (x, y) {

        context.fillStyle = COLOR_BLACK;

        context.fillRect(x + 2, y, 1, 1);
        context.fillRect(x + 3, y, 1, 1);
        context.fillRect(x + 4, y, 1, 1);
        context.fillRect(x + 5, y, 1, 1);
        context.fillRect(x + 6, y, 1, 1);
        context.fillRect(x + 7, y, 1, 1);
        context.fillRect(x + 8, y, 1, 1);
        context.fillRect(x + 9, y, 1, 1);

        context.fillRect(x + 2, y + 1, 1, 1);  context.fillRect(x + 9, y + 1, 1, 1);
        context.fillRect(x + 2, y + 2, 1, 1);  context.fillRect(x + 9, y + 2, 1, 1);
        context.fillRect(x + 3, y + 3, 1, 1);  context.fillRect(x + 8, y + 3, 1, 1);
        context.fillRect(x + 4, y + 4, 1, 1);  context.fillRect(x + 7, y + 4, 1, 1);
        context.fillRect(x + 5, y + 5, 2, 2);
        context.fillRect(x + 4, y + 7, 1, 1);  context.fillRect(x + 7, y + 7, 1, 1);
        context.fillRect(x + 3, y + 8, 1, 1);  context.fillRect(x + 8, y + 8, 1, 1);
        context.fillRect(x + 2, y + 9, 1, 1);  context.fillRect(x + 9, y + 9, 1, 1);
        context.fillRect(x + 2, y + 10, 1, 1);  context.fillRect(x + 9, y + 10, 1, 1);

        context.fillRect(x + 2, y + 11, 1, 1);
        context.fillRect(x + 3, y + 11, 1, 1);
        context.fillRect(x + 4, y + 11, 1, 1);
        context.fillRect(x + 5, y + 11, 1, 1);
        context.fillRect(x + 6, y + 11, 1, 1);
        context.fillRect(x + 7, y + 11, 1, 1);
        context.fillRect(x + 8, y + 11, 1, 1);
        context.fillRect(x + 9, y + 11, 1, 1);
    };

    /**
     * Initialize DisplayDrawer
     */
    init = function () {
        console.log('init displayDrawer');

        if (canvas !== null) {
            context = canvas.getContext("2d");
        }
    };

    /**
     * Log a message
     * @param message
     */
    log = function (message) {
        console.log(message);
    };

    /**
     * Show a full display, based on a bitString.
     * @param data
     */
    showDisplay = function (data) {
        log('socketShow');

        if (data.draw) {

            var draw = bitToImage(data.draw).split("");

            context.fillStyle = COLOR_WHITE;
            context.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

            context.fillStyle = COLOR_BLACK;
            var x = 0;
            for (var i = 0; i < DISPLAY_HEIGHT; i++) {
                for (var j = 0; j < DISPLAY_WIDTH; j++) {
                    if (draw[x] === '1') {
                        context.fillRect(j, i, 1, 1);
                    }
                    x++;
                }
            }
        }
    };

    /**
     * Show the main display
     * @param data
     */
    showMainDisplay = function (data) {
        var drawData = data.draw.split('|');

        clearMainDisplay();

        if (drawData[0] === 'RECT') {

            var x = parseInt(drawData[1]);
            var y = parseInt(drawData[2]);
            var w = parseInt(drawData[3]);
            var h = parseInt(drawData[4]);
            var borderColor = drawData[5] === "1" ? COLOR_BLACK : COLOR_WHITE;
            var rectColor = drawData[6] === "1" ? COLOR_BLACK : COLOR_WHITE;

            context.fillStyle = borderColor;
            context.fillRect(x, y, w, h);

            context.fillStyle = rectColor;
            context.fillRect(x + 2, y + 2, w - 4, h - 4);
        } else if (drawData[0] === 'CIRC') {

            var xCircle             = parseInt(drawData[1]);
            var yCircle             = parseInt(drawData[2]);
            var radCircle           = parseInt(drawData[3]);
            var borderColorCircle   = drawData[4] === "1" ? COLOR_BLACK : COLOR_WHITE;
            var circleColor         = drawData[5] === "1" ? COLOR_BLACK : COLOR_WHITE;

            context.fillStyle = borderColorCircle;
            context.beginPath();
            context.arc(xCircle, yCircle, radCircle, 0, 2 * Math.PI);
            context.closePath();
            context.fill();

            context.fillStyle = circleColor;
            context.beginPath();
            context.arc(xCircle, yCircle, radCircle - 2, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
        } else if (drawData[0] === 'TXT') {

            var textSize = 15;
            var urlString = drawData[2];
            var urlStrings = urlString.split('%');
            var padding = parseInt(drawData[1]);

            context.fillStyle = COLOR_BLACK;
            context.font = textSize + "px Courier New";

            for (var i = 0; i < urlStrings.length; i++) {
                context.fillText(urlStrings[i], padding, DISPLAY_HEIGHT / 2 - 60 + padding + (padding + textSize) * i);
            }
        } else if (drawData[0] === 'MEN') {
            if (drawData[1] === '1') {
                showMainMenuCircle();
                var icon = null;

                context.fillStyle = COLOR_WHITE;
                context.fillRect(118, 78, 84, 84);

                if (drawData[2] === 'MOOD') {
                    icon = iconMood84;
                } else if (drawData[2] === 'SOUND') {
                    icon = iconSound84;
                } else if (drawData[2] === 'ROOM') {
                    icon = iconRoom84;
                }

                if (icon !== null) {

                   var imageString = bitToImage(icon);
                    var draw = imageString.split("");

                    context.fillStyle = COLOR_BLACK;
                    var x = 0;
                    for (var i = 78; i < 162; i++) {
                        for (var j = 118; j < 202; j++) {
                            if (draw[x] === '1') {
                                context.fillRect(j, i, 1, 1);
                            }
                            x++;
                        }
                    }
                }
            }
        }
    };

    showMainMenuCircle = function () {
        clearMainDisplay();
        context.fillStyle = COLOR_BLACK;
        context.beginPath();
        context.arc(160, 120, 60, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    };

    showSubmenuCircle = function () {
        clearMainDisplay();

        context.fillStyle = COLOR_BLACK;

        context.beginPath();
        context.arc(136, 120, 60, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        context.beginPath();
        context.arc(203, 92, 32, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    };

    showPollCircles = function () {
        clearMainDisplay();

        context.fillStyle = COLOR_BLACK;

        context.beginPath();
        context.arc(112, 120, 60, 0, 2 * Math.PI);
        context.closePath();
        context.fill();

        context.beginPath();
        context.arc(208, 120, 60, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    };

    showMenu = function (data) {
        var splitData = data.draw.split('|');
        var start = parseInt(splitData[0]);
        var padding = parseInt(splitData[1]);
        var counts = parseInt(splitData[2]);
        var active = parseInt(splitData[3]) + 1;
        var lineHeight = parseInt(splitData[4]);
        var lineWidth = DISPLAY_WIDTH - (padding * 2);
        var singleLineWidth = Math.round(lineWidth / counts);
        var activeLeft = padding + (active - 1) * singleLineWidth;

        context.fillStyle = COLOR_WHITE;
        context.fillRect(padding, start, lineWidth, lineHeight);

        context.fillStyle = COLOR_BLACK;
        if (counts > 1) {
            context.fillRect(activeLeft, start, singleLineWidth, lineHeight);
        }
        context.fillRect(padding, start + lineHeight, lineWidth, lineHeight);
    };

    showMood = function (data) {
        log('showMood');
        log(data);

        if (data.color === undefined || data.color === null) {
            moodBox.style.backgroundColor = 'transparent';
        } else {
            var dataSplit = data.color.split('|');
            var r = dataSplit[0];
            var g = dataSplit[1];
            var b = dataSplit[2];
            moodBox.style.backgroundColor = 'rgba(' + r + ',' + g + ',' + b + ', 1)';
        }
    };

    showProject = function (data) {
        log('showProject');
        log(data);

        if (data.color === undefined || data.color === null) {
            projectBox.style.backgroundColor = 'transparent';
        } else {
            var dataSplit = data.color.split('|');
            var r = dataSplit[0];
            var g = dataSplit[1];
            var b = dataSplit[2];
            projectBox.style.backgroundColor = 'rgba(' + r + ',' + g + ',' + b + ', 1)';
        }
    };

    /**
     * Show the work time of the user on the display
     * @param data
     */
    showWorkTime = function (data) {
        log("showWorkTime");
        log(data);

        var splitData = data.draw.split('|');
        var iconSize = 12;
        var start = parseInt(splitData[0]);
        var padding = parseInt(splitData[1]);
        var height = parseInt(splitData[2]);
        var percent = parseInt(splitData[3]);
        var rectWidth = DISPLAY_WIDTH - (padding * 2) - iconSize;
        var workingWidth = rectWidth * percent / 100;

        context.fillStyle = COLOR_WHITE;
        context.fillRect(0, start, DISPLAY_WIDTH, (start + padding * 2 + height));

        context.fillStyle = COLOR_BLACK;
        context.fillRect((padding + iconSize), start + padding, rectWidth, height);
        context.fillStyle = COLOR_WHITE;
        context.fillRect((padding + iconSize) + 1, start + padding + 1, rectWidth - 2, height - 2);

        drawWorkingIcon(padding, start + padding);

        context.fillStyle = COLOR_BLACK;
        if (percent <= 100) {
            context.fillRect(padding + iconSize, start + padding, workingWidth, height);
        } else {
            workingWidth = rectWidth * 100 / percent;
            context.fillRect(padding + iconSize, start + padding, workingWidth - 1, height);
            context.fillRect(workingWidth + 1 + padding + iconSize, start + padding, rectWidth - workingWidth - 1, height);
        }
    };

    /**
     * Show the normal time on the display
     * @param data
     */
    showTime = function (data) {
        log("showTime");
        log(data);

        var splitData = data.draw.split('|');
        var textSize = 15;
        var padding = parseInt(splitData[0]);
        var timeString = splitData[1];

        context.fillStyle = COLOR_WHITE;
        context.fillRect(0, DISPLAY_HEIGHT - padding * 2 - textSize, DISPLAY_WIDTH, padding * 2 + textSize);

        context.fillStyle = COLOR_BLACK;
        context.font = textSize + "px Courier New";
        context.fillText(timeString, padding, DISPLAY_HEIGHT - padding);
    };

    // Return all public functions
    return {
        init:               init,
        showDisplay:        showDisplay,
        showMainDisplay:    showMainDisplay,
        showMenu:           showMenu,
        showMood:           showMood,
        showProject:        showProject,
        showTime:           showTime,
        showWorkTime:       showWorkTime,
    };
};