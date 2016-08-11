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
const int LEDProjectR = 45;       // project color
const int LEDProjectG = 43;       // project color
const int LEDProjectB = 41;       // project color
const int LEDMoodR = 39;          // mood color
const int LEDMoodG = 37;          // mood color
const int LEDMoodB = 35;          // mood color

//const int ButtonLeftPin = A1;
//const int ButtonRightPin = A0;
const int ButtonRightPin = A5;
const int ButtonLeftPin = A6;


// Variables for the LEDs
const int LED_BUTTON_LEFT         = 1;
const int LED_BUTTON_RIGHT        = 2;
const int LED_PROJECT             = 4;
const int LED_MOOD                = 8;
unsigned int buttonLeftValue      = 0;
unsigned int buttonRightValue     = 0;
unsigned int buttonLeftValues[]   = {0, 0, 0, 0};
unsigned int buttonRightValues[]  = {0, 0, 0, 0};
unsigned int buttonActivateDiff   = 3;
//unsigned int buttonActivateDiffL   = 5;
//unsigned int buttonActivateDiffR   = 3;
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
char hostname[]             = "192.168.2.98"; // "192.168.43.231";
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
bool          pollIsActive  = false;

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
  
  initDisplay();
  initButtons();
  initLEDs();
  if (internet) {
    initEthernet();
  }
  delay(defaultDelay);
  tft.fillScreen(ILI9340_WHITE);
}

void initButtons() {
  pinMode(ButtonLeftPin, INPUT);
  pinMode(ButtonRightPin, INPUT);

  delay(defaultDelay);

  logger("Left Button: ");
  logger((String) analogRead(ButtonLeftPin));
  logger("Right Button: ");
  logger((String) analogRead(ButtonRightPin));
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
  delay(defaultDelay);
  setColor(LED_PROJECT, 0, 0, 0);
  setColor(LED_MOOD, 0, 0, 0);
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
  delay(defaultDelay);
  showOnScreen(F("x7211Ox79MDx78IDx78A-1Px76O-2Px76M-2Dx76I-2Dx76A-3Px74O-1B-2Px74M-1DI-1Dx74I-1HM-1Dx74A-1PO-2Px72O-1Bx2A-1Px72M-1Dx2I-1Dx72I-1Dx2M-1Dx72I-1Dx2I-1Dx72O-1Bx2A-1Hx72O-2PO-2Px73I-1HM-1Bx74I-1DI-1Dx74O-1B-2Hx71Nx2O-4Px2Lx68Ix3I-2Bx3Dx68Ax3I-2Dx2O-1Px5O-1Dx3M-2Dx3O-1Px1M-2Hx6I-1Hx3IDx2O-1Px1O-1Px3M-1Hx11O-1Dx2O-2Hx2M-1Px5I-2Hx2M-3Hx2O-1Px1M-3Hx4M-2Bx3IBx2O-1Px1O-1Px3A-2Px10M-1Dx2O-2Px2I-1Hx4O-3Bx2M-3Dx2O-1Px1M-3Bx4I-3Hx2I-1Px1O-1Px1O-1Px2M-3Dx10O-1Hx3I-1Hx2M-1Px4M-4Px1M-3Bx2O-1Px1M-4Hx2O-4Dx2I-1Hx1O-1Px1O-1Px2I-3Bx11Ax4I-1Dx2OBx5I-3Bx2M-4Px1O-1Px1M-4Dx2O-4Bx2I-1Hx1O-1Px1O-1Px2A-3Dx11Ix4M-1Bx3Dx5A-1HIDx2MBx1I-1Px1O-1Px1M-1PI-1Bx2M-1Dx1A-1Px1I-1Dx1O-1Px1O-1Px1O-2PIHx17A-1Px7O-1Bx1OHx2MBx1M-1Px1O-1Px1M-1Px1ABx2I-1Px1I-1Px1I-1Bx1O-1Px1O-1Px1O-1Dx1Mx18A-1Hx7O-1Hx5MBx1O-1Hx1O-1Px1M-1Px1I-1Px1IBx2M-1Hx1I-2PO-1Px1O-1Px1M-1Hx20M-1Dx7M-1Hx5MBx1O-1Px1O-1Px1M-1Px1M-1Px1ADx2O-1Hx1I-2PO-1Px1O-1Px1M-1Px17Dx2M-1Bx7M-1Px5MBx1O-1Px1O-1Px1M-1Px1M-1Px1ADx3ADx1I-2HO-1Px1O-1Px1IBx17ODx3A-1Px6M-1Px5MBx1M-1Px1O-1Px1M-1Px1O-1Hx1ADx3ADx1ID-1DO-1Px1O-1Px1IBx17M-1Px2A-1Hx6MBx6MBO-2Px1O-1Px1M-1Px1O-1Hx1AHx3ADx1ID-1BO-1Px1O-1Px1IBx17I-1Px2M-1Dx6MBx1O-2Px1M-3Bx2O-1Px1M-1Px1O-1Hx1AHx3IDx1IDIBO-1Px1O-1Px1IDx17I-1Dx2M-1Dx6MBx1O-2Px1M-3Dx2O-1Px1M-1Px1O-1HO-1Hx3ADx1IDM-1O-1Px1O-1Px1IBx17M-1Dx2I-1Hx6MBx1O-2Px1M-3Px2O-1Px1M-1Px1O-1Hx1AHx3ADx1IDM-1G-1Px1O-1Px1IBx17O-2Px1A-1Px6M-1Px1A-1Px1M-3Px2O-1Px1M-1Px1O-1Px1ADx3ADx1IDO-1C-1Px1O-1Px1IBx18A-1PO-1Bx7M-1Px1M-1Px1MBM-1Px2O-1Px1M-1Px1M-1Px1ADx3ADx1IDx1A-2Px1O-1Px1IBx18I-1DM-1Dx7M-1Hx1O-1Px1MBO-1Hx2O-1Px1M-1Px1M-1Px1ADx2O-1Hx1IDx1I-2Px1O-1Px1M-1Px17M-1DI-1Hx7O-1Hx1O-1Px1MBO-1Dx2O-1Px1M-1Px1I-1Px1IBx2M-1Hx1IDx1I-2Px1O-1Px1M-1Px17O-4Px7O-1Dx1O-1Px1MBx1ADx2O-1Px1M-1Px1ABx2I-1Px1I-1Px1IDx1M-2Px1O-1Px1M-1Hx1Ox16A-2Bx9A-1PM-1Px1MBx1IBx2O-1Px1M-1PM-1Bx2M-1DO-2Px1IDx1O-2Px1O-1Px1O-1Bx1IHx15I-2Dx9I-4Px1MBx1I-1Px1O-1Px1M-4Dx2O-4Bx2IDx2A-1Px1O-1Px2A-3Dx15M-2Hx9M-4Px1MBx1M-1Px1O-1Px1M-4Hx2O-4Dx2IDx2A-1Px1O-1Px2I-3Bx15O-2Px9O-4Px1MBx1O-1Hx1O-1Px1M-3Bx4I-3Hx2IDx2I-1Px1O-1Px2M-3Dx15O-2Hx10I-2Bx2MBx1O-1Dx1O-1Px1M-3Hx4M-2Bx3IDx2M-1Px1O-1Px2O-3Hx15M-2Dx11A-1Px2MBx2ADx1O-1Px1M-2Hx6I-1Hx3IDx2O-1Px1O-1Px3M-1Bx16I-2Dx76A-3Px74O-1B-2Px74M-1DI-1Dx74I-1HM-1Dx74A-1PO-2Px72O-1Bx2A-1Px72M-1Dx2I-1Dx72I-1Hx2M-1Dx72M-1Px2O-1Dx72OBx4AHx73Dx4Ix74Lx4Nx7105=="));
  delay(defaultDelay);
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
//      number += message[x]; // removed because at the gridonic-logo, every numbers last digit was twice saved.

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

void clearMainDisplay()
{
  tft.fillRect(50, 50, 220, 140, ILI9340_WHITE);
}

void showMenuCircle()
{
  clearMainDisplay();
  tft.fillCircle(160, 120, 60, ILI9340_BLACK);
}

void showSubmenuCircles()
{
  /* submenus - grosse chreis 120x120px (76/60), chline chreis 64x64px (171/60) */
  clearMainDisplay();
  tft.fillCircle(136, 120, 60, ILI9340_BLACK);
  tft.fillCircle(203, 92, 32, ILI9340_BLACK);
}

void showPollCircles()
{
  /* polls - beidi chreis 120x120 px (52/60) und (148/60) */
  clearMainDisplay();
  tft.fillCircle(112, 120, 60, ILI9340_BLACK);
  tft.fillCircle(208, 120, 60, ILI9340_BLACK);
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
  unsigned int start = splitString(m, '|', 0).toInt();
  unsigned int padding = splitString(m, '|', 1).toInt();
  unsigned int counts = splitString(m, '|', 2).toInt();
  unsigned int active = splitString(m, '|', 3).toInt() + 1;
  unsigned int lineHeight = splitString(m, '|', 4).toInt();
  unsigned int lineWidth = displayWidth - (padding * 2);
  unsigned int singleLineWidth = (float) lineWidth / (float) counts;
  unsigned int activeLeft = (float) (padding) + ((float) active - 1) * (float) singleLineWidth;

  tft.fillRect(0, start, displayWidth, lineHeight * 2, ILI9340_WHITE);

  if (counts > 1) {
      tft.fillRect(activeLeft, start, singleLineWidth, lineHeight, ILI9340_BLACK);
  }

  tft.fillRect(padding, start + lineHeight, lineWidth, lineHeight, ILI9340_BLACK);
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

void showMainDisplayOnScreen(String m)
{
  /* if (drawData[0] === 'RECT') {

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
        }
   */

  if (splitString(m, '|', 0) == "CIRC") {
    unsigned int xCircle            = splitString(m, '|', 1).toInt();
    unsigned int yCircle            = splitString(m, '|', 2).toInt();
    unsigned int radCircle          = splitString(m, '|', 3).toInt();
    unsigned int borderColorCircle  = splitString(m, '|', 4) == "1" ? ILI9340_BLACK : ILI9340_WHITE;
    unsigned int colorCircle        = splitString(m, '|', 5) == "1" ? ILI9340_BLACK : ILI9340_WHITE;

    tft.fillRect(xCircle - displayHeight / 4 - 1, yCircle - displayHeight / 4 - 1, displayHeight / 2 + 2, displayHeight / 2 + 2, ILI9340_WHITE);
    tft.fillCircle(xCircle, yCircle, radCircle, borderColorCircle);
    tft.fillCircle(xCircle, yCircle, radCircle - 2, colorCircle);
  }
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
    logger("showBlack");
    showFullScreen(ILI9340_BLACK);
  }

  else if (RID == "showWhite")
  {
    helloed = true;
    logger("showWhite");
    showFullScreen(ILI9340_WHITE);
  }

  else if (RID == "showWorkTime")
  {
    logger("showWorkTime " + Rcontent);
    showWorktimeOnScreen(Rcontent);
  }

  else if (RID == "showTime")
  {
    logger("showTime " + Rcontent);
    showTimeOnScreen(Rcontent);
  }

  else if (RID == "showProject")
  {
    logger("showProject " + Rcontent);
    setProjectColor(Rcontent);
  }

  else if (RID == "showMenu")
  {
    showMenuOnScreen(Rcontent);
  }

  else if (RID == "showMainDisplay")
  {
    showMainDisplayOnScreen(Rcontent);
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

    Serial.print("r: ");
    Serial.print(buttonRightValue);
    Serial.print(". l: ");
    Serial.println(buttonLeftValue);

    if (loopIndex / checkButtonInterval > 5) {

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
        logger("Both buttons active");
        if (pollIsActive) {
          // do nothing
        } else {
          client.send("arduinoButtonPushed", "buttons", "b");
        }

        showMenuCircle();
        setColor(LED_BUTTON_RIGHT, 0, 200, 0);
        setColor(LED_BUTTON_LEFT, 0, 200, 0);
        delay(defaultDelay * 2);
        buttonLeftActive = 0;
        buttonRightActive = 0;
        setColor(LED_BUTTON_LEFT, 0, 0, 255);
        setColor(LED_BUTTON_RIGHT, 0, 0, 255);        
      } else if (buttonLeftActive > 0 && buttonLeftActive < loopIndex - 30 * checkButtonInterval) {
        logger("Left button active");

        // check if poll is active, than send this:
        if (pollIsActive) {
          client.send("arduinoButtonPushed", "buttons", "p-l");
        } else {
          client.send("arduinoButtonPushed", "buttons", "l");
        }

        showSubmenuCircles();
        setColor(LED_BUTTON_LEFT, 0, 130, 0);
        delay(defaultDelay * 2);
        buttonLeftActive = 0;
        setColor(LED_BUTTON_LEFT, 0, 0, 255);
      } else if (buttonRightActive > 0 && buttonRightActive < loopIndex - 30 * checkButtonInterval) {
        logger("Right button active");

        // send something else if poll is active.
        if (pollIsActive) {
          client.send("arduinoButtonPushed", "buttons", "p-r");
        } else {
          client.send("arduinoButtonPushed", "buttons", "r");
        }

        showPollCircles();
        setColor(LED_BUTTON_RIGHT, 0, 130, 0);
        delay(defaultDelay * 2);
        buttonRightActive = 0;
        setColor(LED_BUTTON_RIGHT, 0, 0, 255);
      }
    }
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
//    logger("looooop the shit (" + String(loopIndex) + ")");
    msPrev = msCurrent;

    if (internet) {
      // uh oh! no connection...
      if (!client.connected()) {
        tft.fillScreen(ILI9340_WHITE);
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
          logger("send heartbeat");
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
