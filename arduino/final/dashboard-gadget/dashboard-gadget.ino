#include "SPI.h"
#include "Adafruit_GFX.h"
#include "Adafruit_ILI9340.h"
#include "SocketIOClient.h"

// Ports for the display
#define _sclak          52
#define _miso           50
#define _mosi           51
#define _cs             22
#define _rst            9
#define _dc             8

// Pins for the LEDs
const int LEDProjectR = 24;
const int LEDProjectG = 25;
const int LEDProjectB = 26;

// Variables for display
Adafruit_ILI9340 tft        = Adafruit_ILI9340(_cs, _dc, _rst);
unsigned int displayWidth   = 320;
unsigned int displayHeight  = 240;

// Variables for the ethernet-module
SocketIOClient client;
byte mac[]                  = { 0x20, 0x67, 0x89, 0x4F, 0x60, 0x75 }; // generated here: http://www.miniwebtool.com/mac-address-generator/
char hostname[]             = "10.7.0.177";
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
int           gadgetID      = 6;
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

  initLEDs();
  initDisplay();
  initEthernet();
}

void initLEDs() {
  pinMode(LEDProjectR, OUTPUT);
  pinMode(LEDProjectG, OUTPUT);
  pinMode(LEDProjectB, OUTPUT);

  setColor("project", 255, 0, 0);
  delay(defaultDelay);
  setColor("project", 0, 255, 0);
  delay(defaultDelay);
  setColor("project", 0, 0, 255);
  delay(defaultDelay);
  setColor("project", 0, 0, 0);
}

void setColor(String led, int red, int green, int blue)
{
    
    red = 255 - red;
    green = 255 - green;
    blue = 255 - blue;

    if (led == "project") {
      analogWrite(LEDProjectR, red);
      analogWrite(LEDProjectG, green);
      analogWrite(LEDProjectB, blue); 
    }
}

/**
   Initiate the display, write a test-message to it.
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

/**
   Handle input from server
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
   Logger for everything.
*/
void logger(String message) {
  if (debug) {
    Serial.println(message);
  }
}


/**
   Do the loop
*/
void loop() {

  msCurrent = millis();

  // check if client is connected
  if (msCurrent - msPrev > interval) {
    logger("looooop the shit (" + String(loopIndex) + ")");
    msPrev = msCurrent;

    // uh oh! no connection...
    if (!client.connected()) {
      connectClient();
    } else {
      if (!loggedIn) {
        //        tft.fillScreen(ILI9340_WHITE);
        //        tft.setCursor(0,0);
        //        tft.setTextColor(ILI9340_BLACK);
        //        tft.setTextSize(2);
        //        tft.println("client connected. login.");
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

  if (client.monitor()) {
    handleResponse();
  }

  loopIndex++;
}
