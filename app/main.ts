// const { spawnSync } = require('child_process');
// const pythonProcess = spawnSync("C:\Python27/python.exe", [`${__dirname}/activityLog/event-capture.py`]);
import {
  app, desktopCapturer, ipcMain, screen, powerMonitor,
  dialog,
  Tray,
  Menu,
  globalShortcut
} from 'electron';
const { BrowserWindow } = require('electron');
import * as path from 'path';
import * as fs from 'fs';
const { autoUpdater } = require( 'electron-updater');
const {log} =  require ('electron-log/main');
log.transports.file.resolvePathFn = () => path.join('D:\Trutimer\trutimer-client', 'logs/main.log');
const { spawn } = require('child_process');
// const pythonScriptPath = path.join(__dirname, '../activityLog/event_capture.py');
// let pythonProcess;
let index = 0;
let myWindow = null;
let win: BrowserWindow = null;
type BrowserWindow = any
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');
let isAppFocused = true;
let mouseData;
function createWindow(): BrowserWindow {
  try {
    singleInstance();
    const size = screen.getPrimaryDisplay().workAreaSize;
    const fixedWidth = 900;
    const fixedHeight = 750;

    // Create the browser window.
    win = new BrowserWindow({
      x: 0,
      y: 0,
      width: fixedWidth,
      height: fixedHeight,
      minWidth: fixedWidth,
      minHeight: fixedHeight,
      webPreferences: {
        nodeIntegration: true,
        allowRunningInsecureContent: serve ? true : false,
        backgroundThrottling: false,
        contextIsolation: false,  // false if you want to run e2e test with Spectron,
      },
      alwaysOnTop: true,
    });
    autoUpdater.checkForUpdatesAndNotify();
    const iconpath = path.join(__dirname, 'favicon.ico');
    win.setIcon(iconpath);
    win.setVisibleOnAllWorkspaces(true);
    const contents = win.webContents;

    if (parseInt(process.versions.electron) >= 17) {
      desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for (const source of sources) {
          if (source.id.startsWith('screen')) {
            win.webContents.send('SET_SOURCE', source.id)
            return
          }
        }
      })
    }
    if (serve) {
      const debug = require('electron-debug');
      debug();

      require('electron-reloader')(module);
      win.loadURL('http://localhost:4200');
    } else {
      // Path when running electron executable
      let pathIndex = './index.html';

      if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
        // Path when running electron in local folder
        pathIndex = '../dist/index.html';
      }

      const url = new URL(path.join('file:', __dirname, pathIndex));
      win.loadURL(url.href);
    }

    win.setMenu(null);
    win.webContents.openDevTools();

    // function startPythonProcess() {
    //   pythonProcess = spawn('python', [pythonScriptPath]);
    //   let totalCounts = [];

    //   pythonProcess.stdout.on('data', (data) => {
    //     console.log(`Data from Python: ${data}`);
    //     mouseData = data.toString();
    //     // contents.send('pythonData', data.toString());
    //   });
    //   pythonProcess.on('exit', () => {
    //     console.log('Total counts of click, move, scroll:', totalCounts);
    //   });
    //   pythonProcess.stderr.on('data', (data) => {
    //     console.error(`Error from Python: ${data}`);
    //   });

    //   pythonProcess.on('close', (code) => {
    //     if (code !== 0) {
    //       console.error('Python process exited with code: ', code);
    //     }
    //   });
    // }

    // ipcMain.on('activityStart', async (event) => {
    //   startPythonProcess();
    // });

    // ipcMain.on('activityStop', async (event) => {
    //   contents.send('pythonData', mouseData);
    //   mouseData = null;
    //   if (pythonProcess) {
    //     pythonProcess.kill('SIGINT');
    //     pythonProcess = null; // Reset the process variable
    //   }
    // });
    // ipcMain.on('activityStopForAutoSave', async (event) => {
    //   contents.send('pythonData', mouseData);
    //   mouseData = null;
    //   if (pythonProcess) {
    //     pythonProcess.kill('SIGINT');
    //     pythonProcess = null; // Reset the process variable
    //   }
    //   startPythonProcess();
    // });

    //app.dock.hide();
    win.setVisibleOnAllWorkspaces(true);
    // globalShortcut.register('CommandOrControl+F', () => {
    //   win.webContents.send('on-search');
    // });
    // globalShortcut.register('CommandOrControl+R', () => {
    //   win.webContents.send('on-refresh');
    // });
    win.on("close", function (e) {
      if (win) {
        win.setAlwaysOnTop(false);
        if (contents.getURL().includes("login") || contents.getURL().includes("home")) {
          e.preventDefault();
          const options = {
            buttons: ["Yes", "No"],
            message: "Do you really want to quit?",
          };
          dialog.showMessageBox(options).then((res) => {
            if (res.response === 0) {
              win.webContents.session.clearCache();
              contents.send("login_app_quit");
              
            } else {
              win.maximize();
            }
          });
        }
        else {
          e.preventDefault();
          const options = {
            buttons: ["Yes", "No"],
            message: "Do you really want to quit?",
          };
          dialog.showMessageBox(options).then((res) => {
            if (res.response === 0) {
              win.webContents.session.clearCache();
              contents.send("app_quit");
            } else {
              win.maximize();
            }
          });
        }
      }
    });

    app.on('browser-window-focus', () => {
      isAppFocused = true;
    });

    app.on('browser-window-blur', () => {
      isAppFocused = false;
    });
    let contextMenu = Menu.buildFromTemplate([
      {
        label: "Show App",
        click: function () {
          win.show();
        },
      },
      {
        label: "Quit",
        click: function () {
          // app.isQuiting = true
          app.quit();
        },
      },
    ]);
    win.on('show', () => {
      win.moveTop();
      win.focus();
      win.maximize();
    });
    win.on("minimize", function (event) {
      event.preventDefault();
    });
    win.on('hide', () => {
      win.setAlwaysOnTop(false);
    });
    return win;
  } catch (e) {
    fs.appendFile("./logging.txt", e, (err) => {
      if (!err) {
      } else {
      }
    });
  }
}
try {
  app.commandLine.appendSwitch("disable-background-timer-throttling");
  app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");
  app.on('ready', () => setTimeout(createWindow, 400));
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on("minimize", (event, arg) => {
    win.minimize();
  });

  ipcMain.on('windowClose', async (event) => {
    win = null;
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  ipcMain.on('windowCloseHandler', async (event) => {
    win = null;
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  ipcMain.on("app_bring_to_front", (event, arg) => {
    //win.setAlwaysOnTop(true);
    // if (!isAppFocused) {
    //   // Bring the window to the front if the app is not focused
    //   win.focus();
    //   win.moveTop();
    // win.maximize();
    // }
    if (win.isMinimized()) {
      win.restore(); // Restore the window if it's minimized
    }
    if (!win.isVisible()) {
      win.show();
    }
    win.show(); // Show the window
    win.focus();
    win.moveTop();
    win.maximize();
  });

  ipcMain.on('timer-stopped', () => {
    win.webContents.send('timer-stopped');
  });

  ipcMain.on('screenshot', async (event) => {
    const screenshotdir = '../screenshoot';
    try {
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { height: 720, width: 1000 },
      });

      if (sources.length >= 0) {
        const newfilename = sources[0].thumbnail.toDataURL();
        event.reply('asynchronous-reply', newfilename);
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      event.reply('asynchronous-reply', null);
    }
  });

  ipcMain.on('requestSystemIdleStatus', (event, idleTime) => {
    const parsedIdleTime = Number(idleTime);
    if (typeof parsedIdleTime === 'number') {
      const systemIdleState = powerMonitor.getSystemIdleState(parsedIdleTime);
      let isSystemIdle = systemIdleState === 'idle' ? 1 : 0;
      event.reply('systemIdleStatus', isSystemIdle);
    } else {
      console.error('Invalid IdleTime argument:', idleTime);
    }
  });
} catch (e) {
}

function singleInstance() {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      if (myWindow) {
        if (myWindow.isMinimized()) myWindow.restore();
        ipcMain.on("app_bring_to_front", (event, arg) => {
          win.setAlwaysOnTop(true, "floating");
          win.setVisibleOnAllWorkspaces(true);
          win.maximize();
        });
      }
    });
    app.on("ready", () => { });
  }
}

powerMonitor.on('suspend', () => {
  win.webContents.send('system-suspend');
});

powerMonitor.on('lock-screen', () => {
  win.webContents.send('system-lock-screen');
});

powerMonitor.on('resume', () => {
  win.webContents.send('system-resume');
});

powerMonitor.on('unlock-screen', () => {
  win.webContents.send('system-unlock-screen');
});

autoUpdater.on('update-available', () =>{
  log.info('update-available');
})

autoUpdater.on('checking-for-update', () =>{
  log.info('checking-for-update');
})

autoUpdater.on('download-progress', () =>{
  log.info('download-progress');
})
autoUpdater.on('update-downloaded', () =>{
  log.info('update-downloaded');
})