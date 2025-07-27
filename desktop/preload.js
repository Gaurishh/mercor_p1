console.log('🔌 preload.js has loaded');
console.log('=== PRELOAD SCRIPT STARTING ===');

try {
  const { contextBridge, ipcRenderer } = require('electron');
  
  console.log('Preload script loaded successfully');
  console.log('contextBridge available:', !!contextBridge);
  console.log('ipcRenderer available:', !!ipcRenderer);

  if (contextBridge && ipcRenderer) {
    contextBridge.exposeInMainWorld('electronAPI', {
      openExternal: (url) => ipcRenderer.invoke('open-external', url),
      takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
      setEmployeeId: (employeeId) => ipcRenderer.invoke('set-employee-id', employeeId)
    });
    
    // Also expose a simple test function
    contextBridge.exposeInMainWorld('testPreload', () => {
      console.log('Preload script is working!');
      return 'Preload script is working!';
    });
    
    console.log('electronAPI exposed to window successfully');
  } else {
    console.error('Required APIs not available:', { contextBridge: !!contextBridge, ipcRenderer: !!ipcRenderer });
  }
} catch (error) {
  console.error('Error in preload script:', error);
}

console.log('=== PRELOAD SCRIPT COMPLETED ==='); 