import { contextBridge, ipcRenderer } from 'electron';
import type { VersionCheckResult, EOLInfo, DownloadProgress } from '../renderer/types/api';

// Define the API interface
export interface ModpackAPI {
  getInfo: () => Promise<any>;
  checkUpdates: () => Promise<boolean>;
  downloadAndInstall: (bypassVersionCheck?: boolean) => Promise<boolean>;
  uninstall: () => Promise<boolean>;
  getModsPath: () => Promise<string>;
  setModsPath: (path: string) => Promise<boolean>;
  getRepositoryUrl: () => Promise<string>;
  setRepositoryUrl: (url: string) => Promise<boolean>;
  openModsDirectory: () => Promise<boolean>;
  checkVersionCompatibility: () => Promise<VersionCheckResult>;
  checkEOL: () => Promise<EOLInfo>;
  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => void;
  removeDownloadProgressListener: (callback: (progress: DownloadProgress) => void) => void;
}

contextBridge.exposeInMainWorld('api', {
  modpack: {
    getInfo: () => ipcRenderer.invoke('modpack:getInfo'),
    checkUpdates: () => ipcRenderer.invoke('modpack:checkUpdates'),
    downloadAndInstall: (bypassVersionCheck?: boolean) => ipcRenderer.invoke('modpack:downloadAndInstall', bypassVersionCheck),
    uninstall: () => ipcRenderer.invoke('modpack:uninstall'),
    getModsPath: () => ipcRenderer.invoke('modpack:getModsPath'),
    setModsPath: (path: string) => ipcRenderer.invoke('modpack:setModsPath', path),
    getRepositoryUrl: () => ipcRenderer.invoke('modpack:getRepositoryUrl'),
    setRepositoryUrl: (url: string) => ipcRenderer.invoke('modpack:setRepositoryUrl', url),
    openModsDirectory: () => ipcRenderer.invoke('modpack:openModsDirectory'),
    checkVersionCompatibility: () => ipcRenderer.invoke('modpack:checkVersionCompatibility'),
    checkEOL: () => ipcRenderer.invoke('modpack:checkEOL'),
    onDownloadProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on('modpack:downloadProgress', (_, progress) => callback(progress));
    },
    removeDownloadProgressListener: (callback: (progress: any) => void) => {
      ipcRenderer.removeListener('modpack:downloadProgress', callback);
    }
  } as ModpackAPI,
  news: {
    getNews: () => ipcRenderer.invoke('news:getNews'),
    getLatestNews: (limit?: number) => ipcRenderer.invoke('news:getLatestNews', limit),
    getNewsArticle: (id: number) => ipcRenderer.invoke('news:getNewsArticle', id),
    clearCache: () => ipcRenderer.invoke('news:clearCache')
  },
  status: {
    getStatus: () => ipcRenderer.invoke('status:getStatus'),
    getActiveAnnouncements: () => ipcRenderer.invoke('status:getActiveAnnouncements'),
    getAnnouncementsByType: (type: string) => ipcRenderer.invoke('status:getAnnouncementsByType', type),
    getAnnouncementsBySeverity: (severity: string) => ipcRenderer.invoke('status:getAnnouncementsBySeverity', severity),
    hasActiveCriticalIssues: () => ipcRenderer.invoke('status:hasActiveCriticalIssues'),
    clearStatusCache: () => ipcRenderer.invoke('status:clearCache')
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  }
});
