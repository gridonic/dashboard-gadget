#include "SPI.h"
#include "Adafruit_GFX.h"
#include "Adafruit_ILI9340.h"
#include "SocketIOClient.h"
#include "math.h"

// Ports for the display
#define _sclk               52
#define _miso               50
#define _mosi               51
#define _cs                 47
#define _rst                3 // 9 // 3
#define _dc                 2 // 8 // 2

// Pins for the LEDs
const int LEDButtonRightR   = 27;   // button right
const int LEDButtonRightG   = 25;   // button right
const int LEDButtonRightB   = 23;   // button right
const int LEDButtonLeftR    = 29;   // button left
const int LEDButtonLeftG    = 31;   // button left
const int LEDButtonLeftB    = 33;   // button left
const int LEDProjectR       = 45;   // project color
const int LEDProjectG       = 43;   // project color
const int LEDProjectB       = 41;   // project color
const int LEDMoodR          = 39;   // mood color
const int LEDMoodG          = 37;   // mood color
const int LEDMoodB          = 35;   // mood color

//const int ButtonLeftPin     = A1;
//const int ButtonRightPin    = A0;
const int ButtonRightPin    = A5;
const int ButtonLeftPin     = A6;


// Variables for the LEDs
const int LED_BUTTON_LEFT         = 1;
const int LED_BUTTON_RIGHT        = 2;
const int LED_PROJECT             = 4;
const int LED_MOOD                = 8;
unsigned int buttonLeftValue      = 0;
unsigned int buttonRightValue     = 0;
unsigned int buttonLeftValues[]   = {0, 0, 0, 0};
unsigned int buttonRightValues[]  = {0, 0, 0, 0};
unsigned int buttonActivateDiff   = 25; // was 3
//unsigned int buttonActivateDiffL   = 5;
//unsigned int buttonActivateDiffR   = 3;
unsigned int buttonDeactivateDiff = 1;
int checkButtonInterval           = 60;
unsigned long buttonLeftActive    = 0;
unsigned long buttonRightActive   = 0;

// Variables for display
Adafruit_ILI9340 tft           = Adafruit_ILI9340(_cs, _dc, _rst);
unsigned int  displayWidth     = 320;
unsigned int  displayHeight    = 240;
unsigned int  lastBigIcon      = 0;
unsigned int  lastSmallIcon    = 0;
unsigned int  lastLeftIcon     = 0;
unsigned int  lastRightIcon    = 0;
unsigned int  lastMainDisplay  = 0;
bool          showOnDisplay    = true;
bool          appAtmungActive  = false;
unsigned int  appAtmungSpeed   = 0;
unsigned int  appAtmungCircle  = displayHeight / 4;
unsigned int  appAtmungTimer   = 500;
float         appAtmungSize    = 0;
unsigned int  appAtmungI       = 0;

unsigned int ICON_COFFEE  = 1;
unsigned int ICON_COLD    = 2;
unsigned int ICON_FOCUS   = 3;
unsigned int ICON_FOOD    = 4;
unsigned int ICON_HOT     = 5;
unsigned int ICON_LOUD    = 6;
unsigned int ICON_MOOD    = 7;
unsigned int ICON_OK      = 8;
unsigned int ICON_POLL    = 9;
unsigned int ICON_ROOM    = 10;
unsigned int ICON_SOUND   = 11;
unsigned int ICON_DECLINE = 12;

unsigned int DISPLAY_RECT = 1;
unsigned int DISPLAY_CIRC = 2;
unsigned int DISPLAY_TXT  = 3;
unsigned int DISPLAY_MEN1 = 4;
unsigned int DISPLAY_MEN2 = 5;
unsigned int DISPLAY_MEN3 = 6;

// Variables for the ethernet-module
SocketIOClient client;
char          hostname[]  = "192.168.43.114"; // "192.168.2.98";
int           port        = 3000;
bool          loggedIn    = false;
bool          helloed     = false;
extern String RID;
extern String Rname;
extern String Rcontent;

// Variables for global setting
unsigned long loopIndex       = 0;
unsigned long msPrev          = 0;
unsigned long msCurrent       = 0;
long          interval        = 5000;
const int     debug           = false;
const int     internet        = true;
int           miniDelay       = 250;
int           defaultDelay    = 500;
int           longDelay       = 1000;
bool          pollIsActive    = false;
unsigned int  heartbeatNumber = 1;
unsigned int  lastHeartbeat   = 0;

// Variables Gadget 1
int           gadgetID        = 1;
byte          mac[]           = { 0x20, 0x67, 0x89, 0x4F, 0x60, 0x75 }; // generated here: http://www.miniwebtool.com/mac-address-generator/

// Variables Gadget 2
//int           gadgetID        = 2;
//byte          mac[]           = { 0x90, 0x29, 0x42, 0x89, 0x63, 0x8F }; // generated here: http://www.miniwebtool.com/mac-address-generator/

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

String getStartScreen()   { return F("x7211Ox79MDx78IDx78A-1Px76O-2Px76M-2Dx76I-2Dx76A-3Px74O-1B-2Px74M-1DI-1Dx74I-1HM-1Dx74A-1PO-2Px72O-1Bx2A-1Px72M-1Dx2I-1Dx72I-1Dx2M-1Dx72I-1Dx2I-1Dx72O-1Bx2A-1Hx72O-2PO-2Px73I-1HM-1Bx74I-1DI-1Dx74O-1B-2Hx71Nx2O-4Px2Lx68Ix3I-2Bx3Dx68Ax3I-2Dx2O-1Px5O-1Dx3M-2Dx3O-1Px1M-2Hx6I-1Hx3IDx2O-1Px1O-1Px3M-1Hx11O-1Dx2O-2Hx2M-1Px5I-2Hx2M-3Hx2O-1Px1M-3Hx4M-2Bx3IBx2O-1Px1O-1Px3A-2Px10M-1Dx2O-2Px2I-1Hx4O-3Bx2M-3Dx2O-1Px1M-3Bx4I-3Hx2I-1Px1O-1Px1O-1Px2M-3Dx10O-1Hx3I-1Hx2M-1Px4M-4Px1M-3Bx2O-1Px1M-4Hx2O-4Dx2I-1Hx1O-1Px1O-1Px2I-3Bx11Ax4I-1Dx2OBx5I-3Bx2M-4Px1O-1Px1M-4Dx2O-4Bx2I-1Hx1O-1Px1O-1Px2A-3Dx11Ix4M-1Bx3Dx5A-1HIDx2MBx1I-1Px1O-1Px1M-1PI-1Bx2M-1Dx1A-1Px1I-1Dx1O-1Px1O-1Px1O-2PIHx17A-1Px7O-1Bx1OHx2MBx1M-1Px1O-1Px1M-1Px1ABx2I-1Px1I-1Px1I-1Bx1O-1Px1O-1Px1O-1Dx1Mx18A-1Hx7O-1Hx5MBx1O-1Hx1O-1Px1M-1Px1I-1Px1IBx2M-1Hx1I-2PO-1Px1O-1Px1M-1Hx20M-1Dx7M-1Hx5MBx1O-1Px1O-1Px1M-1Px1M-1Px1ADx2O-1Hx1I-2PO-1Px1O-1Px1M-1Px17Dx2M-1Bx7M-1Px5MBx1O-1Px1O-1Px1M-1Px1M-1Px1ADx3ADx1I-2HO-1Px1O-1Px1IBx17ODx3A-1Px6M-1Px5MBx1M-1Px1O-1Px1M-1Px1O-1Hx1ADx3ADx1ID-1DO-1Px1O-1Px1IBx17M-1Px2A-1Hx6MBx6MBO-2Px1O-1Px1M-1Px1O-1Hx1AHx3ADx1ID-1BO-1Px1O-1Px1IBx17I-1Px2M-1Dx6MBx1O-2Px1M-3Bx2O-1Px1M-1Px1O-1Hx1AHx3IDx1IDIBO-1Px1O-1Px1IDx17I-1Dx2M-1Dx6MBx1O-2Px1M-3Dx2O-1Px1M-1Px1O-1HO-1Hx3ADx1IDM-1O-1Px1O-1Px1IBx17M-1Dx2I-1Hx6MBx1O-2Px1M-3Px2O-1Px1M-1Px1O-1Hx1AHx3ADx1IDM-1G-1Px1O-1Px1IBx17O-2Px1A-1Px6M-1Px1A-1Px1M-3Px2O-1Px1M-1Px1O-1Px1ADx3ADx1IDO-1C-1Px1O-1Px1IBx18A-1PO-1Bx7M-1Px1M-1Px1MBM-1Px2O-1Px1M-1Px1M-1Px1ADx3ADx1IDx1A-2Px1O-1Px1IBx18I-1DM-1Dx7M-1Hx1O-1Px1MBO-1Hx2O-1Px1M-1Px1M-1Px1ADx2O-1Hx1IDx1I-2Px1O-1Px1M-1Px17M-1DI-1Hx7O-1Hx1O-1Px1MBO-1Dx2O-1Px1M-1Px1I-1Px1IBx2M-1Hx1IDx1I-2Px1O-1Px1M-1Px17O-4Px7O-1Dx1O-1Px1MBx1ADx2O-1Px1M-1Px1ABx2I-1Px1I-1Px1IDx1M-2Px1O-1Px1M-1Hx1Ox16A-2Bx9A-1PM-1Px1MBx1IBx2O-1Px1M-1PM-1Bx2M-1DO-2Px1IDx1O-2Px1O-1Px1O-1Bx1IHx15I-2Dx9I-4Px1MBx1I-1Px1O-1Px1M-4Dx2O-4Bx2IDx2A-1Px1O-1Px2A-3Dx15M-2Hx9M-4Px1MBx1M-1Px1O-1Px1M-4Hx2O-4Dx2IDx2A-1Px1O-1Px2I-3Bx15O-2Px9O-4Px1MBx1O-1Hx1O-1Px1M-3Bx4I-3Hx2IDx2I-1Px1O-1Px2M-3Dx15O-2Hx10I-2Bx2MBx1O-1Dx1O-1Px1M-3Hx4M-2Bx3IDx2M-1Px1O-1Px2O-3Hx15M-2Dx11A-1Px2MBx2ADx1O-1Px1M-2Hx6I-1Hx3IDx2O-1Px1O-1Px3M-1Bx16I-2Dx76A-3Px74O-1B-2Px74M-1DI-1Dx74I-1HM-1Dx74A-1PO-2Px72O-1Bx2A-1Px72M-1Dx2I-1Dx72I-1Hx2M-1Dx72M-1Px2O-1Dx72OBx4AHx73Dx4Ix74Lx4Nx7105=="); }
String getIconCoffee84()  { return F("x316O-14Px5M-14Bx5I-15Hx4I-15Bx4I-16Px3I-16Hx3I-16Dx3I-16Bx3I-17Px2I-17Px2I-17Hx2I-13O-3Hx2I-13PI-2Dx2I-13PM-2Dx2I-13PM-2Dx2I-13PO-2Dx2I-13PO-2Dx2I-13Px1A-1Bx2I-13Px1A-1Bx2I-13Px1A-1Bx2I-13PO-2Dx2I-13PO-2Dx2I-13PM-2Dx2I-13PM-2Dx2I-13PI-2Hx2I-13O-3Hx2I-17Hx2I-17Px2I-17Px2I-16Bx3I-16Dx3I-16Hx3I-16Px3I-15Bx4I-15Hx4I-14Bx5I-14Px5I-13Px6I-13Px6I-13Px6I-13Px6I-13Px6M-12Bx7M-12Bx7M-12Bx7O-12Dx7O-12Dx8A-11Hx8A-11Px8I-11Px8O-10Dx10A-9Hx10M-8Bx12I-7Px323=="); }
String getIconCold84()    { return F("x94AHx19AHx19AHx19AHx17Dx1AHOHx14OBx1AHMDx14M-1P-1HIBx14O-1H-1H-1Dx15AD-1G-1Hx15IB-1E-1Px15M-3Bx12ODx2O-3Dx2MHx8MBx3A-2Hx2MDx8MBx3I-2Px2IDx8OBx3M-1Bx3IHx8OBx3O-1Dx3IHx8O-1Px3AHx3IHx6OHx1Ax4AHx3AHODx4MBx1Ax4AHx3Ax1IBx4M-1P-1Hx3AHx3Ax1ABx4M-1D-1Hx3AHx2O-1M-1Dx4O-3Hx3AHx2O-3Hx5I-2Hx3AHx2O-2Bx6O-2Dx3AHx2O-2Hx7I-1Dx3AHx2M-2Px7M-1Bx3AHx2I-1Dx8A-2Px2AHx2A-2Hx6A-3Dx5M-4Px4I-5Px4A-5Px3I-2HI-1Dx3M-1BO-3Px3I-1Hx1O-1Bx3M-1Hx1O-1Bx4IHx3IDx1AHMBx3OBx9MDO-1BODx15HM-2Ox17I-2Px17A-2Hx17A-2Hx17A-2Hx17A-2Hx17A-2Hx17I-2Hx15OHI-2OHx9Mx4MDM-1BMBx4Jx4IBx3ABx1ADM-1Hx2IBx4I-1Bx1M-1Bx3M-1Dx1M-2Px3I-2B-2Hx3O-2I-3Px3M-4Bx5I-4Dx5I-3Dx5O-3Dx7I-2Px2AHx2I-1Bx8I-1Dx3AHx2M-1Bx8A-1Dx3AHx2O-2Hx6M-2Hx3AHx2O-2Dx6A-2Hx3AHx2O-3Px4O-3Hx3AHx2O-1I-1Dx4I-1H-1Hx3AHx3AO-1Bx4I-1P-1Px3AHx3Ax1IDx4MDx1Ax4AHx3AHODx4Ox1O-1Px3AHx3IHx1Hx6O-1Px3AHx3IHx8OBx3O-1Dx3IHx8OBx3M-1Bx3IDx8MBx3I-2Px2MDx8MDx3A-2Hx2MDx9Dx2O-3Dx2Mx13M-3Bx16IB-1E-1Px15AD-1G-1Hx14O-1H-1H-1Dx14M-1P-1HIBx14OBx1AHMDx15Dx1AHOHx17AHx19AHx19AHx19AHx114=="); }
String getIconDecline84() { return F("x320OHx8Dx10MDx7OBx10IBx7M-1Px9A-1Px6I-1Hx8O-2Hx6A-1Dx8M-2Dx5O-2Bx8I-2Bx5M-3Px7A-3Px4I-3Hx7A-3Hx4A-3Hx7I-3Dx3O-4Px7M-3Bx3M-3Bx8O-4Px2I-3Dx9A-3Hx2A-3Hx9I-3Dx1O-4Px9M-3Bx1M-3Bx10O-4PI-3Dx11A-3H-4Hx11I-3C-4Px11M-7Bx12O-7Dx13A-6Hx13I-6Px13M-5Bx14O-5Dx15A-4Hx15I-4Px15M-3Bx16I-4Px15A-4Hx14O-5Dx14M-5Bx14I-6Px13A-6Hx12O-7Dx12M-7Bx12I-3C-4Px11A-3H-4Hx10O-4PI-3Dx10M-3Bx1M-3Bx10I-3Dx1O-4Px9A-3Hx2A-3Hx8O-4Px2I-3Dx8M-3Bx3M-3Bx8I-3Dx3O-4Px7A-3Hx4A-3Hx7A-3Px4I-3Hx7I-2Bx5M-3Px7M-2Dx5O-2Bx8O-2Hx6A-1Dx9A-1Px6I-1Hx9IBx7M-1Px9MDx7OBx10OHx8Dx341=="); }
String getIconFocus84()   { return F("x114A-2Px16A-4Hx14I-6Px12O-7Dx12I-8Px10O-9Dx10I-10Px9A-10Hx8O-11Dx8M-11Bx8A-12Hx7A-12Hx6O-13Bx6M-13Bx6I-14Px5A-14Hx4O-15Dx4O-15Dx4M-15Bx4M-15Bx4I-16Px3I-16Px3A-16Hx3A-16Hx2O-17Dx2O-17Dx2O-17Dx2M-17Bx2M-17Bx2M-17Bx2M-2Bx11M-2Bx2I-2Hx12A-2Px1I-2Px12I-2Px1I-2Px12I-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-2Px12I-2Px1I-2Px12I-2Px1M-2Hx12A-1Bx2M-2Bx11M-2Bx2M-17Bx2M-17Bx2M-17Bx2O-17Dx2O-17Dx2O-17Dx3A-16Hx3A-16Hx3I-16Px3I-16Px3M-15Bx4M-15Bx4O-15Dx4O-15Dx5A-14Hx5I-14Px5M-13Bx6M-13Dx7A-12Dx7A-12Px7M-12Px7O-11Dx9A-10Hx9I-10Px9O-9Dx11I-8Px11O-7Dx13I-6Px14A-4Hx16A-2Px92=="); }
String getIconFood84()    { return F("x344O-3Px15O-5Px14I-6Px12M-7Dx12A-8Px10M-9Dx10I-9Bx10A-10Px8M-11Hx8M-11Bx8A-11Bx8A-12Px6O-13Hx6M-13Dx6M-13Dx6I-13Bx6I-13Bx6A-14Px49Bx2MHx1ODx2Ax9O-1Px1IDx1MBx1O-1Hx8I-1BO-2P-2DI-2Px6G-13Dx6A-13Bx6A-14Px5A-1G-2DI-1BO-2P-2Px5ADx1M-1PO-1Hx1IDx1O-1Px5Ix2ODx2Ax2MHx2Mx48O-13Hx6I-13Bx6I-13Bx6Bx13Ix6Dx13Mx6Bx13Ix6I-13Bx6I-13Bx6M-13Dx49I-11Bx7M-13Dx6I-13Bx6A-13Bx6A-14Px5A-14Px5A-14Px5I-13Bx6I-13Bx6M-13Dx7I-11Bx319=="); }
String getIconHot84()     { return F("x114O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx13Nx4O-1Dx4Nx8Ix4O-1Dx4Ix8AHx3O-1Dx4AHx6O-1Dx3O-1Dx3O-1Dx6M-1Bx9M-1Bx6O-2Px8I-1Dx7A-1Hx8A-1Hx7I-1Dx7O-2Px7M-1Bx7M-1Bx8O-1Bx7M-1Dx9ADx2M-1Bx2O-1Hx9IHx1O-3Dx2Ax10Mx2I-4Px1Jx12O-5Dx14M-5Bx14I-6Px13A-6Hx12O-7Hx12O-7Dx12M-7Bx12M-7Bx12I-8Px11I-8Px11I-8Px11A-8Hx6I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px6A-8Hx11I-8Px11I-8Px11I-8Px11M-7Bx12M-7Bx12O-7Dx12O-7Dx13A-6Hx13I-6Px13M-5Bx15A-4Dx12Mx2I-4Px1Jx10IHx1O-3Dx2Ax10ADx2M-1Bx2O-1Hx8O-1Bx7M-1Dx8M-1Bx7M-1Bx8I-1Dx7O-2Px7A-1Hx8A-1Hx6O-2Px8I-1Dx6M-1Bx9M-1Bx6O-1Dx3O-1Dx3O-1Dx7AHx3O-1Dx4AHx7Ix4O-1Dx4Ix8Nx4O-1Dx4Nx13O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx93=="); }
String getIconLoud84()    { return F("x222MDx19IBx19ABx18O-1Bx3OHx13M-1Bx3MDx13I-1Bx3IBx13A-1Bx3ADx12O-2Bx2O-1Hx12M-2Bx2M-1Px12I-2Bx2IBx13A-2Bx2ADx12O-3Bx1O-1Hx12M-3Bx1M-1Px12I-3Bx1IBx13A-3Bx1ADx12O-4Bx1AHx12M-4Bx1Ix7M-4HI-4Bx1Nx7A-4HI-4Bx9A-4HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx1M-3Bx2O-5HI-4Bx1M-3Bx2O-5HI-4Bx1M-3Bx2O-5HI-4Bx1M-3Bx2O-5HI-4Bx1M-3Bx2O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx9A-4HI-4Bx9A-4HI-4Bx9M-4HI-4Bx1Nx13M-4Bx1Ix13O-4Bx1AHx13A-3Bx1ADx13I-3Bx1IBx13M-3Bx1M-1Px12O-3Bx1O-1Hx13A-2Bx2ADx13I-2Bx2IBx13M-2Bx2M-1Px12O-2Bx2O-1Hx13A-1Bx3ADx13I-1Bx3IBx13M-1Bx3MDx13O-1Bx3OHx14ABx19IBx19MDx196=="); }
String getIconMood44()    { return F("x59O-1Px8I-1Dx7O-3Px6M-3Hx6M-3Hx6I-3Dx6I-3Dx6I-3Dx6A-3Bx6A-3Bx6I-3Dx6I-3Dx6I-3Dx6M-3Hx6M-3Hx6O-3Px7A-1Bx8A-1Bx7M-3Hx6I-3Dx6A-3Bx5O-5Px4M-5Hx4I-5Dx4I-5Dx4A-5Bx4A-5Bx3O-7Px2O-7Px2O-7Px2O-7Px2O-7Px2O-7Px2O-7Px2O-7Px45=="); }
String getIconMood84()    { return F("x198M-1Dx17O-3Hx16I-3Bx16A-4Px14O-5Dx14M-5Bx14I-5Bx14A-6Px13A-6Hx12O-7Hx12M-7Dx12M-7Dx12M-7Dx12M-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12M-7Bx12M-7Dx12M-7Dx12O-7Dx12O-7Hx13A-6Hx13A-6Px13I-5Bx14M-5Dx14O-5Dx15A-4Px15I-3Bx16I-4Hx14O-6Px13I-6Hx12O-7Bx12M-8Hx11I-8Dx11A-8Bx10O-10Px9M-10Hx9I-10Dx9A-10Dx9A-10Bx8O-12Px7M-12Px7M-12Hx7I-12Hx7I-12Dx7I-12Dx7A-12Dx7A-12Bx7A-12Bx7A-12Bx6O-13Bx6O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px212=="); }
String getIconOk84()      { return F("x498MHx19IDx19ABx18O-2Px17M-2Hx17I-2Hx17A-2Hx16O-3Px16M-2Bx17I-2Dx17A-2Hx16O-3Px16M-2Bx17I-2Dx10Jx6A-2Hx10Ax5O-3Px9O-1Hx4M-2Bx10M-1Dx4I-2Dx10I-1Bx4A-2Hx10A-2Px2O-3Px10A-2Hx2M-2Bx11I-2Dx2I-2Dx11M-2Bx2A-2Hx11O-3PO-3Px12A-2HM-2Bx13I-2DI-2Dx13M-6Hx13O-6Px14A-4Bx15I-4Dx15M-4Hx15O-4Px16A-2Bx17I-2Dx17M-2Hx17O-2Px18ABx19IDx19MHx473=="); }
String getIconPoll84()    { return F("x239O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx233=="); }
String getIconRoom44()    { return F("x15O-1Px8A-1Dx7O-3Px6M-3Hx6I-3Hx6I-3Dx6I-1O-1Dx6ABx1ABx6ADx1IBx6ADx1IBx6ADx1IBx6ADDIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx5O-1DBI-1Px4O-1DBI-1Px4M-1HBI-1Hx4M-1PBM-1Hx4I-1OBO-1Hx4IBM-1O-1Dx4IBM-1H-1Dx4IBM-1H-1Dx4IBM-1H-1Dx4IBM-1G-1Dx4I-1O-1O-1Hx4M-1Hx1M-1Hx4M-1Dx1I-1Hx4O-1BO-2Px4O-5Px5A-3Bx6I-3Dx6M-3Hx7A-1Bx8O-1Px4=="); }
String getIconRoom84()    { return F("x51I-1Dx17O-3Px16M-3Dx16A-3Bx15O-5Px14O-5Hx14M-1Bx1I-1Dx14I-1Hx1M-1Dx14I-1Px1O-1Bx14IBx3ABx14ABx3IBx14ABx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx1Ax1IBx14ADO-1HIBx14ADO-1HIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DI-1Px12O-1DM-1DI-1Px12O-1DM-1DI-1Hx12M-1DM-1DI-1Dx12I-1DM-1DM-1Bx12A-1PM-1DO-1Bx12A-1PM-1Dx1A-1Px10O-1Bx1I-1Dx1I-1Px10O-1Dx1A-2PM-1Hx10M-1HO-3HM-1Hx10M-1HM-3DO-1Hx10M-1HM-3DO-1Dx10M-1PI-3BO-1Dx10I-1PI-3Bx1ADx10I-1PI-3Bx1ADx10I-1P-5P-1Dx10I-1PI-3Bx1ADx10I-1PI-3Bx1ADx10M-1PI-3BO-1Dx10M-1PI-3BO-1Dx10M-1HM-3DO-1Dx10M-1HM-3HO-1Hx10O-1HO-3HM-1Hx10O-1Dx1I-1Bx1M-1Hx10O-1Bx1O-1Dx1I-1Px11ABx5A-1Px11A-1Hx3O-1Bx12I-1Dx3M-1Bx12M-2Px2A-1Dx12O-2Dx1I-2Hx13A-6Px13I-5Bx14M-5Dx15A-4Px15M-3Dx17A-1Bx51=="); }
String getIconSound44()   { return F("x41Mx10Ax9O-1Px8M-1Px8I-1Px8A-1Px7O-2Px7M-2Px7I-2Px7A-2Px3I-2H-3Px3I-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3I-2H-3Px3M-2H-3Px7A-2Px7I-2Px7M-2Px7O-2Px8A-1Px8I-1Px8M-1Px8O-1Px9Ax46=="); }
String getIconSound84()   { return F("x142IDx19ADx18M-1Dx18M-1Dx18A-1Dx18A-1Dx17M-2Dx17M-2Dx17A-2Dx17A-2Dx16M-3Dx16M-3Dx16A-3Dx15O-4Dx15O-4Dx15I-4Dx15I-4Dx14O-5Dx14O-5Dx8A-4DM-5Dx7M-5DM-5Dx7M-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7M-5DM-5Dx7M-5DM-5Dx8A-4DM-5Dx14O-5Dx15A-4Dx15I-4Dx15M-4Dx15O-4Dx16A-3Dx16I-3Dx16M-3Dx16O-3Dx17A-2Dx17I-2Dx17M-2Dx17O-2Dx18A-1Dx18I-1Dx18M-1Dx18O-1Dx19ADx19IDx129=="); }

void resetIconVariables() {
  lastBigIcon = 0;
  lastSmallIcon = 0;
  lastLeftIcon = 0;
  lastRightIcon = 0;
  lastMainDisplay = 0;
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
  showOnScreen(getStartScreen(), 0, 0, displayWidth);
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

  resetIconVariables();
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
void draw4bit(long x, long y, uint16_t a, uint16_t b, uint16_t c, uint16_t d)
{
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

void clearMainDisplay() {
  tft.fillRect(0, 50, 320, 140, ILI9340_WHITE);
}

/**
 * Show the string on the screen.
 */
void showOnScreen(String m, long startX, long startY, long width)
{
  char message[m.length()];
  m.toCharArray(message, m.length());
  long s = 0;
  char current;
  char next;
  long i = 0;
  long k = 0;
  long x;
  long y;
  String number;

  for (s; s < m.length(); s++) {
    current = message[s];

    if (current == 'x' || current == '-') {
      number = "";
      s++;
      next = message[s];
      while (isDigit(next)) {
        number += message[s];
        s++;
        next = message[s];
      }
      
      s--;
//      number += message[s]; // removed because at the gridonic-logo, every numbers last digit was twice saved.

      for (k = 0; k < number.toInt(); k++) {
        x = startX + (i % width);
        y = startY + ((i - x) / width);
        if (current == 'x') {
          draw4bit(x, y, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK);
        } else {
          draw4bit(x, y, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE);
        }
        i += 4;
      }
    } else if (current == 'A') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE);
      i += 4;
    } else if (current == 'B') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE, ILI9340_BLACK);
      i += 4;
    } else if (current == 'C') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_WHITE, ILI9340_WHITE, ILI9340_BLACK, ILI9340_WHITE);
      i += 4;
    } else if (current == 'D') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_WHITE, ILI9340_WHITE, ILI9340_BLACK, ILI9340_BLACK);
      i += 4;
    } else if (current == 'E') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_WHITE, ILI9340_BLACK, ILI9340_WHITE, ILI9340_WHITE);
      i += 4;
    } else if (current == 'F') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_WHITE, ILI9340_BLACK, ILI9340_WHITE, ILI9340_BLACK);
      i += 4;
    } else if (current == 'G') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_WHITE, ILI9340_BLACK, ILI9340_BLACK, ILI9340_WHITE);
      i += 4;
    } else if (current == 'H') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_WHITE, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK);
      i += 4;
    } else if (current == 'I') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_BLACK, ILI9340_WHITE, ILI9340_WHITE, ILI9340_WHITE);
      i += 4;
    } else if (current == 'J') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_BLACK, ILI9340_WHITE, ILI9340_WHITE, ILI9340_BLACK);
      i += 4;
    } else if (current == 'K') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_BLACK, ILI9340_WHITE, ILI9340_BLACK, ILI9340_WHITE);
      i += 4;
    } else if (current == 'L') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_BLACK, ILI9340_WHITE, ILI9340_BLACK, ILI9340_BLACK);
      i += 4;
    } else if (current == 'M') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_BLACK, ILI9340_BLACK, ILI9340_WHITE, ILI9340_WHITE);
      i += 4;
    } else if (current == 'N') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_BLACK, ILI9340_BLACK, ILI9340_WHITE, ILI9340_BLACK);
      i += 4;
    } else if (current == 'O') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK, ILI9340_WHITE);
      i += 4;
    } else if (current == 'P') {
      x = startX + (i % width);
      y = startY + ((i - x) / width);
      draw4bit(x, y, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK, ILI9340_BLACK);
      i += 4;
    }
  }
}

void showMenuCircle()
{
  tft.fillCircle(160, 120, 60, ILI9340_BLACK);
}

void showSubmenuCircles()
{
  /* submenus - grosse chreis 120x120px (76/60), chline chreis 64x64px (171/60) */
  tft.fillCircle(136, 120, 60, ILI9340_BLACK);
  tft.fillCircle(203, 92, 32, ILI9340_BLACK);
}

void showPollCircles()
{
  /* polls - beidi chreis 120x120 px (52/60) und (148/60) */
  tft.fillCircle(112, 120, 60, ILI9340_BLACK);
  tft.fillCircle(208, 120, 60, ILI9340_BLACK);
}

void showFullScreen(uint16_t color)
{
  resetIconVariables();
  tft.fillRect(0, 0, displayWidth, displayHeight, color);
}

void drawWorkingIcon(unsigned int x, unsigned int y)
{
  tft.drawLine(x + 2, y, x + 9, y, ILI9340_BLACK);
  tft.drawPixel(x + 2, y + 1, ILI9340_BLACK);  tft.drawPixel(x + 9, y + 1, ILI9340_BLACK);
  tft.drawPixel(x + 2, y + 2, ILI9340_BLACK);  tft.drawPixel(x + 9, y + 2, ILI9340_BLACK);
  tft.drawPixel(x + 3, y + 3, ILI9340_BLACK);  tft.drawPixel(x + 8, y + 3, ILI9340_BLACK);
  tft.drawPixel(x + 4, y + 4, ILI9340_BLACK);  tft.drawPixel(x + 7, y + 4, ILI9340_BLACK);
  tft.fillRect(x + 5, y + 5, 2, 2, ILI9340_BLACK);
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
  String splitString0 = splitString(m, '|', 0);
  unsigned int x;
  unsigned int y;
  unsigned int rad;
  unsigned int h;
  unsigned int w;
  unsigned int borderColor;
  unsigned int color;

  if (appAtmungActive && splitString(m, '|', 0) != "APP" && splitString(m, '|', 1) != "ATM") {
    appAtmungActive = false;
  }

  if (splitString0 == "RECT") {
    if (lastMainDisplay != DISPLAY_RECT) {
      clearMainDisplay();
      delay(miniDelay);
      lastMainDisplay = DISPLAY_RECT;
    }
    
    x           = splitString(m, '|', 1).toInt();
    y           = splitString(m, '|', 2).toInt();
    w           = splitString(m, '|', 3).toInt();
    h           = splitString(m, '|', 4).toInt();
    borderColor = splitString(m, '|', 5) == "1" ? ILI9340_BLACK : ILI9340_WHITE;
    color       = splitString(m, '|', 6) == "1" ? ILI9340_BLACK : ILI9340_WHITE;

    tft.fillRect(x, y, w, h, borderColor);
    tft.fillRect(x + 2, y + 2, w - 4, h - 4, color);
    
  } else if (splitString0 == "CIRC") {
    if (lastMainDisplay != DISPLAY_CIRC) {
      clearMainDisplay();
      delay(miniDelay);
      lastMainDisplay = DISPLAY_CIRC;
    }
    
    x           = splitString(m, '|', 1).toInt();
    y           = splitString(m, '|', 2).toInt();
    rad         = splitString(m, '|', 3).toInt();
    borderColor = splitString(m, '|', 4) == "1" ? ILI9340_BLACK : ILI9340_WHITE;
    color       = splitString(m, '|', 5) == "1" ? ILI9340_BLACK : ILI9340_WHITE;

//    tft.fillRect(x - displayHeight / 4 - 1, y - displayHeight / 4 - 1, displayHeight / 2 + 2, displayHeight / 2 + 2, ILI9340_WHITE);
    tft.fillCircle(x, y, rad, borderColor);
    tft.fillCircle(x, y, rad - 2, color);
    
  } else if (splitString0 == "TXT") {
    if (lastMainDisplay != DISPLAY_TXT) {
      lastMainDisplay = DISPLAY_TXT;
    }

    clearMainDisplay();
    delay(miniDelay);
    
    int textSize      = 15;
    String urlString  = splitString(m, '|', 2);
    int padding       = splitString(m, '|', 1).toInt();
    int i             = 0;

    tft.setTextColor(ILI9340_BLACK);
    tft.setTextSize(2);

    while (splitString(urlString, '%', i) != "") {
      tft.setCursor(padding, displayHeight / 2 - 60 + padding + (padding + textSize) * i);
      tft.println(splitString(urlString, '%', i));
      i++;
    }
  } else if (splitString0 == "MEN") {
    // One big circle
    if (splitString(m, '|', 1) == "1") {
      if (lastMainDisplay != DISPLAY_MEN1) {
        clearMainDisplay();
        delay(miniDelay);
        showMenuCircle();
        delay(miniDelay);
        lastMainDisplay = DISPLAY_MEN1;
      }
      
      String icon = "";
      String iconData = splitString(m, '|', 2);
      
      if (iconData == "MOOD" && lastBigIcon != ICON_MOOD) {
        icon = getIconMood84();
        lastBigIcon = ICON_MOOD;
      } else if (iconData == "SOUND" && lastBigIcon != ICON_SOUND) {
        icon = getIconSound84();
        lastBigIcon = ICON_SOUND;
      } else if (iconData == "ROOM" && lastBigIcon != ICON_ROOM) {
        icon = getIconRoom84();
        lastBigIcon = ICON_ROOM;
      }

      if (icon != "") {
        showOnScreen(icon, 118, 78, 84);
      }
    }

    // Big circle and a small one
    else if (splitString(m, '|', 1) == "2") {
      if (lastMainDisplay != DISPLAY_MEN2) {
        clearMainDisplay();
        delay(miniDelay);
        showSubmenuCircles();
        delay(miniDelay);
        lastMainDisplay = DISPLAY_MEN2;
      }
      
      String iconBig = "";
      String iconSmall = "";
      String iconData = splitString(m, '|', 3);

//      tft.fillRect(94, 78, 84, 84, ILI9340_WHITE);
//      tft.fillRect(181, 70, 44, 44, ILI9340_WHITE);

      if (iconData == "OK" && lastBigIcon != ICON_OK) {
        iconBig = getIconOk84();
        lastBigIcon = ICON_OK;
      } else if (iconData == "COFFEE" && lastBigIcon != ICON_COFFEE) {
        iconBig = getIconCoffee84();
        lastBigIcon = ICON_COFFEE;
      } else if (iconData == "FOOD" && lastBigIcon != ICON_FOOD) {
        iconBig = getIconFood84();
        lastBigIcon = ICON_FOOD;
      } else if (iconData == "FOCUS" && lastBigIcon != ICON_FOCUS) {
        iconBig = getIconFocus84();
        lastBigIcon = ICON_FOCUS;
      } else if (iconData == "HOT" && lastBigIcon != ICON_HOT) {
        iconBig = getIconHot84();
        lastBigIcon = ICON_HOT;
      } else if (iconData == "COLD" && lastBigIcon != ICON_COLD) {
        iconBig = getIconCold84();
        lastBigIcon = ICON_COLD;
      } else if (iconData == "LOUD" && lastBigIcon != ICON_LOUD) {
        iconBig = getIconLoud84();
        lastBigIcon = ICON_LOUD;
      }

      iconData = splitString(m, '|', 2);

      if (iconData == "MOOD" && lastSmallIcon != ICON_MOOD) {
        iconSmall = getIconMood44();
        lastSmallIcon = ICON_MOOD;
      } else if (iconData == "SOUND" && lastSmallIcon != ICON_SOUND) {
        iconSmall = getIconSound44();
        lastSmallIcon = ICON_SOUND;
      } else if (iconData == "ROOM" && lastSmallIcon != ICON_ROOM) {
        iconSmall = getIconRoom44();
        lastSmallIcon = ICON_ROOM;
      }

      if (iconBig != "") {
        showOnScreen(iconBig, 94, 78, 84);
      }
      
      if (iconSmall != "") {
        showOnScreen(iconSmall, 181, 72, 44);
      }
    }

    //draw two Circles for poll
    else if (splitString(m, '|', 1) == "3") {

      
      if (lastMainDisplay != DISPLAY_MEN3) {
        clearMainDisplay();
        delay(miniDelay);
        showPollCircles();
        delay(miniDelay);
        lastMainDisplay = DISPLAY_MEN3;
        logger("show poll circles");
      }

      String iconLeft = "";
      String iconRight = "";
      String iconData = splitString(m, '|', 2);
      String iconDataLeft = splitString(m, '|', 3);

      if (lastLeftIcon != ICON_POLL) {
        iconLeft = getIconPoll84();
        lastLeftIcon = ICON_POLL;
      }

      if (iconDataLeft && iconDataLeft == "POS" && lastLeftIcon != ICON_OK) {
        iconLeft = getIconOk84();
        lastLeftIcon = ICON_OK;
      }

      if (iconDataLeft && iconDataLeft == "NEG" && lastLeftIcon != ICON_DECLINE) {
        iconLeft = getIconDecline84();
        lastLeftIcon = ICON_DECLINE;
      }

      if (iconData == "BREAK" && lastBigIcon != ICON_COFFEE) {
        iconRight = getIconCoffee84();
        lastRightIcon = ICON_COFFEE;
      } else if (iconData == "LUNCH" && lastBigIcon != ICON_FOOD) {
        iconRight = getIconFood84();
        lastRightIcon = ICON_FOOD;
      } else if (iconData == "HOT" && lastBigIcon != ICON_HOT) {
        iconRight = getIconHot84();
        lastRightIcon = ICON_HOT;
      } else if (iconData == "COLD" && lastBigIcon != ICON_COLD) {
        iconRight = getIconCold84();
        lastRightIcon = ICON_COLD;
      } else if (iconData == "LOUD" && lastBigIcon != ICON_LOUD) {
        iconRight = getIconLoud84();
        lastRightIcon = ICON_LOUD;
      }

      if (iconRight != "") {
        showOnScreen(iconRight, 70, 78, 84);
      }

      if (iconLeft != "") {
        showOnScreen(iconLeft, 167, 78, 84);
      }
    }

   
  } else if (splitString0 == "APP") {

    if (!appAtmungActive && splitString(m, '|', 1) == "ATM") {
      appAtmungActive = true;
      appAtmungI = 0;
      appAtmungSpeed = splitString(m, '|', 2).toInt();
    }
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

void setMoodColor(String m)
{
  if (m == "null") {
    setColor(LED_MOOD, 0, 0, 0);
  } else {
    unsigned int r = splitString(m, '|', 0).toInt();
    unsigned int g = splitString(m, '|', 1).toInt();
    unsigned int b = splitString(m, '|', 2).toInt();
    setColor(LED_MOOD, r, g, b);
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
    showOnScreen(Rcontent, 0, 0, displayWidth);
  }

  else if (RID == "showBlack")
  {
    helloed = true;
    logger("showBlack");
    showFullScreen(ILI9340_BLACK);
  }

  else if (RID == "showWhite")
  {
    logger("showWhite");
    showFullScreen(ILI9340_WHITE);

    if (!helloed) {
      sayHello();
      helloed = true;
    }
  }

  else if (RID == "newPoll")
  {
    client.send("giveMePoll", "data", Rcontent);
  }

  else if (RID == "newPollResult")
  {
    client.send("giveMePollResult", "data", Rcontent);
  }

  else if (RID == "showDisplay")
  {
    showOnDisplay = true;
  }

  else if (RID == "heartbeatAnswer")
  {
    heartbeatNumber = Rcontent.toInt();
  }

  else if (RID == "showWorkTime")
  {
    if (showOnDisplay) {
      logger("showWorkTime " + Rcontent);
      showWorktimeOnScreen(Rcontent);
    }
  }
  
  else if (RID == "showTime")
  {
    if (showOnDisplay) {
      logger("showTime " + Rcontent);
      showTimeOnScreen(Rcontent);
    }
  }
    
  else if (RID == "showProject")
  {
    if (showOnDisplay) {
      logger("showProject " + Rcontent);
      setProjectColor(Rcontent);
    }
  }
    
  else if (RID == "showMood")
  {
    if (showOnDisplay) {
      logger("showMood " + Rcontent);
      setMoodColor(Rcontent);
    }
  }
 
  else if (RID == "showMenu")
  {
    if (showOnDisplay) {
      logger("showMenu " + Rcontent);
      showMenuOnScreen(Rcontent);
    }
  }
    
  else if (RID == "showMainDisplay")
  {
    if (showOnDisplay) {
      logger("showMainDisplay " + Rcontent);
      showMainDisplayOnScreen(Rcontent);
    }
  }
   
  else {
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

//    Serial.print("r: ");
//    Serial.print(buttonRightValue);
//    Serial.print(". l: ");
//    Serial.println(buttonLeftValue);

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

        setColor(LED_BUTTON_RIGHT, 0, 200, 0);
        setColor(LED_BUTTON_LEFT, 0, 200, 0);
        resetIconVariables();
        clearMainDisplay();
        showOnDisplay = false;
        delay(longDelay);
        setColor(LED_BUTTON_LEFT, 0, 0, 255);
        setColor(LED_BUTTON_RIGHT, 0, 0, 255);
        delay(defaultDelay);
        buttonLeftActive = 0;
        buttonRightActive = 0;
      } else if (buttonLeftActive > 0 && buttonLeftActive < loopIndex - 30 * checkButtonInterval) {
        logger("Left button active");

        // check if poll is active, than send this:
        if (pollIsActive) {
          client.send("arduinoButtonPushed", "buttons", "p-l");
        } else {
          client.send("arduinoButtonPushed", "buttons", "l");
        }

        setColor(LED_BUTTON_LEFT, 0, 130, 0);
        resetIconVariables();
        clearMainDisplay();
        showOnDisplay = false;
        delay(longDelay);
        setColor(LED_BUTTON_LEFT, 0, 0, 255);
        delay(defaultDelay);
        buttonLeftActive = 0;
      } else if (buttonRightActive > 0 && buttonRightActive < loopIndex - 30 * checkButtonInterval) {
        logger("Right button active");

        // send something else if poll is active.
        if (pollIsActive) {
          client.send("arduinoButtonPushed", "buttons", "p-r");
        } else {
          client.send("arduinoButtonPushed", "buttons", "r");
        }

        setColor(LED_BUTTON_RIGHT, 0, 130, 0);
        resetIconVariables();
        clearMainDisplay();
        showOnDisplay = false;
        delay(longDelay);
        setColor(LED_BUTTON_RIGHT, 0, 0, 255);
        delay(defaultDelay);
        buttonRightActive = 0;
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
  if (helloed && loggedIn) {
    checkButtons();
  }

  if (appAtmungActive && loopIndex % appAtmungTimer == 0) {
    appAtmungSize = fmod(((float) (appAtmungI * appAtmungTimer) / (float) appAtmungSpeed), 2.0);
    if (appAtmungSize > 1) {
      appAtmungSize = 2 - appAtmungSize;
      tft.fillRect(displayWidth / 2 - appAtmungCircle, displayHeight / 2 - appAtmungCircle, appAtmungCircle * 2, appAtmungCircle * 2, ILI9340_WHITE);
    }

    tft.fillCircle(displayWidth / 2, displayHeight / 2, appAtmungCircle * appAtmungSize, ILI9340_BLACK);
    appAtmungI++;
  }

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
  
        if (loggedIn && helloed && loopIndex % 3 == 0) {
//          logger("send heartbeat");
//          client.heartbeat(0);

          if (lastHeartbeat == 2000) {
            lastHeartbeat = 0;
            heartbeatNumber = 1;
          }
          
          // hold connection by sending heartbeat from time to time.
          if (lastHeartbeat + 1 == heartbeatNumber) {
            client.send("ownheartbeat", "number", (String) heartbeatNumber);
            lastHeartbeat = heartbeatNumber;
          } else {
            logger("heartbeat lost. Rebuild connection. heartbeat: " + (String) heartbeatNumber + ", lastHeartbeat: " + (String) lastHeartbeat);
            helloed = false;
            loggedIn = false;
            lastHeartbeat = 0;
            heartbeatNumber = 1;
            tft.fillScreen(ILI9340_WHITE);
            connectClient();
          }
        }
      }
    }
  }

  if (client.monitor()) {
    handleResponse();
  }

  loopIndex++;
}
