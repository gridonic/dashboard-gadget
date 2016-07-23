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
byte mac[]              = { 0xAA, 0x00, 0xBE, 0xEF, 0xFE, 0xEE };
char hostname[]         = "192.168.2.98";
int port                = 3000;
bool loggedIn           = false;
bool saidHello          = false;
extern String RID;
extern String Rname;
extern String Rcontent;

// Variables for global setting
unsigned long loopIndex = 0;
unsigned long msPrev    = 0;
unsigned long msCurrent = 0;
long interval           = 5000;
const int debug         = true;
int gadgetID            = 6;

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
    logger("=====================================");
    logger(" Start the arduino with the setup.");
    logger("=====================================");
  }

  initDisplay();
  initEthernet();
}

/**
 * Initiate the display, write a test-message to it.
 */
void initDisplay()
{
  tft.setRotation(3);
  tft.setCursor(0, 0);
  tft.fillScreen(ILI9340_WHITE);
  delay(200);
  tft.fillScreen(ILI9340_BLACK);
  delay(200);
  tft.fillScreen(ILI9340_WHITE);
  tft.setTextColor(ILI9340_BLACK);
  tft.setTextSize(2);
  tft.println("Screen started");
}

/**
 * Initiate the ethernet module.
 */
void initEthernet()
{
  logger("initEthernet");
  while(!tryConnection()) {
    logger("connection not possible");
    delay(500);
  }
  
  logger("connection started.");
  delay(500);
}


/**
 * Try to make a connection to the server.
 */
bool tryConnection() {

  Ethernet.begin(mac);
  logger("Ethernet.begin(mac)");

  if (!client.connect(hostname, port)) {
    logger("Not connected.");
    return false;
  }

  if (client.connected()) {
    logger("connected, now do the client.send()");
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
  loggedIn = false;
  saidHello = false;
  while(!tryConnection()) {
    logger("connection not possible");
    delay(500);
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
  client.send("hello", "message", "full graphic");
  saidHello = true;
}

void showOnScreen(String m)
{
  char message[m.length()];
  m.toCharArray(message, m.length());
  int x = 0;

  for (int i = 0; i < 320; i++) {
    for (int j = 0; j < 240; j++) {

      if (j % 5 == 0) {
        tft.drawPixel(i, j, ILI9340_RED);
      } else {
        tft.drawPixel(i, j, ILI9340_WHITE);
      }

//      if (m.length() < x) {
//        if (message[x]) {
//          tft.drawPixel(i, j, ILI9340_BLACK);
//        }
//      } else {
//        tft.drawPixel(i, j, ILI9340_RED);
//      }
      x++;
    }
  }
  x++;
}

void handleResponse()
{
  if (RID == "access")
  {
    loggedIn = true;
  }
  
  else if (RID == "show")
  {
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
    
//    tft.setCursor(0, 0);
//    tft.fillScreen(ILI9340_WHITE);
//    tft.setTextColor(ILI9340_RED);
//    tft.setTextSize(2);
//    tft.println(message);
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
        loginGadget();
      } else if (!saidHello) {
        sayHello();
      }
    }
  }

  if (client.monitor()) {
    handleResponse();
  }
  
  loopIndex++;
}
