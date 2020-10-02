const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const isDevMode = require('electron-is-dev');
const { CapacitorSplashScreen, configCapacitor } = require('@capacitor/electron');

const path = require('path');

// Place holders for our windows so they don't get garbage collected.
let mainWindow = null;

let tray = null;

// Placeholder for SplashScreen ref
let splashScreen = null;

//Change this if you do not wish to have a splash screen
let useSplashScreen = true;

const iconPath = path.join(__dirname, 'images', 'cicon.ico');
console.log('loading icons from : ', iconPath);
// Create simple menu for easy devtools access, and for demo
const menuTemplate = [
  // {
  //   label: 'Options',
  //   submenu: [
  //     {
  //       label: 'Open Dev Tools',
  //       click() {
  //         mainWindow.openDevTools();
  //       },
  //     },
  //   ],
  // },
];
const appMenu = {role: 'appMenu'};
const fileMenu = {role: 'fileMenu'};
const windowMenu = {role: 'windowMenu'};
const editMenu = {role: 'editMenu'};
const devMenu = {
  label: 'Options',
  submenu: [
    {role: 'toggleDevTools', label: 'Dev Tools', accelerator: 'F12'},
    {role: 'reload'},
    {role: 'forcereload'},
  ]
}

async function createWindow () {
  // Define our main window size
  mainWindow = new BrowserWindow({
    icon: iconPath,
    height: 920,
    width: 1600,
    show: false,
    // web preference are options sent to chromium browser
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'node_modules', '@capacitor', 'electron', 'dist', 'electron-bridge.js')
    }
  });

  configCapacitor(mainWindow);
 
  // setting up a new menu
  if(process.platform === 'darwin') {
    menuTemplate.push(appMenu);
  } else {
    menuTemplate.push(fileMenu);
  }
  menuTemplate.push(editMenu, windowMenu);

  if (isDevMode) {
    menuTemplate.push(devMenu);
    // Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
    // If we are developers we might as well open the devtools by default.
    // mainWindow.webContents.openDevTools();
  }

  if(useSplashScreen) {
    splashScreen = new CapacitorSplashScreen(mainWindow, {
      imageFileName: 'splash.png',
      windowHeight: 500,
      windowWidth: 400,
      loadingText: 'Starting Panchaang...',
      textColor: '#f0f0f0',
      textPercentageFromTop: 85,
      // customHtml: 'here you can pass a custom html web page, you will only need to pass window height and width'
    });
    splashScreen.init();
  } else {
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.show();
    });
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', startup);

function startup() {
  createWindow();
  buildTray();
  ipcMain.on('data', (event, data) => {
    console.log('recived data: ', data);
    setTrayMenu(data);
  })
}

function buildTray() {
  // choose png icon for mac by checking condition of process.platform
  const trayIcon = 'snticon.ico';
  tray = new Tray(path.join(__dirname,'images',trayIcon));
  tray.addListener('double-click', () => mainWindow.show());
  // tray.setPressedImage(path.join(__dirname,'images',trayIcon)) // only for macos
  tray.setToolTip(app.getName());
  // tray.setContextMenu(Menu.buildFromTemplate([
  //   {role: 'about'}, {type: 'separator'}, {role: 'quit'}
  // ]));
  setTrayMenu([]);
}

function setTrayMenu(data) {
  tray.setContextMenu(Menu.buildFromTemplate([
    {role: 'about'},     
    {type: 'separator'}, 
    buildDataMenu(data),
    {type: 'separator'}, 
    {role: 'quit'}
  ]));
}

function buildDataMenu(dataList) {
  const datalist = dataList || [];
  const dataMenuTemplate = {
    label: 'Data',
    disabled: datalist.length,
    submenu: datalist.map((data, i) => {
      return {
        label: `${data.name} | ${data.id}`,
        click: () => setDataTemp(data.id)
      }
    })
  };
  return dataMenuTemplate;
}

function setDataTemp(id) {
  console.log('sending data to angular app');
  mainWindow.webContents.send('setData', id);
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  ipcMain.removeAllListeners();
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Define any IPC or other custom functionality below here
