const {app, BrowserWindow, Menu, nativeTheme, ipcMain, dialog} = require('electron');
// to install node-pty, I had to use npm ci node-pty
const pty = require('node-pty');
const os = require('os');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { changedDirectory } = require('./public/utils/changeDirectory.js');

let mainWindow;
let currentDirectory ='';
let currentCommand ='';
let dirChangedByClick = false;

// const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isDev = true;
const isMac = process.platform === 'darwin' ? true : false


nativeTheme.themeSource = 'dark';

// setting a PUBLIC_URL variable to the path of the public folder for the renderer process to access the public folder for images
process.env.PUBLIC_URL = path.join(__dirname, 'public');

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'VizEnv',
        width: 1000,
        height: 800,
        icon: './assets/icons/icon.png',
        resizable: true,
        backgroundColor: '#0F0F0F',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'public', 'preload.js'),
        }
    });

    if (isDev) {
        mainWindow.webContents.openDevTools()
      }
    
    mainWindow.loadFile('public/index.html')
    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();
    
    mainWindow.on('closed', () => mainWindow = null);
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
      title: 'About VizEnv',
      width: 400,
      height: 400,
      icon: './assets/icons/icon.png',
      resizable: false,
      backgroundColor: '#0F0F0F',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
    }
  });
  // load the about.html file into the about window
  aboutWindow.loadFile('public/about.html');
}


app.on('ready', () => {
    createMainWindow();
    mainWindow.webContents.on('dom-ready', () => {
      currentDirectory = process.cwd();
      mainWindow.webContents.send('terminal:start', currentDirectory);
    });

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
});

const menu = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      role: 'fileMenu',
    },
    ...(!isMac ? [{ 
      label: 'Help',
      submenu: [
          {
              label: 'About',
              click: createAboutWindow
          }
      ]
    }] : []),
    ...(isDev
      ? [
          {
            label: 'Developer',
            submenu: [
              { role: 'reload' },
              { role: 'forcereload' },
              { type: 'separator' },
              { role: 'toggledevtools' },
            ],
          },
        ]
      : []),
  ]

  app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })

let ptyProcess = pty.spawn('cmd.exe', [], {
  name: 'xterm-color',
  cwd: process.cwd(),
  env: process.env
});

// listen for command from the UI and send it to the terminal
ipcMain.on('cli:command', (e, options) =>{
    
    try {
      ptyProcess.write(options.command + '\r')
      currentCommand = options.command;
      // close app if user types exit
      if (options.command === "exit") {
        ptyProcess.kill();
        app.quit();
      }
    } catch (error) {
      console.error(error);
    }
})

function isError(message) {
  // A regex to match various common error messages
  const errorRegex = /error:|failed|is not recognized|cannot find|cannot open|invalid/i;
  return errorRegex.test(message);
}

ptyProcess.on('data', (data) => {

  function stripAnsiEscapeCodes(str) {
    // Adjusted regex to match cursor visibility and other control sequences
      // \x1B\[\d*;?\d*[A-Z] - Matches typical cursor and style escape sequences
      // \x1B\[\??\d+[hl] - Matches screen and mode settings
      // \x1B\].*?\x07 - Matches OSC (Operating System Command) sequences
      return str.replace(/\x1b\[[0-9;?]*[a-zA-Z]|\x1b\].*?\x07|\x1b\[\d*;\d*[H]/g, '');
  }
  data = stripAnsiEscapeCodes(data);

  if (isError(data)) {
      mainWindow.webContents.send('cli:error', data);  
  } else {
      // this manages the output of the terminal when user changes the directory
      if (currentCommand.startsWith('cd ')) {
        currentDirectory = changedDirectory(data, currentCommand, currentDirectory, mainWindow, dirChangedByClick);
        dirChangedByClick = false;
      } else {
        // all other command output goes through here
          mainWindow.webContents.send('cli:reply', data);
      }
  }
});



ptyProcess.on('exit', (code, signal) => {
  console.log('exit', code, signal);
});

ptyProcess.on('error', (err) => {
  console.error('ptyProcess error:', err);
  mainWindow.webContents.send('cli:error', data);
});

// ipcMain.handle handles the request and sends back a response
ipcMain.handle('open:directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
      defaultPath: currentDirectory,
      properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    ptyProcess.write('cd ' + result.filePaths[0] + '\r');
    currentCommand = 'cd ' + result.filePaths[0];
    currentDirectory = result.filePaths[0];
    dirChangedByClick = true;
    return result.filePaths[0];
  }
  if (result.canceled) {
    return currentDirectory;
  }
  return null;
});

// ipcMain.handle handles the request and sends back a response
// retrun a list of npm project dependencies from package.json back to the user
ipcMain.handle('cli:npmDependencies', async () => {
    const fs = require('fs');
    try {
      let dir = '';
      dir = currentDirectory.replace('>', '').trim();
      const packageJsonPath = path.resolve(dir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      const dependenciesList = [Object.entries(dependencies)];
      return  {
          dependencies: [...Object.entries(dependencies)], devDependencies: [...Object.entries(devDependencies)],
          packageManager: 'npm'
        };  
      } catch (error) {
        return [{error: `ERROR: ${error.message}`, packageManager: 'npm'}];
      }
  }
);

// -------cli commands activated by buttons in a side menu------
ipcMain.on('buttonActivated:command', (e, options) => {
  try {
    ptyProcess.write(options.command + '\r');
    currentCommand = options.command;
  } catch (error) { 
    console.error(error);
  }
});
  
// -----------------Manage updates-------------------
autoUpdater.on('update-available', (info) => {
  log.info('Update available.');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update available',
    message: 'A new version is available. Do you want to update now?',
    buttons: ['Yes', 'No'],
  }).then((result) => {
    if (result.response === 0) { // 'Yes' button index
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded.');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update ready',
    message: 'Update downloaded. It will be installed on restart. Restart now?',
    buttons: ['Yes', 'Later'],
  }).then((result) => {
    if (result.response === 0) { // 'Yes' button index
      autoUpdater.quitAndInstall();
    }
  });
});