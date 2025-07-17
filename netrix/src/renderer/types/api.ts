// Type definitions for the window API exposed by preload script

export interface DownloadProgress {
  fileName: string;
  downloaded: number;
  total: number;
  percentage: number;
}

export interface ModpackInfo {
  name: string;
  description: string;
  currentVersion: string;
  latestVersion: string;
  isUpdateAvailable: boolean;
  localModsPath: string;
  repositoryUrl: string;
  lastUpdateCheck?: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface NewsResponse {
  version: number;
  articles: NewsArticle[];
}

export interface NewsCache {
  version: number;
  articleIds: number[];
}

export interface PatcherInfo {
  version: string;
  type: string;
  target: string;
  installerUrl: string;
  message: string;
}

export interface VersionCheckResult {
  isCompatible: boolean;
  patcherInfo?: PatcherInfo;
  target: string;
  requiredVersion?: string;
}

export interface EOLInfo {
  isEOL: boolean;
  contentIfTrue: string;
}

export interface ModpackAPI {
  getInfo: () => Promise<ModpackInfo>;
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

export interface NewsAPI {
  getNews: () => Promise<NewsResponse>;
  getLatestNews: (limit?: number) => Promise<NewsArticle[]>;
  getNewsArticle: (id: number) => Promise<NewsArticle | null>;
  clearCache: () => Promise<boolean>;
}

export interface WindowAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
}

export interface ShellAPI {
  openExternal: (url: string) => Promise<void>;
}

export interface StatusAnnouncement {
  id: string;
  title: string;
  message: string;
  type?: 'maintenance' | 'outage' | 'degraded' | 'resolved' | 'info';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  services?: string[];
  startTime?: string;
  endTime?: string;
  active?: boolean;
}

export interface StatusResponse {
  status: StatusAnnouncement[];
  updated?: number;
}

export interface StatusCache {
  data: StatusResponse;
  timestamp: number;
}

export interface StatusAPI {
  getStatus: () => Promise<{ success: boolean; data?: StatusResponse; error?: string }>;
  getActiveAnnouncements: () => Promise<StatusAnnouncement[]>;
  getAnnouncementsByType: (type: StatusAnnouncement['type']) => Promise<StatusAnnouncement[]>;
  getAnnouncementsBySeverity: (severity: StatusAnnouncement['severity']) => Promise<StatusAnnouncement[]>;
  hasActiveCriticalIssues: () => Promise<boolean>;
  clearStatusCache: () => Promise<boolean>;
}

declare global {
  interface Window {
    api: {
      modpack: ModpackAPI;
      news: NewsAPI;
      status: StatusAPI;
      window: WindowAPI;
      shell: ShellAPI;
    };
  }
}

export {};
