
## Overview
The version management system has been made to stop redundancy between the config file and local version.json file.

## File Structure

### Config File (`netrix-config.json`)
**Location**: `%APPDATA%\Roaming\netrix\netrix-config.json`
**Purpose**: Store application settings and user preferences

**Contains**:
- `repositoryUrl`: GitHub repository URL (configurable via Settings UI)
- `modsPath`: Path to Minecraft mods directory
- `lastUpdateCheck`: Timestamp of last update check

**Example**:
```json
{
  "repositoryUrl": "https://github.com/Huckleboard/CrashCraftModpack",
  "modsPath": "C:\\Users\\User\\AppData\\Roaming\\.minecraft\\mods",
  "lastUpdateCheck": "2025-07-15T19:28:25.447Z"
}
```

**Note**: The `modsPath` will be automatically set based on your operating system:
- **Windows**: `%APPDATA%\.minecraft\mods`

(MacOS and Linux are not yet supported)
- **macOS**: `~/Library/Application Support/minecraft/mods`
- **Linux**: `~/.minecraft/mods`

### Local Version File (`version.json`)
**Location**: `%APPDATA%\Roaming\.minecraft\version.json`
**Purpose**: Track currently installed modpack version and metadata

**Contains**:
- `version`: Current installed version
- `name`: Modpack name
- `description`: Modpack description
- `minecraftVersion`: Target Minecraft version

**Example**:
```json
{
  "version": "0.0.1",
  "name": "CrashCraft Modpack",
  "description": "Official CrashCraft Modpack",
  "minecraftVersion": "1.20.1"
}
```
