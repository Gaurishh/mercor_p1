const { app, BrowserWindow, ipcMain, desktopCapturer, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 720,
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: false
    },
    // Prevent opening new windows
    webSecurity: true,
    allowRunningInsecureContent: false
  });

  // Wait for React dev server to be ready
  const loadURL = async () => {
    try {
      await win.loadURL('http://localhost:3001');
      console.log('Successfully loaded React app');
    } catch (error) {
      console.log('React server not ready yet, retrying in 2 seconds...');
      setTimeout(loadURL, 2000);
    }
  };

  loadURL();
  
  // Remove the default menu
  Menu.setApplicationMenu(null);
  
  // Prevent new windows from opening
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Open external URLs in default browser
    if (url.startsWith('http')) {
      require('electron').shell.openExternal(url);
    }
    return { action: 'deny' };
  });
  
  // Make window draggable from title bar area
  win.webContents.on('dom-ready', () => {
    win.webContents.executeJavaScript(`
      // Add CSS to make title bar draggable
      const style = document.createElement('style');
      style.textContent = \`
        body {
          -webkit-app-region: drag;
        }
        button, input, a, [role="button"] {
          -webkit-app-region: no-drag;
        }
      \`;
      document.head.appendChild(style);
    `);
  });
}

// IPC handler for opening external URLs
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external URL:', error);
    return { success: false, error: error.message };
  }
});

// IPC handler for taking screenshots
ipcMain.handle('take-screenshot', async (event) => {
  try {
    // Ensure screenshots directory exists
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Get all displays
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (sources.length === 0) {
      throw new Error('No displays found');
    }

    // Take screenshot of primary display (first one)
    const source = sources[0];
    const image = source.thumbnail;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `screenshot_${timestamp}.png`;
    const filepath = path.join(screenshotsDir, filename);

    // Save the image
    fs.writeFileSync(filepath, image.toPNG());
    
    console.log(`Screenshot saved: ${filepath}`);
    return { 
      success: true, 
      filepath: filepath,
      filename: filename 
    };
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});



app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 