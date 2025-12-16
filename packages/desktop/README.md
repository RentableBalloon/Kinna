# Kinna Desktop App

Desktop application wrapper for Kinna using Electron.

## ⚠️ Important Note

**The desktop app CANNOT run in GitHub Codespaces** because:
- Codespaces is a headless Linux environment without a display server (X11/Wayland)
- Electron requires a graphical environment to run
- No DISPLAY environment variable is available

You'll see errors like:
- `command not found` 
- `cannot open display`
- `DISPLAY is not set`

## Running Locally

To run the desktop app on your local machine:

### Prerequisites
- Node.js 18+ installed
- The frontend dev server running on port 3000

### Steps

1. **Start the Frontend Server** (in one terminal):
```bash
cd packages/frontend
npm run dev
```

2. **Start the Desktop App** (in another terminal):
```bash
cd packages/desktop
npm run dev
```

This will automatically:
- Wait for http://localhost:3000 to be ready
- Launch the Electron window
- Open with DevTools in development mode

## Building for Production

Build standalone executables:

```bash
# Build for your current platform
npm run build

# Build for specific platforms
npm run build:mac    # macOS (.dmg, .app)
npm run build:win    # Windows (.exe)
npm run build:linux  # Linux (.AppImage, .deb)
```

Built applications will be in `packages/desktop/dist/`

## Features

- **Native Desktop Experience**: Full desktop app with native menus
- **Midas Dark Theme**: Matches Kinna's gold & dark aesthetic
- **Optimized Window**: 1400x900 default, 1000x700 minimum
- **Custom Menus**: File, Edit, View, Help with keyboard shortcuts
- **Dev Tools**: F12 or View > Toggle Developer Tools
- **About Dialog**: Help > About Kinna

## Architecture

The desktop app is a thin Electron wrapper that:
1. Creates a BrowserWindow with custom settings
2. Loads React frontend from localhost:3000 (dev) or bundled files (production)
3. Provides native OS integration (menus, dialogs, etc.)

## Why Use Desktop vs Web?

- **Native Feel**: Feels like a real desktop application
- **Offline Support**: Can cache content for offline reading (future feature)
- **System Integration**: Native notifications, file associations
- **Privacy**: No browser cookies/tracking
- **Performance**: Direct access without browser overhead
