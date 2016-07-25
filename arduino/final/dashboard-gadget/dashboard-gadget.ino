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

// Variables for display
Adafruit_ILI9340 tft    = Adafruit_ILI9340(_cs, _dc, _rst);

// Variables for the ethernet-module
SocketIOClient client;
byte mac[]                  = { 0xAA, 0x01, 0xBE, 0xEF, 0xFE, 0xEE };
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
int           gadgetID      = 6;
int           miniDelay     = 200;
int           defaultDelay  = 400;
int           longDelay     = 800;


// Functions
void logger(String message);

/* =========================================================================
 * Setup the system
 * ========================================================================= */
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

  initDisplay();
  initEthernet();
}

/**
 * Initiate the display, write a test-message to it.
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
  tft.println("Screen started");
  delay(miniDelay);
}

/**
 * Initiate the ethernet module.
 */
void initEthernet()
{
  logger("initEthernet");
  
  tft.fillScreen(ILI9340_WHITE);
  tft.setTextColor(ILI9340_BLACK);
  tft.setTextSize(2);
  tft.println("connecting...");
  
  // try connection till it is connected
  while(!tryConnection()) {
    logger("connection not possible");
    delay(miniDelay);
  }
  
  logger("connection started.");
  delay(defaultDelay);
}


/**
 * Try to make a connection to the server.
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
 * Connect the client basically with the server.
 * Does the first step for connection, all on the socket-side.
 */
void connectClient()
{
  tft.fillScreen(ILI9340_WHITE);
  tft.setTextColor(ILI9340_BLACK);
  tft.setCursor(0,0);
  tft.setTextSize(2);
  tft.println("connecting...");
  logger("connecting...");
  
  loggedIn = false;
  helloed = false;
  while(!tryConnection()) {
    tft.println("connecting not possible.");
    logger("connection not possible");
    delay(defaultDelay);
    tft.println("try again.");
    logger("try again");
  }
}

/**
 * Log in the gadget to the server
 */
void loginGadget()
{
  logger("log in the gadget on our server");
  client.send("loginGadget", "id", (String) gadgetID);
}

/**
 * Say hello on the server.
 */
void sayHello()
{
  logger("say hello on our server");
  client.send("hello", "message", "full graphic");
}

/**
 * Draw 4 bits on the screen.
 */
void draw4bit(int i, uint16_t a, uint16_t b, uint16_t c, uint16_t d) {
  int x = i % 320;
  int y = (i - x) / 320;

  tft.drawPixel(x, y, a);
  tft.drawPixel(x, y, b);
  tft.drawPixel(x, y, c);
  tft.drawPixel(x, y, d);
}

/**
 * Show the string on the screen.
 * 
 */
void showOnScreen(String m)
{
  logger("showOnScreen");
  char message[m.length()];
  m.toCharArray(message, m.length());
  logger("length of message: ");
  logger((String) m.length());
  logger(m);
  int x = 0;
  char current;
  char next;
  int i = 0;
  int k = 0;
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

      for (k = 0; k < number.toInt(); k++) {
        if (current == 'x') {
          draw4bit(i, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK);
        } else {
          draw4bit(i, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE);
        }
        i++;
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

void handleResponse()
{
  logger("handleResponse: " + RID);
  if (RID == "access")
  {
    loggedIn = true;
  }
  
  else if (RID == "show")
  {
    helloed = false;
    showOnScreen(Rcontent);
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
 * Logger for everything.
 */
void logger(String message) {
  if (debug) {
    Serial.println(message);
  }
}


/**
 * Do the loop
 */
void loop() {

  msCurrent = millis();

  // check if client is connected
  if(msCurrent - msPrev > interval) {
    logger("looooop the shit (" + String(loopIndex) + ")");
    msPrev = msCurrent;

    // uh oh! no connection...
    if (!client.connected()) {
      connectClient();
    } else {
      if (!loggedIn) {
        tft.fillScreen(ILI9340_WHITE);
        tft.setCursor(0,0);
        tft.setTextColor(ILI9340_BLACK);
        tft.setTextSize(2);
        tft.println("client connected. login.");
        logger("loginGadget()");
        loginGadget();
      }
      
      if (loggedIn && !helloed) {
        logger("sayHello()");
        sayHello();
      }
    }
  }

  if (client.monitor()) {
    handleResponse();
  }
  
  loopIndex++;
}
