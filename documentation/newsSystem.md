# GitHub-Based News System Implementation

## Overview
GitHub-based news system that mirrors the modpack management approach. The news system fetches news articles from a JSON file stored in the GitHub repository and provides fallback functionality when the remote file is unavailable.

## Architecture

### NewsService (`src/main/services/NewsService.ts`)
- Fetch and cache news data from GitHub repository
- **Features**:
  - Fetches news from `{repository}/news/news.json`
  - Local caching with fallback support
  - Automatic repository URL syncing with modpack settings
  - Error handling with meaningful messages

### API Integration
- **IPC Handlers**: `news:getNews`, `news:getLatestNews`, `news:getNewsItem`, `news:clearCache`
- **Preload Script**: Exposes news API to renderer process
- **Types**: Full TypeScript support with interfaces

### Frontend Components
- **News Page**: Full news management with refresh and cache controls
- **Home Widget**: Displays latest 3 news items
- **useNews Hook**: React hook for news data management

## File Structure

### Required Repository Files
```
repo/
├── mods/
│   ├── version.jso        # Modpack version info
│   └── *.jar               # Mod files
└── news/
    └── news.json        # News data file
```

### News Data Format (`news/news.json`)
```json
{
  "items": [
    {
      "id": "1",
      "title": "News Title",
      "date": "2025-01-15",
      "excerpt": "Brief description...",
      "content": "Full article content...",
      "author": "Author Name",
      "tags": ["tag1", "tag2"]
    }
  ],
  "lastUpdated": "2025-01-15T12:00:00Z"
}
```

## Features

### 1. Automatic Sync
- News service automatically uses same repository URL as modpack
- When repository URL changes, news service updates automatically

### 2. Caching System
- Local cache stored in `%APPDATA%\Roaming\netrix\news-cache.json`
- Automatic fallback to cache when GitHub is unreachable
- Cache can be cleared manually via UI

### 3. Error Handling
- Fallback to default news when repository has no news file
- Network error handling with informative messages
- Repository access error detection

### 4. User Interface
- **News Page**: Full news listing with refresh controls
- **Home Dashboard**: Latest news widget
- **Real-time Updates**: Refresh button for immediate updates

