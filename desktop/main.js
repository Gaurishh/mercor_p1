const { app, BrowserWindow, ipcMain, desktopCapturer, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

// Global variables
let mainWindow;
let httpServer;
let currentEmployeeId = null; // Will be set when employee logs in

function createWindow() {
  const preloadPath = path.resolve(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', fs.existsSync(preloadPath));
  console.log('Preload script content length:', fs.statSync(preloadPath).size, 'bytes');
  
  // Read and log the first few lines of the preload script
  try {
    const preloadContent = fs.readFileSync(preloadPath, 'utf8');
    console.log('Preload script first 100 chars:', preloadContent.substring(0, 100));
  } catch (error) {
    console.error('Error reading preload script:', error);
  }
  
  // Note: Don't require preload script here - it needs to run in renderer process
  
  const win = new BrowserWindow({
    width: 400,
    height: 720,
    webPreferences: {
      // point to your preload script
      preload: preloadPath,
  
      // restore the secure defaults:
      nodeIntegration: false,
      contextIsolation: true,
  
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    },
  });

  mainWindow = win;
  win.webContents.openDevTools({ mode: 'detach' });
  
  // Add error handling for preload script
  win.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('Preload script error:', { preloadPath, error });
  });
  
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', { errorCode, errorDescription, validatedURL });
  });
  
  // Log when preload script starts loading
  win.webContents.on('did-start-loading', () => {
    console.log('Page started loading, preload script should execute soon...');
  });
  
  // Log when preload script finishes loading
  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading, checking if preload script executed...');
    win.webContents.executeJavaScript(`
      console.log('=== RENDERER PROCESS CHECK ===');
      console.log('window.electronAPI available:', !!window.electronAPI);
      console.log('window.electronAPI details:', window.electronAPI);
      console.log('window.require available:', !!window.require);
      console.log('window.process available:', !!window.process);
    `);
  });

  // Wait for React dev server to be ready
  const loadURL = async () => {
    try {
      console.log('About to load React app...');
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

// Create HTTP server for remote screenshot requests
function createHttpServer() {
  const port = process.env.ELECTRON_HTTP_PORT || 3003;
  
  httpServer = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    try {
      if (pathname === '/health' && req.method === 'GET') {
        // Health check endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          employeeId: currentEmployeeId,
          timestamp: new Date().toISOString()
        }));
        
      } else if (pathname === '/screenshot' && req.method === 'POST') {
        // Remote screenshot request
        if (!currentEmployeeId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'No employee logged in'
          }));
          return;
        }
        
        // Parse request body
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const requestData = JSON.parse(body);
            const { employeeId, timeLogId, adminRequest = false } = requestData;
            
            // Validate that the request is for the current employee
            if (employeeId !== currentEmployeeId) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                error: 'Employee ID mismatch'
              }));
              return;
            }
            
            console.log(`Remote screenshot request for employee: ${employeeId}`);
            
            // Take screenshot using existing functionality
            const result = await takeScreenshotForEmployee(employeeId, timeLogId, adminRequest);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            
          } catch (error) {
            console.error('Error processing screenshot request:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: error.message
            }));
          }
        });
        
      } else if (pathname === '/set-employee' && req.method === 'POST') {
        // Set current employee ID (called when employee logs in)
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const { employeeId } = JSON.parse(body);
            currentEmployeeId = employeeId;
            console.log(`Employee ID set to: ${employeeId}`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              employeeId: currentEmployeeId
            }));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: error.message
            }));
          }
        });
        
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Endpoint not found'
        }));
      }
      
    } catch (error) {
      console.error('HTTP server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }));
    }
  });
  
  httpServer.listen(port, () => {
    console.log(`Electron HTTP server running on port ${port}`);
  });
}

// Function to take screenshot for a specific employee
async function takeScreenshotForEmployee(employeeId, timeLogId = null, adminRequest = false) {
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
      return { 
        success: false, 
        error: 'No displays found',
        permissionDenied: false
      };
    }

    // Take screenshot of primary display (first one)
    const source = sources[0];
    const image = source.thumbnail;
    
    // Check if we got a valid image (permission check)
    if (!image || image.isEmpty()) {
      return { 
        success: false, 
        error: 'Screenshot permission denied by Windows',
        permissionDenied: true
      };
    }
    
    // Generate filename with timestamp and admin flag
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const adminFlag = adminRequest ? '_admin' : '';
    const filename = `screenshot_${employeeId}_${timestamp}${adminFlag}.png`;
    const filepath = path.join(screenshotsDir, filename);

    // Save the image
    const imageBuffer = image.toPNG();
    fs.writeFileSync(filepath, imageBuffer);
    
    // Get file size
    const stats = fs.statSync(filepath);
    const fileSize = stats.size;
    
    return { 
      success: true, 
      filepath: filepath,
      filename: filename,
      fileSize: fileSize,
      employeeId: employeeId,
      timeLogId: timeLogId,
      adminRequest: adminRequest,
      permissionDenied: false
    };
  } catch (error) {
    // Check if it's a permission-related error
    const isPermissionError = error.message.includes('permission') || 
                             error.message.includes('access') ||
                             error.message.includes('denied') ||
                             error.message.includes('blocked');
    
    return { 
      success: false, 
      error: error.message,
      permissionDenied: isPermissionError
    };
  }
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

// IPC handler for taking screenshots (existing functionality)
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
      return { 
        success: false, 
        error: 'No displays found',
        permissionDenied: false
      };
    }

    // Take screenshot of primary display (first one)
    const source = sources[0];
    const image = source.thumbnail;
    
    // Check if we got a valid image (permission check)
    if (!image || image.isEmpty()) {
      return { 
        success: false, 
        error: 'Screenshot permission denied by Windows',
        permissionDenied: true
      };
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `screenshot_${timestamp}.png`;
    const filepath = path.join(screenshotsDir, filename);

    // Save the image
    const imageBuffer = image.toPNG();
    fs.writeFileSync(filepath, imageBuffer);
    
    // Get file size
    const stats = fs.statSync(filepath);
    const fileSize = stats.size;
    
    return { 
      success: true, 
      filepath: filepath,
      filename: filename,
      fileSize: fileSize,
      permissionDenied: false
    };
  } catch (error) {
    // Check if it's a permission-related error
    const isPermissionError = error.message.includes('permission') || 
                             error.message.includes('access') ||
                             error.message.includes('denied') ||
                             error.message.includes('blocked');
    
    return { 
      success: false, 
      error: error.message,
      permissionDenied: isPermissionError
    };
  }
});

// IPC handler for setting employee ID
ipcMain.handle('set-employee-id', async (event, employeeId) => {
  currentEmployeeId = employeeId;
  console.log(`Employee ID set via IPC: ${employeeId}`);
  return { success: true, employeeId };
});

app.whenReady().then(() => {
  createWindow();
  createHttpServer();
});

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

app.on('before-quit', () => {
  if (httpServer) {
    httpServer.close();
  }
}); 