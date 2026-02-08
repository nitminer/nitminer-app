# NitMiner Electron Desktop Application

This guide provides instructions for building and running the NitMiner desktop application using Electron.

## 🚀 Features

- **Cross-Platform**: Runs on Windows and macOS
- **Secure Authentication**: Integrated NextAuth with device fingerprinting
- **Session Management**: One active session per user with duplicate session detection
- **Token Validation**: Secure JWT token validation for TrustInn access
- **Offline Support**: Application data persisting in Electron store
- **Auto Updates**: Ready for electron-updater integration

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Git
- For macOS builds: Xcode command line tools
- For Windows builds: Visual Studio Build Tools (optional, for code signing)

## 🛠️ Installation

1. **Clone and install dependencies:**
```bash
cd /root/nitminer
npm install
```

2. **Install build tools (optional, for production builds):**
```bash
npm install electron-builder --save-dev
```

## 🏃 Development

### Run Development Server + Electron

```bash
npm run electron-dev
```

This command:
1. Starts the Next.js dev server (port 3000)
2. Waits for the server to be ready
3. Launches Electron pointing to localhost:3000

The application will open with hot-reload capability for code changes.

### Run Only Electron (if Next.js already running)

```bash
npm run electron
```

## 🏗️ Building

### Development Build (Unpackaged)

```bash
npm run build && npm run electron-build
```

### Windows Executable

```bash
npm run electron-build-win
```

Creates: `dist/nitminer-1.0.0.exe` (~125 MB)

### macOS Distribution

```bash
npm run electron-build-mac
```

Creates: `dist/nitminer-1.0.0.dmg` (~130 MB) - Universal (Intel + Apple Silicon)

## 📦 Project Structure

```
/root/nitminer/
├── public/
│   ├── electron.js           # Main process (Electron)
│   ├── preload.js            # Preload script for IPC
│   └── images/Logo/
├── src/
│   ├── lib/
│   │   ├── electronUtils.ts  # Electron utility functions
│   │   └── deviceFingerprint.ts
│   ├── components/
│   │   ├── Header.js         # Updated with Electron logout
│   │   └── DuplicateSessionModal.tsx
│   └── app/
│       └── downloads/
│           └── page.js       # Download page
├── electron-builder.json     # Build configuration
├── package.json              # Dependencies and scripts
└── next.config.mjs           # Next.js configuration
```

## 🔐 Security Features

### Device Fingerprinting
- Unique identification per device/browser combination
- Prevents unauthorized multi-device access
- Based on: OS, browser type, screen resolution, canvas fingerprint, WebGL info

### Session Management
- Stores session in Electron Store (encrypted on macOS/Windows)
- Validates JWT tokens against stored session
- Auto-logout on token expiration
- Invalidates other sessions on new login

### Token Validation
- Validates JWT tokens when accessing TrustInn
- Checks token expiry in Electron store
- Prevents unauthorized access after logout
- Syncs with server-side token version

## 🖥️ Electron IPC Handlers

Available in the web app via `window.nitminerElectron`:

```javascript
// Session Management
nitminerElectron.getSession()           // Get stored session
nitminerElectron.setSession(data)       // Store session
nitminerElectron.clearSession()         // Clear session

// Device Fingerprinting
nitminerElectron.getDeviceFingerprint() // Get device fingerprint

// Duplicate Session
nitminerElectron.checkDuplicateSession(data)     // Check conflicts
nitminerElectron.invalidateOtherSessions()       // Logout other sessions

// Token Validation
nitminerElectron.validateToken(token)  // Validate JWT token

// Auth
nitminerElectron.logout()               // Secure logout
```

## 🌐 URL Configuration

The Electron app connects to:
- **Development**: `http://localhost:3000`
- **Production**: Uses built web files from `./build` directory

To point to production server, update `public/electron.js`:

```javascript
const startUrl = isDev
  ? 'http://localhost:3000'
  : 'https://nitminer.com';  // Change this
```

## 📝 Download Page

Users can download the Electron app from: `/downloads`

Features:
- Platform-specific download links (Windows .exe, macOS .dmg)
- Version history with file sizes
- System requirements
- Installation instructions
- Security notices

## 🔄 Auto-Updates (Future Enhancement)

To enable auto-updates:

1. Install electron-updater:
```bash
npm install electron-updater
```

2. Update `public/electron.js`:
```javascript
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
  // ...
});
```

3. Host release files on a server accessible via internet

## 🐛 Debugging

### Electron DevTools

- Press `Ctrl+Shift+I` (Windows) or `Cmd+Option+I` (Mac) to open DevTools
- View console logs from both main and renderer processes
- Inspect Electron Store by checking localStorage

### App Store Location

- **Windows**: `%APPDATA%\nitminer\`
- **macOS**: `~/Library/Application Support/nitminer/`

Session data stored in `config.json` in above directories

### Logs

Check Electron logs in:
- **Windows**: `%APPDATA%\nitminer\logs\`
- **macOS**: `~/Library/Logs/nitminer/`

## ⚙️ Configuration

### electron-builder.json

Customize builds by modifying `electron-builder.json`:

```json
{
  "build": {
    "appId": "com.nitminer.desktop",
    "productName": "NitMiner",
    "win": {
      "target": ["nsis"]
    },
    "mac": {
      "target": ["dmg"]
    }
  }
}
```

### Next.js Configuration

For Electron, Next.js exports static HTML. Ensure your config supports this in `next.config.mjs`.

## 🚀 Distribution

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Update CHANGELOG
- [ ] Test on Windows and macOS
- [ ] Build and sign executables
- [ ] Upload to release server
- [ ] Create release notes
- [ ] Update download page links

### Hosting Releases

1. Upload `.exe` and `.dmg` files to hosting service
2. Update download links in `src/app/downloads/page.js`
3. Generate checksums for security:

```bash
# Windows
certUtil -hashfile "nitminer-1.0.0.exe" SHA256

# macOS
shasum -a 256 "nitminer-1.0.0.dmg"
```

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
- [IPC Best Practices](https://www.electronjs.org/docs/api/ipc-main)

## 🆘 Troubleshooting

### "Cannot find module 'electron'"
```bash
npm install electron --save-dev
```

### Blank window on startup
- Check if Next.js is running on port 3000
- Verify `startUrl` in `public/electron.js` is correct
- Check browser console for errors

### Build fails on macOS
```bash
# Install build dependencies
xcode-select --install
npm install electron-builder --global
```

### File associations not working
Update `electron-builder.json` with proper file extensions and MIME types.

## 📧 Support

For issues or questions about the Electron implementation:
1. Check GitHub issues
2. Open a new issue with detailed description
3. Contact: support@nitminer.com

---

**Last Updated**: February 2026
**Version**: 1.0.0
