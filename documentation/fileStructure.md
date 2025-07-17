# Netrix - File Structure & Logic

## Overview
Multi-process Electron app with React renderer, built using Vite for development and bundling.

## File Structure
```
netrix/
├── src/
│   ├── main/
│   │   └── main.ts          # Main Electron process (Node.js)
│   ├── preload/
│   │   └── preload.ts       # Preload script (secure bridge)
│   └── renderer/
│       ├── index.html       # HTML entry point
│       ├── main.tsx         # React entry point
│       ├── App.tsx          # Main React component
│       └── assets/          # Static assets
├── dist/                    # Built output
│   ├── main/main.cjs        # Built main process
│   ├── preload/preload.cjs  # Built preload script
│   └── renderer/            # Built React app
├── public/                  # Public assets (vite.svg)
├── vite.config.ts          # Renderer build config
├── vite.main.config.ts     # Main process build config
├── vite.preload.config.ts  # Preload script build config
└── package.json            # Entry: dist/main/main.cjs
```

## Build Process
1. **Main Process**: TypeScript → CommonJS (Node.js compatible)
2. **Preload Script**: TypeScript → CommonJS (secure context bridge)
3. **Renderer**: React/TypeScript → ES modules (browser compatible)

## Development Flow
```bash
npm run dev
├── Build main process (vite.main.config.ts)
├── Build preload script (vite.preload.config.ts)
├── Start Vite dev server (renderer hot reload)
└── Start Electron (loads from localhost:5173)
```

## Key Logic
- **Main Process**: Creates windows, handles system events
- **Preload Script**: Secure API bridge between main and renderer
- **Renderer**: React UI running in Chromium context
- **Security**: `nodeIntegration: false`, `contextIsolation: true`
- **Development**: Loads from Vite dev server with hot reload
- **Production**: Loads from built static files

## Scripts
- `npm run dev` - Development with hot reload
- `npm run build` - Production build
- `npm start` - Run built app
