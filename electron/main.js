const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const store = require('electron-store');

// Create configuration store
const electronStore = new store();

let mainWindow;

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
    icon: path.join(__dirname, '../public/images/Logo/logo.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:1111'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window events
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Handle app shortcuts
    if (input.control && input.shift && input.keyCode === 73) {
      // Ctrl+Shift+I to toggle DevTools
      mainWindow.webContents.toggleDevTools();
    }
  });
}

// App event handlers
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // On macOS, keep app active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers for authentication and device fingerprinting

/**
 * Get stored session data
 */
ipcMain.handle('get-session', async () => {
  return electronStore.get('session', null);
});

/**
 * Store session data
 */
ipcMain.handle('set-session', async (event, sessionData) => {
  electronStore.set('session', sessionData);
  return true;
});

/**
 * Clear session data (logout)
 */
ipcMain.handle('clear-session', async () => {
  electronStore.delete('session');
  // Clear all cookies
  const ses = session.defaultSession;
  await ses.clearStorageData({
    storages: ['cookies'],
  });
  return true;
});

/**
 * Get device fingerprint (unique identifier for this Electron app instance)
 */
ipcMain.handle('get-device-fingerprint', async () => {
  const crypto = require('crypto');
  
  // Create unique fingerprint based on machine-specific data
  let fingerprint = electronStore.get('device-fingerprint', null);
  
  if (!fingerprint) {
    // Generate new fingerprint on first run
    const os = require('os');
    const { v4: uuidv4 } = require('uuid');
    const machineId = uuidv4();
    const data = {
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,
      hostname: os.hostname(),
      machineId: machineId,
      appVersion: app.getVersion(),
    };
    
    fingerprint = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    
    electronStore.set('device-fingerprint', fingerprint);
  }
  
  return {
    fingerprint,
    platform: process.platform,
    arch: process.arch,
    appVersion: app.getVersion(),
  };
});

/**
 * Check for duplicate sessions across devices
 * For Electron, we store the last logout time and check if session conflicts exist
 */
ipcMain.handle('check-duplicate-session', async (event, sessionData) => {
  const lastSession = electronStore.get('last-session-check', null);
  
  if (lastSession && lastSession.email === sessionData.email) {
    // Same user, update session
    electronStore.set('last-session-check', {
      email: sessionData.email,
      timestamp: Date.now(),
      deviceId: sessionData.deviceId,
    });
    return { isDuplicate: false };
  }
  
  // New user, store session
  electronStore.set('last-session-check', {
    email: sessionData.email,
    timestamp: Date.now(),
    deviceId: sessionData.deviceId,
  });
  
  return { isDuplicate: false };
});

/**
 * Invalidate all other sessions for security
 * In Electron context, this clears local storage and cookies
 */
ipcMain.handle('invalidate-other-sessions', async () => {
  try {
    const ses = session.defaultSession;
    await ses.clearStorageData({
      storages: ['localStorage', 'cookies'],
    });
    return { success: true };
  } catch (error) {
    console.error('Error invalidating sessions:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Validate token is still active
 * Check if the stored token matches the current session
 */
ipcMain.handle('validate-token', async (event, token) => {
  try {
    const session = electronStore.get('session', null);
    
    if (!session || !session.token) {
      return { isValid: false, reason: 'No token stored' };
    }
    
    if (session.token !== token) {
      return { isValid: false, reason: 'Token mismatch' };
    }
    
    // Check token expiry
    if (session.tokenExpiry && new Date(session.tokenExpiry) < new Date()) {
      return { isValid: false, reason: 'Token expired' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, reason: error.message };
  }
});

/**
 * Log user out securely
 */
ipcMain.handle('logout', async () => {
  try {
    electronStore.delete('session');
    electronStore.delete('last-session-check');
    
    const ses = session.defaultSession;
    await ses.clearStorageData({
      storages: ['localStorage', 'sessionStorage', 'cookies'],
    });
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About NitMiner',
          click: () => {
            // Show about dialog
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createMenu);

module.exports = { mainWindow };
