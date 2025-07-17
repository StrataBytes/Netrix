import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import { ModpackService } from './services/ModpackService';
import { NewsService } from './services/NewsService';
import { StatusService } from './services/StatusService';

let modpackService: ModpackService;
let newsService: NewsService;
let statusService: StatusService;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 740,
    frame: false,
    titleBarStyle: 'hidden',
    title: 'Netrix',
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false, 
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://raw.githubusercontent.com https://api.github.com;"
        ]
      }
    });
  });
}

app.whenReady().then(async () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.stratabytes.netrix');
  }
  
  app.setName('Netrix');
  
  modpackService = new ModpackService();
  await modpackService.initialize();
  
  const repositoryUrl = await modpackService.getRepositoryUrl();
  newsService = new NewsService(repositoryUrl);
  
  statusService = new StatusService(repositoryUrl);
  
  setupIpcHandlers();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function setupIpcHandlers() {
  ipcMain.handle('modpack:getInfo', async () => {
    try {
      return await modpackService.getModpackInfo();
    } catch (error) {
      console.error('Failed to get modpack info:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:checkUpdates', async () => {
    try {
      return await modpackService.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:downloadAndInstall', async (event, bypassVersionCheck = false) => {
    try {
      await modpackService.downloadAndInstallModpack((progress) => {
        event.sender.send('modpack:downloadProgress', progress);
      }, bypassVersionCheck);
      return true;
    } catch (error) {
      console.error('Failed to download and install modpack:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:uninstall', async () => {
    try {
      await modpackService.uninstallModpack();
      return true;
    } catch (error) {
      console.error('Failed to uninstall modpack:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:getModsPath', async () => {
    try {
      return await modpackService.getModsDirectoryPath();
    } catch (error) {
      console.error('Failed to get mods directory path:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:setModsPath', async (_, newPath: string) => {
    try {
      await modpackService.setModsDirectoryPath(newPath);
      return true;
    } catch (error) {
      console.error('Failed to set mods directory path:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:openModsDirectory', async () => {
    try {
      const { shell } = require('electron');
      const modsPath = await modpackService.getModsDirectoryPath();
      shell.openPath(modsPath);
      return true;
    } catch (error) {
      console.error('Failed to open mods directory:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:getRepositoryUrl', async () => {
    try {
      return await modpackService.getRepositoryUrl();
    } catch (error) {
      console.error('Failed to get repository URL:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:setRepositoryUrl', async (_, repositoryUrl: string) => {
    try {
      await modpackService.setRepositoryUrl(repositoryUrl);
      newsService.setRepositoryUrl(repositoryUrl);
      statusService.setRepositoryUrl(repositoryUrl);
      return true;
    } catch (error) {
      console.error('Failed to set repository URL:', error);
      throw error;
    }
  });

  ipcMain.handle('news:getNews', async () => {
    try {
      return await newsService.getNews();
    } catch (error) {
      console.error('Failed to get news:', error);
      throw error;
    }
  });

  ipcMain.handle('news:getLatestNews', async (_, limit: number = 5) => {
    try {
      return await newsService.getLatestNews(limit);
    } catch (error) {
      console.error('Failed to get latest news:', error);
      throw error;
    }
  });

  ipcMain.handle('news:getNewsArticle', async (_, id: number) => {
    try {
      return await newsService.getNewsArticle(id);
    } catch (error) {
      console.error('Failed to get news article:', error);
      throw error;
    }
  });

  ipcMain.handle('news:clearCache', async () => {
    try {
      return await newsService.clearCache();
    } catch (error) {
      console.error('Failed to clear news cache:', error);
      throw error;
    }
  });

  ipcMain.handle('status:getStatus', async () => {
    try {
      const statusData = await statusService.getStatus();
      return { success: true, data: statusData };
    } catch (error) {
      console.error('Failed to get status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('status:getActiveAnnouncements', async () => {
    try {
      return await statusService.getActiveAnnouncements();
    } catch (error) {
      console.error('Failed to get active announcements:', error);
      throw error;
    }
  });

  ipcMain.handle('status:getAnnouncementsByType', async (_, type: string) => {
    try {
      return await statusService.getAnnouncementsByType(type as any);
    } catch (error) {
      console.error('Failed to get announcements by type:', error);
      throw error;
    }
  });

  ipcMain.handle('status:getAnnouncementsBySeverity', async (_, severity: string) => {
    try {
      return await statusService.getAnnouncementsBySeverity(severity as any);
    } catch (error) {
      console.error('Failed to get announcements by severity:', error);
      throw error;
    }
  });

  ipcMain.handle('status:hasActiveCriticalIssues', async () => {
    try {
      return await statusService.hasActiveCriticalIssues();
    } catch (error) {
      console.error('Failed to check for critical issues:', error);
      throw error;
    }
  });

  ipcMain.handle('status:clearCache', async () => {
    try {
      await statusService.clearCache();
      return true;
    } catch (error) {
      console.error('Failed to clear status cache:', error);
      throw error;
    }
  });

  ipcMain.handle('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.handle('window:close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    const win = BrowserWindow.getFocusedWindow();
    return win ? win.isMaximized() : false;
  });

  ipcMain.handle('shell:openExternal', async (_event, url: string) => {
    try {
      const allowedProtocols = ['https:', 'http:'];
      let parsedUrl: URL;
      
      try {
        parsedUrl = new URL(url);
      } catch (error) {
        throw new Error('Invalid URL format');
      }
      
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        throw new Error(`Protocol ${parsedUrl.protocol} is not allowed`);
      }
      
      await shell.openExternal(url);
    } catch (error) {
      console.error('Failed to open external URL:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:checkVersionCompatibility', async () => {
    try {
      return await modpackService.checkVersionCompatibility();
    } catch (error) {
      console.error('Failed to check version compatibility:', error);
      throw error;
    }
  });

  ipcMain.handle('modpack:checkEOL', async () => {
    try {
      return await modpackService.checkEOL();
    } catch (error) {
      console.error('Failed to check EOL status:', error);
      throw error;
    }
  });
}
