displayDrawer = function () {

    // Functions
    var bitToImage;
    var drawWorkingIcon;
    var init;
    var log;
    var showDisplay;
    var showMainDisplay;
    var showMenu;
    var showTime;
    var showWorkTime;

    // Constants
    var DISPLAY_WIDTH = 320;
    var DISPLAY_HEIGHT = 240;
    var COLOR_WHITE = '#ffffff';
    var COLOR_BLACK = '#000000';

    // Variables
    var canvas = document.getElementById("display");
    var context;

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

            context.fillStyle = COLOR_WHITE;
            context.fillRect(xCircle - radCircle, yCircle - radCircle, radCircle * 2, radCircle * 2);

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
        }
    };

    showMenu = function (data) {
        log("showMenu");
        log(data);

        var splitData = data.draw.split('|');
        var start = parseInt(splitData[0]);
        var padding = parseInt(splitData[1]);
        var counts = parseInt(splitData[2]);
        var active = parseInt(splitData[3]) + 1;
        var lineHeight = parseInt(splitData[4]);
        var lineWidth = DISPLAY_WIDTH - (padding * 2);
        var singleLineWidth = Math.round(lineWidth / counts);
        var activeLeft = padding + (active - 1) * singleLineWidth;

        context.fillStyle = COLOR_BLACK;
        if (counts > 1) {
            context.fillRect(activeLeft, start, singleLineWidth, lineHeight);
        }
        context.fillRect(padding, start + lineHeight, lineWidth, lineHeight);
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
        showTime:           showTime,
        showWorkTime:       showWorkTime,
    };
};