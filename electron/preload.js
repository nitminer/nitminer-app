const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the web app
contextBridge.exposeInMainWorld('nitminerElectron', {
  // Session management
  getSession: () => ipcRenderer.invoke('get-session'),
  setSession: (sessionData) => ipcRenderer.invoke('set-session', sessionData),
  clearSession: () => ipcRenderer.invoke('clear-session'),
  
  // Device fingerprinting
  getDeviceFingerprint: () => ipcRenderer.invoke('get-device-fingerprint'),
  checkDuplicateSession: (sessionData) => 
    ipcRenderer.invoke('check-duplicate-session', sessionData),
  invalidateOtherSessions: () => ipcRenderer.invoke('invalidate-other-sessions'),
  
  // Token validation
  validateToken: (token) => ipcRenderer.invoke('validate-token', token),
  
  // Authentication
  logout: () => ipcRenderer.invoke('logout'),
  
  // Platform info
  getPlatform: () => process.platform,
  getVersion: () => process.version,
});

// Listen for messages from main process
ipcRenderer.on('session-invalidated', () => {
  // Notify renderer about session invalidation
  window.dispatchEvent(new CustomEvent('session-invalidated'));
});

// Monitor logout from other windows
ipcRenderer.on('logout-from-other-window', () => {
  window.dispatchEvent(new CustomEvent('logout-from-other-window'));
});
