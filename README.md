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

- Vite — Frontend tooling  
- TypeScript
- Node.js
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

---
## Screenshots

> Main Dashboard
<img width="1620" height="886" alt="main" src="https://github.com/user-attachments/assets/8e0d0473-7a6a-4496-ae89-1f53c4231ea7" />

> News tab
<img width="1605" height="878" alt="news" src="https://github.com/user-attachments/assets/dc48a883-12d1-41b2-9173-11e41d9992cc" />

> Status tab
<img width="1614" height="877" alt="status" src="https://github.com/user-attachments/assets/fd660920-4563-4645-b90d-6bd544318e4d" />

> Modpack Manager
<img width="1618" height="983" alt="modpack" src="https://github.com/user-attachments/assets/1c609b14-f4c8-43fb-bf30-c788d1a2f4a9" />



## License

**GPLv3** © StrataBytes, Ridgeline  
CrashCraft is a project of **Ridgeline**.

---

## Related Projects

- [Netrix Dynamic Content Repo](https://github.com/Huckleboard/CrashCraftModpack/tree/main)
