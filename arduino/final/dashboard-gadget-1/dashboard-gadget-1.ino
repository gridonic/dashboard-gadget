#include "SPI.h"
#include "Adafruit_GFX.h"
#include "Adafruit_ILI9340.h"
#include "SocketIOClient.h"

// Ports for the display
#define _sclak          52
#define _miso           50
#define _mosi           51
#define _cs             47
#define _rst            3 // 9
#define _dc             2 // 8

// Pins for the LEDs
const int LEDButtonRightR = 27;   // button right
const int LEDButtonRightG = 25;   // button right
const int LEDButtonRightB = 23;   // button right
const int LEDButtonLeftR = 29;    // button left
const int LEDButtonLeftG = 31;    // button left
const int LEDButtonLeftB = 33;    // button left
const int LEDProjectR = 39;       // project color
const int LEDProjectG = 37;       // project color
const int LEDProjectB = 35;       // project color
const int LEDMoodR = 45;          // mood color
const int LEDMoodG = 43;          // mood color
const int LEDMoodB = 41;          // mood color

const int ButtonLeftPin = A1;
const int ButtonRightPin = A0;

// Variables for the LEDs
const int LED_BUTTON_LEFT         = 1;
const int LED_BUTTON_RIGHT        = 2;
const int LED_PROJECT             = 4;
const int LED_MOOD                = 8;
unsigned int buttonLeftValue      = 0;
unsigned int buttonRightValue     = 0;
unsigned int buttonLeftValues[]   = {0, 0, 0, 0};
unsigned int buttonRightValues[]  = {0, 0, 0, 0};
unsigned int buttonActivateDiff   = 5;
unsigned int buttonDeactivateDiff = 1;
int checkButtonInterval           = 60;
unsigned long buttonLeftActive    = 0;
unsigned long buttonRightActive   = 0;

// Variables for display
Adafruit_ILI9340 tft        = Adafruit_ILI9340(_cs, _dc, _rst);
unsigned int displayWidth   = 320;
unsigned int displayHeight  = 240;

// Variables for the ethernet-module
SocketIOClient client;
byte mac[]                  = { 0x20, 0x67, 0x89, 0x4F, 0x60, 0x75 }; // generated here: http://www.miniwebtool.com/mac-address-generator/
char hostname[]             = "192.168.2.98";
int port                    = 3000;
bool loggedIn               = false;
bool helloed                = false;
extern String RID;
extern String Rname;
extern String Rcontent;

// Variables for global setting
unsigned long loopIndex     = 0;
unsigned long msPrev        = 0;
unsigned long msCurrent     = 0;
long          interval      = 1000;
const int     debug         = true;
const int     internet      = true;
int           gadgetID      = 1;
int           miniDelay     = 250;
int           defaultDelay  = 500;
int           longDelay     = 1000;


// Functions
void logger(String message);

/* =========================================================================
   Setup the system
   ========================================================================= */
void setup() {
  // put your setup code here, to run once:

  Serial.begin(9600);
  tft.begin();

  if (debug) {
    logger("=======================================================");
    logger("  Dashboard-Gadget: Start the arduino with the setup.  ");
    logger("=======================================================");
  }

  loggedIn = false;
  helloed = false;
  
  initButtons();
  initLEDs();
  initDisplay();
  if (internet) {
    initEthernet();
  }
}

void initButtons() {
  pinMode(ButtonLeftPin, INPUT);
  pinMode(ButtonRightPin, INPUT);

  delay(defaultDelay);

  Serial.print("Left: ");
  Serial.print(analogRead(ButtonLeftPin));
  Serial.print(". Right: ");
  Serial.println(analogRead(ButtonRightPin));
  Serial.println("buttons initialized");
}

void initLEDs() {
  pinMode(LEDButtonLeftR, OUTPUT);
  pinMode(LEDButtonLeftG, OUTPUT);
  pinMode(LEDButtonLeftB, OUTPUT);
  pinMode(LEDButtonRightR, OUTPUT);
  pinMode(LEDButtonRightG, OUTPUT);
  pinMode(LEDButtonRightB, OUTPUT);
  pinMode(LEDProjectR, OUTPUT);
  pinMode(LEDProjectG, OUTPUT);
  pinMode(LEDProjectB, OUTPUT);
  pinMode(LEDMoodR, OUTPUT);
  pinMode(LEDMoodG, OUTPUT);
  pinMode(LEDMoodB, OUTPUT);

  setColor(LED_BUTTON_LEFT, 255, 0, 0);
  setColor(LED_BUTTON_RIGHT, 255, 0, 0);
  setColor(LED_PROJECT, 255, 0, 0);
  setColor(LED_MOOD, 255, 0, 0);
  delay(defaultDelay);
  setColor(LED_BUTTON_LEFT, 0, 0, 0);
  setColor(LED_BUTTON_RIGHT, 0, 0, 0);
  setColor(LED_PROJECT, 0, 0, 0);
  setColor(LED_MOOD, 0, 0, 0);
  delay(miniDelay);
  setColor(LED_BUTTON_LEFT, 0, 255, 0);
  setColor(LED_BUTTON_RIGHT, 0, 255, 0);
  setColor(LED_PROJECT, 0, 255, 0);
  setColor(LED_MOOD, 0, 255, 0);
  delay(defaultDelay);
  setColor(LED_BUTTON_LEFT, 0, 0, 0);
  setColor(LED_BUTTON_RIGHT, 0, 0, 0);
  setColor(LED_PROJECT, 0, 0, 0);
  setColor(LED_MOOD, 0, 0, 0);
  delay(miniDelay);
  setColor(LED_BUTTON_LEFT, 0, 0, 255);
  setColor(LED_BUTTON_RIGHT, 0, 0, 255);
  setColor(LED_PROJECT, 0, 0, 255);
  setColor(LED_MOOD, 0, 0, 255);
}

void setColor(int led, int red, int green, int blue)
{
    
    red = 255 - red;
    green = 255 - green;
    blue = 255 - blue;

    if (led == LED_BUTTON_LEFT) {
      analogWrite(LEDButtonLeftR, red);
      analogWrite(LEDButtonLeftG, green);
      analogWrite(LEDButtonLeftB, blue); 
    } else if (led == LED_BUTTON_RIGHT) {
      analogWrite(LEDButtonRightR, red);
      analogWrite(LEDButtonRightG, green);
      analogWrite(LEDButtonRightB, blue); 
    } else if (led == LED_PROJECT) {
      analogWrite(LEDProjectR, red);
      analogWrite(LEDProjectG, green);
      analogWrite(LEDProjectB, blue); 
    } else if (led == LED_MOOD) {
      analogWrite(LEDMoodR, red);
      analogWrite(LEDMoodG, green);
      analogWrite(LEDMoodB, blue); 
    }
}

/**
 *  Initiate the display, write a test-message to it.
 */
void initDisplay()
{
  logger("initDisplay");

  tft.setRotation(3);
  tft.setCursor(0, 0);
  tft.fillScreen(ILI9340_WHITE);
  delay(defaultDelay);
  tft.fillScreen(ILI9340_BLACK);
  delay(defaultDelay);
  tft.fillScreen(ILI9340_WHITE);
  tft.setTextColor(ILI9340_BLACK);
  tft.setTextSize(2);
  tft.println("screen initialized.");
  tft.println("");
  tft.println("loading...");
  delay(miniDelay);
}

/**
   Initiate the ethernet module.
*/
void initEthernet()
{
  logger("initEthernet");

  // try connection till it is connected
  while (!tryConnection()) {
    logger("connection not possible");
    delay(miniDelay);
  }

  logger("connection started.");
  delay(defaultDelay);
}


/**
   Try to make a connection to the server.
*/
bool tryConnection()
{
  logger("tryConnection()");

  Ethernet.begin(mac);
  logger("Ethernet.begin(mac)");

  if (!client.connect(hostname, port)) {
    logger("Not connected.");
    return false;
  }

  if (client.connected()) {
    logger("connected.");
    return true;
  } else {
    logger("Connection Error");
    return false;
  }
}

/**
   Connect the client basically with the server.
   Does the first step for connection, all on the socket-side.
*/
void connectClient()
{
  logger("connecting...");

  loggedIn = false;
  helloed = false;
  while (!tryConnection()) {
    logger("connection not possible");
    delay(defaultDelay);
    logger("try again");
  }
}

/**
   Log in the gadget to the server
*/
void loginGadget()
{
  logger("log in the gadget on our server");
  client.send("loginGadget", "id", (String) gadgetID);
}

/**
   Say hello on the server.
*/
void sayHello()
{
  logger("say hello on our server");
  client.send("hello", "message", "full graphic");
}

/**
   Draw 4 bits on the screen.
*/
void draw4bit(long i, uint16_t a, uint16_t b, uint16_t c, uint16_t d)
{
  long x = i % 320;
  long y = (i - x) / 320;

  tft.drawPixel(x, y, a);
  tft.drawPixel(x + 1, y, b);
  tft.drawPixel(x + 2, y, c);
  tft.drawPixel(x + 3, y, d);
}

String splitString(String data, char separator, int index)
{
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }

  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}

/**
   Show the string on the screen.

*/
void showOnScreen(String m)
{
  logger("showOnScreen");
  char message[m.length()];
  m.toCharArray(message, m.length());
  logger("length of message: ");
  logger((String) m.length());
  logger(m);
  long x = 0;
  char current;
  char next;
  long i = 0;
  long k = 0;
  String number;

  for (x; x < m.length(); x++) {
    current = message[x];

    if (current == 'x' || current == '-') {
      number = "";
      x++;
      next = message[x];
      while (isDigit(next)) {
        number += message[x];
        x++;
        next = message[x];
      }
      x--;
      number += message[x];

      for (k = 0; k < number.toInt(); k++) {
        if (current == 'x') {
          draw4bit(i, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK);
        } else {
          draw4bit(i, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE);
        }
        i += 4;
      }
    } else if (current == 'A') {
      draw4bit(i, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE);
      i += 4;
    } else if (current == 'B') {
      draw4bit(i, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE, ILI9340_BLACK);
      i += 4;
    } else if (current == 'C') {
      draw4bit(i, ILI9340_WHITE, ILI9340_WHITE, ILI9340_BLACK, ILI9340_WHITE);
      i += 4;
    } else if (current == 'D') {
      draw4bit(i, ILI9340_WHITE, ILI9340_WHITE, ILI9340_BLACK, ILI9340_BLACK);
      i += 4;
    } else if (current == 'E') {
      draw4bit(i, ILI9340_WHITE, ILI9340_BLACK, ILI9340_WHITE, ILI9340_WHITE);
      i += 4;
    } else if (current == 'F') {
      draw4bit(i, ILI9340_WHITE, ILI9340_BLACK, ILI9340_WHITE, ILI9340_BLACK);
      i += 4;
    } else if (current == 'G') {
      draw4bit(i, ILI9340_WHITE, ILI9340_BLACK, ILI9340_BLACK, ILI9340_WHITE);
      i += 4;
    } else if (current == 'H') {
      draw4bit(i, ILI9340_WHITE, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK);
      i += 4;
    } else if (current == 'I') {
      draw4bit(i, ILI9340_BLACK, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE);
      i += 4;
    } else if (current == 'J') {
      draw4bit(i, ILI9340_BLACK, ILI9340_WHITE, ILI9340_WHITE, ILI9340_BLACK);
      i += 4;
    } else if (current == 'K') {
      draw4bit(i, ILI9340_BLACK, ILI9340_WHITE, ILI9340_BLACK, ILI9340_WHITE);
      i += 4;
    } else if (current == 'L') {
      draw4bit(i, ILI9340_BLACK, ILI9340_WHITE, ILI9340_BLACK, ILI9340_BLACK);
      i += 4;
    } else if (current == 'M') {
      draw4bit(i, ILI9340_BLACK, ILI9340_BLACK, ILI9340_WHITE, ILI9340_WHITE);
      i += 4;
    } else if (current == 'N') {
      draw4bit(i, ILI9340_BLACK, ILI9340_BLACK, ILI9340_WHITE, ILI9340_BLACK);
      i += 4;
    } else if (current == 'O') {
      draw4bit(i, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK, ILI9340_WHITE);
      i += 4;
    } else if (current == 'P') {
      draw4bit(i, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK);
      i += 4;
    }
  }
}

void showFullScreen(uint16_t color)
{
  tft.fillRect(0, 0, displayWidth, displayHeight, color);
}

void drawWorkingIcon(unsigned int x, unsigned int y)
{
  tft.drawLine(x + 2, y, x + 9, y, ILI9340_BLACK);
  tft.drawPixel(x + 2, y + 1, ILI9340_BLACK);  tft.drawPixel(x + 9, y + 1, ILI9340_BLACK);
  tft.drawPixel(x + 2, y + 2, ILI9340_BLACK);  tft.drawPixel(x + 9, y + 2, ILI9340_BLACK);
  tft.drawPixel(x + 3, y + 3, ILI9340_BLACK);  tft.drawPixel(x + 8, y + 3, ILI9340_BLACK);
  tft.drawPixel(x + 4, y + 4, ILI9340_BLACK);  tft.drawPixel(x + 7, y + 4, ILI9340_BLACK);
  tft.drawRect(x + 5, y + 5, 2, 2, ILI9340_BLACK);
  tft.drawPixel(x + 4, y + 7, ILI9340_BLACK);  tft.drawPixel(x + 7, y + 7, ILI9340_BLACK);
  tft.drawPixel(x + 3, y + 8, ILI9340_BLACK);  tft.drawPixel(x + 8, y + 8, ILI9340_BLACK);
  tft.drawPixel(x + 2, y + 9, ILI9340_BLACK);  tft.drawPixel(x + 9, y + 9, ILI9340_BLACK);
  tft.drawPixel(x + 2, y + 10, ILI9340_BLACK);  tft.drawPixel(x + 9, y + 10, ILI9340_BLACK);
  tft.drawLine(x + 2, y + 11, x + 9, y + 11, ILI9340_BLACK);
}

void showWorktimeOnScreen(String m)
{
  int iconSize = 12;
  unsigned int start    = splitString(m, '|', 0).toInt();
  unsigned int padding  = splitString(m, '|', 1).toInt();
  unsigned int height   = splitString(m, '|', 2).toInt();
  unsigned int percent  = splitString(m, '|', 3).toInt();
  unsigned int rectWidth = displayWidth - (padding * 2) - iconSize;
  float workingWidthFloat = (float) rectWidth * (float) percent / 100;
  unsigned int workingWidth = (int) workingWidthFloat;

  tft.fillRect(0, start, displayWidth, (start + padding * 2 + height), ILI9340_WHITE);
  tft.drawRect((padding + iconSize), start + padding, rectWidth, height, ILI9340_BLACK);
  drawWorkingIcon(padding, start + padding);

  if (percent <= 100) {
    tft.fillRect(padding + iconSize, start + padding, workingWidth, height, ILI9340_BLACK);
  } else {
    workingWidth = (float) rectWidth * 100 / (float) percent;
    tft.fillRect(padding + iconSize, start + padding, workingWidth - 1, height, ILI9340_BLACK);
    tft.fillRect(workingWidth + 1 + padding + iconSize, start + padding, rectWidth - workingWidth - 1, height, ILI9340_BLACK);
  }
}

void showMenuOnScreen(String m)
{
  /*    var splitData = data.draw.split('|');
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
   */

   Serial.println(m);
}

void showTimeOnScreen(String m)
{
  unsigned int textSize = 15;
  unsigned int padding = splitString(m, '|', 0).toInt();
  String timeString = splitString(m, '|', 1);

  tft.fillRect(0, displayHeight - padding * 2 - textSize, displayWidth, padding * 2 + textSize, ILI9340_WHITE);
  tft.setCursor(padding, displayHeight - padding - textSize);
  tft.setTextColor(ILI9340_BLACK);
  tft.setTextSize(2);
  tft.println(timeString);
}

void setProjectColor(String m)
{
  if (m == "null") {
    setColor(LED_PROJECT, 0, 0, 0);
  } else {
    unsigned int r = splitString(m, '|', 0).toInt();
    unsigned int g = splitString(m, '|', 1).toInt();
    unsigned int b = splitString(m, '|', 2).toInt();
    setColor(LED_PROJECT, r, g, b);
  }
}

/**
 *   Handle input from server
 */
void handleResponse()
{
  logger("handleResponse: " + RID);
  if (RID == "access")
  {
    loggedIn = true;
  }

  else if (RID == "show")
  {
    helloed = true;
    showOnScreen(Rcontent);
  }

  else if (RID == "showBlack")
  {
    helloed = true;
    showFullScreen(ILI9340_BLACK);
  }

  else if (RID == "showWhite")
  {
    helloed = true;
    showFullScreen(ILI9340_WHITE);
  }

  else if (RID == "showWorkTime")
  {
    showWorktimeOnScreen(Rcontent);
  }

  else if (RID == "showTime")
  {
    showTimeOnScreen(Rcontent);
  }

  else if (RID == "showProject")
  {
    setProjectColor(Rcontent);
  }

  else if (RID == "showMenu")
  {
    showMenuOnScreen(Rcontent);
  }

  else
  {
    logger("monitor");
    logger("RID: ");
    logger(RID);
    logger("Rname: ");
    logger(Rname);
    logger("Rcontent: ");
    logger(Rcontent);
  }
}

/**
 *  Logger for everything.
 */
void logger(String message) {
  if (debug) {
    Serial.println(message);
  }
}

void buttonValuesPush() {
  for (int i = 0; i < 3; i++) {
    buttonLeftValues[i] = buttonLeftValues[i+1];
    buttonRightValues[i] = buttonRightValues[i+1];
  }
  buttonLeftValues[3] = (unsigned int) buttonLeftValue;
  buttonRightValues[3] = (unsigned int) buttonRightValue;
}

/**
 *  Check buttons for activity
 */
void checkButtons() {
  if (loopIndex % checkButtonInterval == 0) {
    buttonLeftValue = analogRead(ButtonLeftPin);
    buttonRightValue = analogRead(ButtonRightPin);
    buttonValuesPush();

    if (loopIndex / checkButtonInterval > 5) {

//      Serial.print("left: ");
//      Serial.print(buttonLeftValues[3]);
//      Serial.print(". right: ");
//      Serial.println(buttonRightValues[3]);

      if (buttonLeftActive == 0 && buttonLeftValues[3] + buttonActivateDiff < buttonLeftValues[0] &&
          buttonLeftValues[3] <= buttonLeftValues[2] &&
          buttonLeftValues[2] <= buttonLeftValues[1] &&
          buttonLeftValues[1] <= buttonLeftValues[0]) {
        
        buttonLeftActive = loopIndex;
        setColor(LED_BUTTON_LEFT, 150, 0, 40);
      }
      
      else if (buttonLeftActive > 0 &&
          buttonLeftValues[3] >= buttonLeftValues[2] &&
          buttonLeftValues[2] >= buttonLeftValues[1] &&
          buttonLeftValues[1] >= buttonLeftValues[0] &&
          buttonLeftValues[3] > buttonLeftValues[0] + buttonDeactivateDiff) {
        buttonLeftActive = 0;
        setColor(LED_BUTTON_LEFT, 0, 0, 180);
      }

      if (buttonRightActive == 0 && buttonRightValues[3] + buttonActivateDiff < buttonRightValues[0] &&
          buttonRightValues[3] <= buttonRightValues[2] &&
          buttonRightValues[2] <= buttonRightValues[1] &&
          buttonRightValues[1] <= buttonRightValues[0]) {
        buttonRightActive = loopIndex;
        setColor(LED_BUTTON_RIGHT, 150, 0, 40);
      }
      
      else if (buttonRightActive > 0 &&
          buttonRightValues[3] >= buttonRightValues[2] &&
          buttonRightValues[2] >= buttonRightValues[1] &&
          buttonRightValues[1] >= buttonRightValues[0] &&
          buttonRightValues[3] > buttonRightValues[0] + buttonDeactivateDiff) {
        buttonRightActive = 0;
        setColor(LED_BUTTON_RIGHT, 0, 0, 255);
      }

      // check if the buttons are active
      if (buttonLeftActive > 0 && buttonRightActive > 0) {
        Serial.println("Both buttons active");
        setColor(LED_BUTTON_RIGHT, 0, 200, 0);
        setColor(LED_BUTTON_LEFT, 0, 200, 0);
        delay(defaultDelay);
        buttonLeftActive = 0;
        buttonRightActive = 0;
        setColor(LED_BUTTON_LEFT, 0, 0, 255);
        setColor(LED_BUTTON_RIGHT, 0, 0, 255);        
      } else if (buttonLeftActive > 0 && buttonLeftActive < loopIndex - 30 * checkButtonInterval) {
        Serial.println("Left button active");
        setColor(LED_BUTTON_LEFT, 0, 130, 0);
        delay(defaultDelay);
        buttonLeftActive = 0;
        setColor(LED_BUTTON_LEFT, 0, 0, 255);
      } else if (buttonRightActive > 0 && buttonRightActive < loopIndex - 30 * checkButtonInterval) {
        Serial.println("Right button active");
        setColor(LED_BUTTON_RIGHT, 0, 130, 0);
        delay(defaultDelay);
        buttonRightActive = 0;
        setColor(LED_BUTTON_RIGHT, 0, 0, 255);
      }

      
    }

//    if (buttonRightValue != buttonRightValueLast || buttonLeftValue != buttonLeftValueLast) {
//      Serial.print("right: ");
//      Serial.print(buttonRightValue);
//      Serial.print(". left: ");
//      Serial.println(buttonLeftValue);
//    }
//
//    // activate left button
//    if (buttonLeftActive == 0 && buttonLeftValue + buttonActivateDiff < buttonLeftValueLast) {
//      buttonLeftActive = loopIndex;
//      setColor(LED_BUTTON_LEFT, 255, 0, 0);
//    }
//
//    // activate right button
//    if (buttonRightActive == 0 && buttonRightValue + buttonActivateDiff < buttonRightValueLast) {
//      buttonRightActive = loopIndex;
//      setColor(LED_BUTTON_RIGHT, 255, 0, 0);
//    }
//
//    // check if there are buttons active
//    if (buttonLeftActive > 0 && buttonRightActive > 0) {
//      Serial.println("Both buttons active");
//      setColor(LED_BUTTON_RIGHT, 0, 255, 0);
//      setColor(LED_BUTTON_LEFT, 0, 255, 0);
//    }
//
//    else if (buttonLeftActive > 0 && buttonLeftValueLast >= buttonLeftValue) {
//      Serial.println("button left active " + (String) buttonLeftValue);
//    }
//    
//    else if (buttonRightActive > 0 && buttonRightValueLast >= buttonRightValue) {
//      Serial.println("button right active " + (String) buttonRightValue);
//    }
//
//    if (buttonLeftActive > 0 && buttonLeftActive + checkButtonInterval * 30 < loopIndex) {
////    if (buttonLeftValueLast + buttonDeactivateDiff < buttonLeftValue) {
////      Serial.print("left last: ");
////      Serial.print(buttonLeftValueLast);
////      Serial.print(" value: ");
////      Serial.println(buttonLeftValue);
//      buttonLeftActive = 0;
//      setColor(LED_BUTTON_LEFT, 0, 0, 255);
//    }
//
//    if (buttonRightActive > 0 && buttonRightActive + checkButtonInterval * 30 < loopIndex) {
////    if (buttonRightValueLast + buttonDeactivateDiff < buttonRightValue) {
////        Serial.print("right last: ");
////        Serial.print(buttonRightValueLast);
////        Serial.print(" value: ");
////        Serial.println(buttonRightValue);
//        buttonRightActive = 0;
//        setColor(LED_BUTTON_RIGHT, 0, 0, 255);
//      }
//
//    buttonLeftValueLast = buttonLeftValue;
//    buttonRightValueLast = buttonRightValue;
  }
}


/**
 *  Do the loop
 */
void loop() {

  msCurrent = millis();

  // check buttons
  checkButtons();

  // check if client is connected
  if (msCurrent - msPrev > interval) {
    logger("looooop the shit (" + String(loopIndex) + ")");
    msPrev = msCurrent;

    if (internet) {
      // uh oh! no connection...
      if (!client.connected()) {
        connectClient();
      } else {
        if (!loggedIn) {
          logger("loginGadget()");
          loginGadget();
        }
  
        if (loggedIn && !helloed) {
          logger("sayHello()");
          sayHello();
        }
  
        if (loggedIn && helloed) {
          // hold connection by sending heartbeat from time to time.
          client.heartbeat(0);
        }
      }
    }
  }

  if (client.monitor()) {
    handleResponse();
  }

  loopIndex++;
}
