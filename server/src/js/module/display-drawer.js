displayDrawer = function () {

    // Functions
    var bitToImage;
    var clearMainDisplay;
    var clearDisplayForPoll;
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
    var iconCoffee84    = 'x316O-14Px5M-14Bx5I-15Hx4I-15Bx4I-16Px3I-16Hx3I-16Dx3I-16Bx3I-17Px2I-17Px2I-17Hx2I-13O-3Hx2I-13PI-2Dx2I-13PM-2Dx2I-13PM-2Dx2I-13PO-2Dx2I-13PO-2Dx2I-13Px1A-1Bx2I-13Px1A-1Bx2I-13Px1A-1Bx2I-13PO-2Dx2I-13PO-2Dx2I-13PM-2Dx2I-13PM-2Dx2I-13PI-2Hx2I-13O-3Hx2I-17Hx2I-17Px2I-17Px2I-16Bx3I-16Dx3I-16Hx3I-16Px3I-15Bx4I-15Hx4I-14Bx5I-14Px5I-13Px6I-13Px6I-13Px6I-13Px6I-13Px6M-12Bx7M-12Bx7M-12Bx7O-12Dx7O-12Dx8A-11Hx8A-11Px8I-11Px8O-10Dx10A-9Hx10M-8Bx12I-7Px323';
    var iconCold84      = 'x94AHx19AHx19AHx19AHx17Dx1AHOHx14OBx1AHMDx14M-1P-1HIBx14O-1H-1H-1Dx15AD-1G-1Hx15IB-1E-1Px15M-3Bx12ODx2O-3Dx2MHx8MBx3A-2Hx2MDx8MBx3I-2Px2IDx8OBx3M-1Bx3IHx8OBx3O-1Dx3IHx8O-1Px3AHx3IHx6OHx1Ax4AHx3AHODx4MBx1Ax4AHx3Ax1IBx4M-1P-1Hx3AHx3Ax1ABx4M-1D-1Hx3AHx2O-1M-1Dx4O-3Hx3AHx2O-3Hx5I-2Hx3AHx2O-2Bx6O-2Dx3AHx2O-2Hx7I-1Dx3AHx2M-2Px7M-1Bx3AHx2I-1Dx8A-2Px2AHx2A-2Hx6A-3Dx5M-4Px4I-5Px4A-5Px3I-2HI-1Dx3M-1BO-3Px3I-1Hx1O-1Bx3M-1Hx1O-1Bx4IHx3IDx1AHMBx3OBx9MDO-1BODx15HM-2Ox17I-2Px17A-2Hx17A-2Hx17A-2Hx17A-2Hx17A-2Hx17I-2Hx15OHI-2OHx9Mx4MDM-1BMBx4Jx4IBx3ABx1ADM-1Hx2IBx4I-1Bx1M-1Bx3M-1Dx1M-2Px3I-2B-2Hx3O-2I-3Px3M-4Bx5I-4Dx5I-3Dx5O-3Dx7I-2Px2AHx2I-1Bx8I-1Dx3AHx2M-1Bx8A-1Dx3AHx2O-2Hx6M-2Hx3AHx2O-2Dx6A-2Hx3AHx2O-3Px4O-3Hx3AHx2O-1I-1Dx4I-1H-1Hx3AHx3AO-1Bx4I-1P-1Px3AHx3Ax1IDx4MDx1Ax4AHx3AHODx4Ox1O-1Px3AHx3IHx1Hx6O-1Px3AHx3IHx8OBx3O-1Dx3IHx8OBx3M-1Bx3IDx8MBx3I-2Px2MDx8MDx3A-2Hx2MDx9Dx2O-3Dx2Mx13M-3Bx16IB-1E-1Px15AD-1G-1Hx14O-1H-1H-1Dx14M-1P-1HIBx14OBx1AHMDx15Dx1AHOHx17AHx19AHx19AHx19AHx114';
    var iconFocused84   = 'x114A-2Px16A-4Hx14I-6Px12O-7Dx12I-8Px10O-9Dx10I-10Px9A-10Hx8O-11Dx8M-11Bx8A-12Hx7A-12Hx6O-13Bx6M-13Bx6I-14Px5A-14Hx4O-15Dx4O-15Dx4M-15Bx4M-15Bx4I-16Px3I-16Px3A-16Hx3A-16Hx2O-17Dx2O-17Dx2O-17Dx2M-17Bx2M-17Bx2M-17Bx2M-2Bx11M-2Bx2I-2Hx12A-2Px1I-2Px12I-2Px1I-2Px12I-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-1Bx13M-2Px1I-2Px12I-2Px1I-2Px12I-2Px1M-2Hx12A-1Bx2M-2Bx11M-2Bx2M-17Bx2M-17Bx2M-17Bx2O-17Dx2O-17Dx2O-17Dx3A-16Hx3A-16Hx3I-16Px3I-16Px3M-15Bx4M-15Bx4O-15Dx4O-15Dx5A-14Hx5I-14Px5M-13Bx6M-13Dx7A-12Dx7A-12Px7M-12Px7O-11Dx9A-10Hx9I-10Px9O-9Dx11I-8Px11O-7Dx13I-6Px14A-4Hx16A-2Px92';
    var iconFood84      = 'x344O-3Px15O-5Px14I-6Px12M-7Dx12A-8Px10M-9Dx10I-9Bx10A-10Px8M-11Hx8M-11Bx8A-11Bx8A-12Px6O-13Hx6M-13Dx6M-13Dx6I-13Bx6I-13Bx6A-14Px49Bx2MHx1ODx2Ax9O-1Px1IDx1MBx1O-1Hx8I-1BO-2P-2DI-2Px6G-13Dx6A-13Bx6A-14Px5A-1G-2DI-1BO-2P-2Px5ADx1M-1PO-1Hx1IDx1O-1Px5Ix2ODx2Ax2MHx2Mx48O-13Hx6I-13Bx6I-13Bx6Bx13Ix6Dx13Mx6Bx13Ix6I-13Bx6I-13Bx6M-13Dx49I-11Bx7M-13Dx6I-13Bx6A-13Bx6A-14Px5A-14Px5A-14Px5I-13Bx6I-13Bx6M-13Dx7I-11Bx319';
    var iconHot84       = 'x114O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx13Nx4O-1Dx4Nx8Ix4O-1Dx4Ix8AHx3O-1Dx4AHx6O-1Dx3O-1Dx3O-1Dx6M-1Bx9M-1Bx6O-2Px8I-1Dx7A-1Hx8A-1Hx7I-1Dx7O-2Px7M-1Bx7M-1Bx8O-1Bx7M-1Dx9ADx2M-1Bx2O-1Hx9IHx1O-3Dx2Ax10Mx2I-4Px1Jx12O-5Dx14M-5Bx14I-6Px13A-6Hx12O-7Hx12O-7Dx12M-7Bx12M-7Bx12I-8Px11I-8Px11I-8Px11A-8Hx6I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px1I-2Dx1A-8HO-3Px6A-8Hx11I-8Px11I-8Px11I-8Px11M-7Bx12M-7Bx12O-7Dx12O-7Dx13A-6Hx13I-6Px13M-5Bx15A-4Dx12Mx2I-4Px1Jx10IHx1O-3Dx2Ax10ADx2M-1Bx2O-1Hx8O-1Bx7M-1Dx8M-1Bx7M-1Bx8I-1Dx7O-2Px7A-1Hx8A-1Hx6O-2Px8I-1Dx6M-1Bx9M-1Bx6O-1Dx3O-1Dx3O-1Dx7AHx3O-1Dx4AHx7Ix4O-1Dx4Ix8Nx4O-1Dx4Nx13O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx18O-1Dx93';
    var iconLoud84      = 'x222MDx19IBx19ABx18O-1Bx3OHx13M-1Bx3MDx13I-1Bx3IBx13A-1Bx3ADx12O-2Bx2O-1Hx12M-2Bx2M-1Px12I-2Bx2IBx13A-2Bx2ADx12O-3Bx1O-1Hx12M-3Bx1M-1Px12I-3Bx1IBx13A-3Bx1ADx12O-4Bx1AHx12M-4Bx1Ix7M-4HI-4Bx1Nx7A-4HI-4Bx9A-4HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx1M-3Bx2O-5HI-4Bx1M-3Bx2O-5HI-4Bx1M-3Bx2O-5HI-4Bx1M-3Bx2O-5HI-4Bx1M-3Bx2O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx8O-5HI-4Bx9A-4HI-4Bx9A-4HI-4Bx9M-4HI-4Bx1Nx13M-4Bx1Ix13O-4Bx1AHx13A-3Bx1ADx13I-3Bx1IBx13M-3Bx1M-1Px12O-3Bx1O-1Hx13A-2Bx2ADx13I-2Bx2IBx13M-2Bx2M-1Px12O-2Bx2O-1Hx13A-1Bx3ADx13I-1Bx3IBx13M-1Bx3MDx13O-1Bx3OHx14ABx19IBx19MDx196';
    var iconMood44      = 'x59O-1Px8I-1Dx7O-3Px6M-3Hx6M-3Hx6I-3Dx6I-3Dx6I-3Dx6A-3Bx6A-3Bx6I-3Dx6I-3Dx6I-3Dx6M-3Hx6M-3Hx6O-3Px7A-1Bx8A-1Bx7M-3Hx6I-3Dx6A-3Bx5O-5Px4M-5Hx4I-5Dx4I-5Dx4A-5Bx4A-5Bx3O-7Px2O-7Px2O-7Px2O-7Px2O-7Px2O-7Px2O-7Px2O-7Px45';
    var iconMood84      = 'x198M-1Dx17O-3Hx16I-3Bx16A-4Px14O-5Dx14M-5Bx14I-5Bx14A-6Px13A-6Hx12O-7Hx12M-7Dx12M-7Dx12M-7Dx12M-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12I-7Bx12M-7Bx12M-7Dx12M-7Dx12O-7Dx12O-7Hx13A-6Hx13A-6Px13I-5Bx14M-5Dx14O-5Dx15A-4Px15I-3Bx16I-4Hx14O-6Px13I-6Hx12O-7Bx12M-8Hx11I-8Dx11A-8Bx10O-10Px9M-10Hx9I-10Dx9A-10Dx9A-10Bx8O-12Px7M-12Px7M-12Hx7I-12Hx7I-12Dx7I-12Dx7A-12Dx7A-12Bx7A-12Bx7A-12Bx6O-13Bx6O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px5O-14Px212';
    var iconOk84        = 'x498MHx19IDx19ABx18O-2Px17M-2Hx17I-2Hx17A-2Hx16O-3Px16M-2Bx17I-2Dx17A-2Hx16O-3Px16M-2Bx17I-2Dx10Jx6A-2Hx10Ax5O-3Px9O-1Hx4M-2Bx10M-1Dx4I-2Dx10I-1Bx4A-2Hx10A-2Px2O-3Px10A-2Hx2M-2Bx11I-2Dx2I-2Dx11M-2Bx2A-2Hx11O-3PO-3Px12A-2HM-2Bx13I-2DI-2Dx13M-6Hx13O-6Px14A-4Bx15I-4Dx15M-4Hx15O-4Px16A-2Bx17I-2Dx17M-2Hx17O-2Px18ABx19IDx19MHx473';
    var iconPoll84      = 'x239O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx16O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx10O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx4O-3Dx1O-3Dx1O-3Dx233';
    var iconRoom44      = 'x15O-1Px8A-1Dx7O-3Px6M-3Hx6I-3Hx6I-3Dx6I-1O-1Dx6ABx1ABx6ADx1IBx6ADx1IBx6ADx1IBx6ADDIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx6ADBIBx5O-1DBI-1Px4O-1DBI-1Px4M-1HBI-1Hx4M-1PBM-1Hx4I-1OBO-1Hx4IBM-1O-1Dx4IBM-1H-1Dx4IBM-1H-1Dx4IBM-1H-1Dx4IBM-1G-1Dx4I-1O-1O-1Hx4M-1Hx1M-1Hx4M-1Dx1I-1Hx4O-1BO-2Px4O-5Px5A-3Bx6I-3Dx6M-3Hx7A-1Bx8O-1Px4';
    var iconRoom84      = 'x51I-1Dx17O-3Px16M-3Dx16A-3Bx15O-5Px14O-5Hx14M-1Bx1I-1Dx14I-1Hx1M-1Dx14I-1Px1O-1Bx14IBx3ABx14ABx3IBx14ABx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx3IBx14ADx1Ax1IBx14ADO-1HIBx14ADO-1HIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DIBx14ADM-1DI-1Px12O-1DM-1DI-1Px12O-1DM-1DI-1Hx12M-1DM-1DI-1Dx12I-1DM-1DM-1Bx12A-1PM-1DO-1Bx12A-1PM-1Dx1A-1Px10O-1Bx1I-1Dx1I-1Px10O-1Dx1A-2PM-1Hx10M-1HO-3HM-1Hx10M-1HM-3DO-1Hx10M-1HM-3DO-1Dx10M-1PI-3BO-1Dx10I-1PI-3Bx1ADx10I-1PI-3Bx1ADx10I-1P-5P-1Dx10I-1PI-3Bx1ADx10I-1PI-3Bx1ADx10M-1PI-3BO-1Dx10M-1PI-3BO-1Dx10M-1HM-3DO-1Dx10M-1HM-3HO-1Hx10O-1HO-3HM-1Hx10O-1Dx1I-1Bx1M-1Hx10O-1Bx1O-1Dx1I-1Px11ABx5A-1Px11A-1Hx3O-1Bx12I-1Dx3M-1Bx12M-2Px2A-1Dx12O-2Dx1I-2Hx13A-6Px13I-5Bx14M-5Dx15A-4Px15M-3Dx17A-1Bx51';
    var iconSound44     = 'x41Mx10Ax9O-1Px8M-1Px8I-1Px8A-1Px7O-2Px7M-2Px7I-2Px7A-2Px3I-2H-3Px3I-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3A-2H-3Px3I-2H-3Px3M-2H-3Px7A-2Px7I-2Px7M-2Px7O-2Px8A-1Px8I-1Px8M-1Px8O-1Px9Ax46';
    var iconSound84     = 'x142IDx19ADx18M-1Dx18M-1Dx18A-1Dx18A-1Dx17M-2Dx17M-2Dx17A-2Dx17A-2Dx16M-3Dx16M-3Dx16A-3Dx15O-4Dx15O-4Dx15I-4Dx15I-4Dx14O-5Dx14O-5Dx8A-4DM-5Dx7M-5DM-5Dx7M-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7I-5DM-5Dx7M-5DM-5Dx7M-5DM-5Dx8A-4DM-5Dx14O-5Dx15A-4Dx15I-4Dx15M-4Dx15O-4Dx16A-3Dx16I-3Dx16M-3Dx16O-3Dx17A-2Dx17I-2Dx17M-2Dx17O-2Dx18A-1Dx18I-1Dx18M-1Dx18O-1Dx19ADx19IDx129';


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

    clearDisplayForPoll = function () {
        context.fillStyle = COLOR_WHITE;
        context.fillRect(0, 50, 320, 240);
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
                        context.fillRect(130, 120, 1, 1);
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

        log('showMainDisplay');

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
            // show one big circle
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
                    var x = 0;

                    context.fillStyle = COLOR_BLACK;
                    for (var i = 78; i < 162; i++) {
                        for (var j = 118; j < 202; j++) {
                            if (draw[x] === '1') {
                                context.fillRect(j, i, 1, 1);
                            }
                            x++;
                        }
                    }
                }
            // show one big circle and the small on top-right
            } else if (drawData[1] === '2') {
                showSubmenuCircle();
                var iconBig = null;
                var iconSmall = null;
                var imageString;
                var draw;
                var x;
                var i;
                var j;

                context.fillStyle = COLOR_WHITE;
                context.fillRect(94, 78, 84, 84);
                context.fillRect(181, 70, 44, 44);

                if (drawData[3] === 'OK') {
                    iconBig = iconOk84;
                } else if (drawData[3] === 'COFFEE') {
                    iconBig = iconCoffee84;
                } else if (drawData[3] === 'FOOD') {
                    iconBig = iconFood84;
                } else if (drawData[3] === 'FOCUS') {
                    iconBig = iconFocused84;
                } else if (drawData[3] === 'HOT') {
                    iconBig = iconHot84;
                } else if (drawData[3] === 'COLD') {
                    iconBig = iconCold84;
                } else if (drawData[3] === 'LOUD') {
                    iconBig = iconLoud84;
                }

                if (drawData[2] === 'MOOD') {
                    iconSmall = iconMood44;
                } else if (drawData[2] === 'SOUND') {
                    iconSmall = iconSound44;
                } else if (drawData[2] === 'ROOM') {
                    iconSmall = iconRoom44;
                }

                if (iconBig !== null) {
                    imageString = bitToImage(iconBig);
                    draw = imageString.split("");
                    x = 0;

                    context.fillStyle = COLOR_BLACK;
                    for (i = 78; i < 162; i++) {
                        for (j = 94; j < 178; j++) {
                            if (draw[x] === '1') {
                                context.fillRect(j, i, 1, 1);
                            }
                            x++;
                        }
                    }
                }

                if (iconSmall !== null) {
                    imageString = bitToImage(iconSmall);
                    draw = imageString.split("");
                    x = 0;

                    context.fillStyle = COLOR_BLACK;
                    for (i = 70; i < 114; i++) {
                        for (j = 181; j < 225; j++) {
                            if (draw[x] === '1') {
                                context.fillRect(j, i, 1, 1);
                            }
                            x++;
                        }
                    }
                }

            //draw two Circles for poll
            } else if(drawData[1] === '3') {
                showPollCircles();
                var iconLeft = iconPoll84;
                var iconRight;
                var imageString;
                var draw;
                var x;
                var i;
                var j;


                context.fillStyle = COLOR_WHITE;
                context.fillRect(70, 78, 84, 84);
                context.fillRect(167, 78, 84, 84);

                if (drawData[2] === 'BREAK') {
                    iconRight = iconCoffee84;
                } else if (drawData[2] === 'LUNCH') {
                    iconRight = iconFood84;
                } else if (drawData[2] === 'HOT') {
                    iconRight = iconHot84;
                } else if (drawData[2] === 'COLD') {
                    iconRight = iconCold84;
                } else if (drawData[2] === 'LOUD') {
                    iconRight = iconLoud84;
                }

                if (iconLeft !== null) {
                    imageString = bitToImage(iconLeft);
                    draw = imageString.split("");
                    x = 0;

                    context.fillStyle = COLOR_BLACK;
                    for (i = 78; i < 162; i++) {
                        for (j = 70; j < 154; j++) {
                            if (draw[x] === '1') {
                                context.fillRect(j, i, 1, 1);
                            }
                            x++;
                        }
                    }
                }

                if (iconRight !== null) {
                    imageString = bitToImage(iconRight);
                    draw = imageString.split("");
                    x = 0;

                    context.fillStyle = COLOR_BLACK;
                    for (i = 78; i < 162; i++) {
                        for (j = 167; j < 251; j++) {
                            if (draw[x] === '1') {
                                context.fillRect(j, i, 1, 1);
                            }
                            x++;
                        }
                    }
                }

                var textLeft = 'NO';
                var textRight = 'YES';
                var textSize = 15;
                var padding = 10;

                context.fillStyle = COLOR_WHITE;
                context.fillRect(0, DISPLAY_HEIGHT - padding * 2 - textSize, DISPLAY_WIDTH, padding * 2 + textSize);

                context.fillStyle = COLOR_BLACK;
                context.font = textSize + "px Courier New";
                context.fillText(textLeft, padding, DISPLAY_HEIGHT - padding);
                context.fillText(textRight, padding+(DISPLAY_WIDTH-4.5*padding), DISPLAY_HEIGHT-padding);
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
        clearDisplayForPoll();

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
        log('showMenu');
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