//
import { contextBridge, IpcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electron', {
  sendSystemIdleStatus: (isSystemIdle) => {
    ipcRenderer.send('systemIdleStatus', isSystemIdle);
  }
});
