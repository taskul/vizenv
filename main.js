const {app, BrowserWindow, Menu, nativeTheme, ipcMain, dialog} = require('electron');
// to install node-pty, I had to use npm ci node-pty
const pty = require('node-pty');
const os = require('os');
const path = require('path');
const { changedDirectory } = require('./public/utils/changeDirectory.js');


let mainWindow;
let currentDirectory;
let currentCommand;
let inPythonShell = false;

const isDev = process.env.NODE_ENV !== 'development' ? true : false
const isMac = process.platform === 'darwin' ? true : false

nativeTheme.themeSource = 'dark';

// setting a PUBLIC_URL variable to the path of the public folder for the renderer process to access the public folder for images
process.env.PUBLIC_URL = path.join(__dirname, 'public');

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'VizEnv',
        width: isDev ? 1200 : 500,
        height: 800,
        icon: './assets/icons/icon.png',
        resizable: isDev ? true : false,
        backgroundColor: 'white',
        autofill: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'public', 'preload.js'),
        }
    });
    console.log("PRELOAD", path.join(__dirname, 'preload.js'));

    if (isDev) {
        mainWindow.webContents.openDevTools()
      }
    
    mainWindow.loadFile('public/index.html')
    
    mainWindow.on('closed', () => mainWindow = null);
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
      ptyProcess.write(options.command + '\r');
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
        // Revised regex that strictly matches ANSI escape codes
      // \x1B\[\d*;?\d*[A-Z] - Matches typical cursor and style escape sequences
      // \x1B\[\??\d+[hl] - Matches screen and mode settings
      // \x1B\].*?\x07 - Matches OSC (Operating System Command) sequences
    return str.replace(/\x1b\[[0-9;?]*[a-zA-Z]|\x1b\].*?\x07/g, '');
  }
  console.log("Raw output before:", JSON.stringify(data));
  data = stripAnsiEscapeCodes(data);

  if (isError(data)) {
      console.error("Error detected:", data);
      // checkPythonCommmds(data);
      mainWindow.webContents.send('cli:error', data);  
  } else {
      mainWindow.webContents.send('cli:reply', data);
      // watches for a command "cd" to change the directory display in the terminal
      if (currentCommand && currentCommand.startsWith('cd')) {
        // update UI with new directory
        currentDirectory = changedDirectory(data, currentCommand, currentDirectory, mainWindow);
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
  console.log("RESULT", result);
  if (!result.canceled && result.filePaths.length > 0) {
    ptyProcess.write('cd ' + result.filePaths[0] + '\r');
    currentCommand = 'cd ' + result.filePaths[0];
    return result.filePaths[0];
  }
  return null;
});

// ---------------------------PYTHON ENV COMMANDS
ipcMain.on('buttonActivated:command', (e, options) => {
  try {
    ptyProcess.write(options.command + '\r');
  } catch (error) { 
    console.error(error);
  }
});
  