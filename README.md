# Netrix

**Netrix** is a lightweight custom launcher and mod manager designed specifically for the CrashCraft network and its upcoming modded server experience. Built to keep players informed, updated and connected—all from a single interface.

---

## Features

- **Modpack Management**  
  Automatically download, install and update the latest CrashCraft modpacks with ease.

- **News & Announcements**  
  Integrated news feed to keep players up to date with server events, maintenance and releases.

- **Status Functionality**  
  View live server availability—including the weekend-only modded world.

---

## Getting Started

> Netrix is currently in early access for the CrashCraft community.

1. Download the latest installer from [Releases](#).
2. Run the application and follow the setup instructions.
3. Launch, download, and play!

---

## Tech Used

- [Electron](https://www.electronjs.org/) — Cross-platform desktop framework  
- [Vite](https://vitejs.dev/) — Frontend tooling  
- [TypeScript](https://www.typescriptlang.org/)  
- [Node.js](https://nodejs.org/)  
- JSON for modpack and status config  
- GitHub for dynamic content delivery

---

## Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build steps
npm run build:main
npm run build:preload
npx vite build

# Package app
npx electron-builder
```

---

## Distribution

Final builds are published under [Releases](#) or available via the official CrashCraft website.

---

## Status & Roadmap

Netrix is actively maintained and developed alongside the CrashCraft server relaunch. Feature requests and feedback are always welcome.

### Goals
- Launching Minecraft directly via Netrix
- Remote client-side updating
- Launcher theming and user customization

---

## Usage & Disclaimer

Netrix is provided **as-is**, without warranty of any kind.  
I, **StrataBytes** and/or **Ridgeline**, am not responsible for any damages resulting from the use of this software.

Netrix is intended solely for use with the **CrashCraft Network** and, as of now, has no plans to support third-party servers.

---

## Transparency First

All source code for Netrix is available in this repository, including the logic for fetching modpack definitions, server status, news content and other services.

Dynamic content (such as modpacks, server status and news updates) is **not hidden behind an API** - it is pulled directly from a public GitHub repository which has its own documentation:

[CrashCraft Dynamic Content Repository](https://github.com/Huckleboard/CrashCraftModpack/tree/main)

This means you can always see exactly what Netrix is loading - no surprises, no secrets.


## License

**GPLv3** © StrataBytes, Ridgeline  
CrashCraft is a project of **Ridgeline**.

---

## Related Projects

- [Netrix Dynamic Content Repo](https://github.com/Huckleboard/CrashCraftModpack/tree/main)
