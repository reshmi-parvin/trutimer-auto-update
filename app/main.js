"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// const { spawnSync } = require('child_process');
// const pythonProcess = spawnSync("C:\Python27/python.exe", [`${__dirname}/activityLog/event-capture.py`]);
const electron_1 = require("electron");
const { BrowserWindow } = require('electron');
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require('electron-updater');
const { log } = require('electron-log/main');
log.transports.file.resolvePathFn = () => path.join('D:\Trutimer\trutimer-client', 'logs/main.log');
const { spawn } = require('child_process');
// const pythonScriptPath = path.join(__dirname, '../activityLog/event_capture.py');
// let pythonProcess;
let index = 0;
let myWindow = null;
let win = null;
const args = process.argv.slice(1), serve = args.some(val => val === '--serve');
let isAppFocused = true;
let mouseData;
function createWindow() {
    try {
        singleInstance();
        const size = electron_1.screen.getPrimaryDisplay().workAreaSize;
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
                contextIsolation: false, // false if you want to run e2e test with Spectron,
            },
            alwaysOnTop: true,
        });
        autoUpdater.checkForUpdatesAndNotify();
        const iconpath = path.join(__dirname, 'favicon.ico');
        win.setIcon(iconpath);
        win.setVisibleOnAllWorkspaces(true);
        const contents = win.webContents;
        if (parseInt(process.versions.electron) >= 17) {
            electron_1.desktopCapturer.getSources({ types: ['window', 'screen'] }).then((sources) => __awaiter(this, void 0, void 0, function* () {
                for (const source of sources) {
                    if (source.id.startsWith('screen')) {
                        win.webContents.send('SET_SOURCE', source.id);
                        return;
                    }
                }
            }));
        }
        if (serve) {
            const debug = require('electron-debug');
            debug();
            require('electron-reloader')(module);
            win.loadURL('http://localhost:4200');
        }
        else {
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
                    electron_1.dialog.showMessageBox(options).then((res) => {
                        if (res.response === 0) {
                            win.webContents.session.clearCache();
                            contents.send("login_app_quit");
                        }
                        else {
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
                    electron_1.dialog.showMessageBox(options).then((res) => {
                        if (res.response === 0) {
                            win.webContents.session.clearCache();
                            contents.send("app_quit");
                        }
                        else {
                            win.maximize();
                        }
                    });
                }
            }
        });
        electron_1.app.on('browser-window-focus', () => {
            isAppFocused = true;
        });
        electron_1.app.on('browser-window-blur', () => {
            isAppFocused = false;
        });
        let contextMenu = electron_1.Menu.buildFromTemplate([
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
                    electron_1.app.quit();
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
    }
    catch (e) {
        fs.appendFile("./logging.txt", e, (err) => {
            if (!err) {
            }
            else {
            }
        });
    }
}
try {
    electron_1.app.commandLine.appendSwitch("disable-background-timer-throttling");
    electron_1.app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");
    electron_1.app.on('ready', () => setTimeout(createWindow, 400));
    electron_1.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', () => {
        if (win === null) {
            createWindow();
        }
    });
    electron_1.ipcMain.on("minimize", (event, arg) => {
        win.minimize();
    });
    electron_1.ipcMain.on('windowClose', (event) => __awaiter(void 0, void 0, void 0, function* () {
        win = null;
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    }));
    electron_1.ipcMain.on('windowCloseHandler', (event) => __awaiter(void 0, void 0, void 0, function* () {
        win = null;
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    }));
    electron_1.ipcMain.on("app_bring_to_front", (event, arg) => {
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
    electron_1.ipcMain.on('timer-stopped', () => {
        win.webContents.send('timer-stopped');
    });
    electron_1.ipcMain.on('screenshot', (event) => __awaiter(void 0, void 0, void 0, function* () {
        const screenshotdir = '../screenshoot';
        try {
            const sources = yield electron_1.desktopCapturer.getSources({
                types: ["screen"],
                thumbnailSize: { height: 720, width: 1000 },
            });
            if (sources.length >= 0) {
                const newfilename = sources[0].thumbnail.toDataURL();
                event.reply('asynchronous-reply', newfilename);
            }
        }
        catch (error) {
            console.error('Error capturing screenshot:', error);
            event.reply('asynchronous-reply', null);
        }
    }));
    electron_1.ipcMain.on('requestSystemIdleStatus', (event, idleTime) => {
        const parsedIdleTime = Number(idleTime);
        if (typeof parsedIdleTime === 'number') {
            const systemIdleState = electron_1.powerMonitor.getSystemIdleState(parsedIdleTime);
            let isSystemIdle = systemIdleState === 'idle' ? 1 : 0;
            event.reply('systemIdleStatus', isSystemIdle);
        }
        else {
            console.error('Invalid IdleTime argument:', idleTime);
        }
    });
}
catch (e) {
}
function singleInstance() {
    const gotTheLock = electron_1.app.requestSingleInstanceLock();
    if (!gotTheLock) {
        electron_1.app.quit();
    }
    else {
        electron_1.app.on("second-instance", (event, commandLine, workingDirectory) => {
            if (myWindow) {
                if (myWindow.isMinimized())
                    myWindow.restore();
                electron_1.ipcMain.on("app_bring_to_front", (event, arg) => {
                    win.setAlwaysOnTop(true, "floating");
                    win.setVisibleOnAllWorkspaces(true);
                    win.maximize();
                });
            }
        });
        electron_1.app.on("ready", () => { });
    }
}
electron_1.powerMonitor.on('suspend', () => {
    win.webContents.send('system-suspend');
});
electron_1.powerMonitor.on('lock-screen', () => {
    win.webContents.send('system-lock-screen');
});
electron_1.powerMonitor.on('resume', () => {
    win.webContents.send('system-resume');
});
electron_1.powerMonitor.on('unlock-screen', () => {
    win.webContents.send('system-unlock-screen');
});
autoUpdater.on('update-available', () => {
    log.info('update-available');
});
autoUpdater.on('checking-for-update', () => {
    log.info('checking-for-update');
});
autoUpdater.on('download-progress', () => {
    log.info('download-progress');
});
autoUpdater.on('update-downloaded', () => {
    log.info('update-downloaded');
});
//# sourceMappingURL=main.js.map