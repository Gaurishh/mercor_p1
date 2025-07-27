const { contextBridge, ipcRenderer, shell } = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  takeScreenshot: () => ipcRenderer.invoke('take-screenshot')
});

console.log('electronAPI exposed to window'); 