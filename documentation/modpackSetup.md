# Modpack Setup Guide

## Default Configuration

**Netrix comes pre-configured with the CrashCraft official modpack repository:**
- **Repository**: `https://github.com/Huckleboard/CrashCraftModpack`
- **Default Setup**: No configuration needed for CrashCraft server members
- **Custom Setup**: Can be overridden in Settings for other modpacks

## For Other Modpack Repositories

If we need to use a different modpack repository for some reason, this is the setup:

```
your-modpack-repo/
├── mods/                 # Directory containing all .jar mod files
│   ├── mod1.jar
│   ├── mod2.jar
│   └── ...
├── version.json          # Version information file
```

## Configuration Steps

### 1. Create GitHub Repository

1. Create a new GitHub repository, must be public
2. Create a `mods/` folder in the repository
3. Upload all the `.jar` mod files to the `mods/` folder
4. Create a `version.json` file in the root of the repository

### 2. Configure Repository URL in the App

1. Open Netrix
2. Go to **Settings** page
3. In the **Repository Configuration** section, enter the GitHub repository URL
4. Click **Save Repository URL**

**Example Repository URL:**
```
https://github.com/YourUsername/your-modpack-repo
```

### 3. Create version.json

Create a `version.json` file in the root of your GitHub repository:

```json
{
  "version": "1.0.0",
  "date": "2025-01-15T12:00:00Z",
  "changelog": "Initial modpack release with essential mods",
  "url": "https://github.com/YourUsername/your-modpack-repo",
  "description": "Latest modpack version with bug fixes and new features"
}
```

### 4. Upload Mod Files

1. Create a `mods/` directory in your repository
2. Upload all your `.jar` mod files to this directory
3. The app will automatically detect and download all `.jar` files

### 5. Version Management

To release a new version:
1. Update your mod files in the `mods/` directory (add/remove/update mods)
2. Update the `version.json` file with the new version number
3. Commit and push changes to GitHub
4. The app will detect the update automatically


## How It Works

1. **Version Checking**: The app fetches `version.json` from your repository and compares it with the locally installed version
2. **Mod Download**: When updating, the app lists all `.jar` files in the `mods/` directory via GitHub's API
3. **Local Installation**: Downloaded mods are saved to the user's local mods directory
4. **Clean Install**: Before installing new mods, the app removes all existing `.jar` files from the local directory

## Local Data Storage

The app stores configuration in:
- **Windows**: `%APPDATA%/netrix/netrix-config.json`

(MacOS and Linux are not yet supported)
- **macOS**: `~/Library/Application Support/netrix/netrix-config.json`
- **Linux**: `~/.config/netrix/netrix-config.json`

Default mods directory:
- Same as above but in a `mods/` subdirectory

