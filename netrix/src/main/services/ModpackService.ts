import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';
import { app } from 'electron';

export interface ModpackVersion {
  version: string;
  url: string;
  changelog?: string;
  date: string;
}

export interface ModpackInfo {
  name: string;
  description: string;
  currentVersion: string;
  latestVersion: string;
  minecraftVersion: string;
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  localModsPath: string;
  repositoryUrl: string;
  lastUpdateCheck?: string;
}

export interface DownloadProgress {
  fileName: string;
  downloaded: number;
  total: number;
  percentage: number;
}

interface GitHubVersionData {
  version: string;
  name: string;
  description: string;
  minecraftVersion: string;
}

interface GitHubFileData {
  name: string;
  type: string;
  download_url: string;
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
  requiredVersion: string;
  patcherInfo?: PatcherInfo;
}

export interface EOLInfo {
  isEOL: boolean;
  contentIfTrue: string;
}

export class ModpackService {
  private readonly config = {
    // Default repository URL - can be overridden in user config
    defaultRepositoryUrl: 'https://github.com/Huckleboard/CrashCraftModpack', // CrashCraft official modpack
    githubApiBase: 'https://api.github.com',
    githubRawBase: 'https://raw.githubusercontent.com',
    localConfigFile: 'netrix-config.json',
    versionFileName: 'version.json', // This file should exist in your GitHub repo
    modsDirectory: 'mods' // Directory name in your GitHub repo where mods are stored
  };

  private readonly userDataPath: string;
  private readonly configPath: string;
  private readonly defaultModsPath: string;

  constructor() {
    this.userDataPath = app.getPath('userData');
    this.configPath = path.join(this.userDataPath, this.config.localConfigFile);
    // Use the standard Minecraft mods directory based on platform
    this.defaultModsPath = path.join(this.getMinecraftDirectory(), 'mods');
  }

  async initialize(): Promise<void> {
    try {
      // Create user data directory if it doesn't exist
      await fs.ensureDir(this.userDataPath);
      
      // Create default mods directory if it doesn't exist
      await fs.ensureDir(this.defaultModsPath);
      
      // Create or update config file to ensure correct mods path
      let config = {};
      if (await fs.pathExists(this.configPath)) {
        try {
          const fileContent = await fs.readFile(this.configPath, 'utf-8');
          if (fileContent.trim()) {
            config = JSON.parse(fileContent);
          }
        } catch (parseError) {
          console.error('Failed to parse config file during initialization, recreating:', parseError);
          // Delete corrupted file and continue with default config
          await fs.remove(this.configPath);
        }
      }
      
      // Always update the modsPath to use the correct Minecraft directory
      const updatedConfig = {
        modsPath: this.defaultModsPath, // Always use the correct Minecraft path
        lastUpdateCheck: new Date().toISOString(),
        repositoryUrl: this.config.defaultRepositoryUrl,
        ...config // Preserve any existing config, but modsPath will be overwritten
      };
      
      await this.writeConfigSafely(updatedConfig);
    } catch (error) {
      console.error('Failed to initialize ModpackService:', error);
      throw error;
    }
  }

  async getModpackInfo(): Promise<ModpackInfo> {
    try {
      const config = await this.getLocalConfig();
      const latestVersionData = await this.getLatestVersionData();
      
      // Get current version from local version.json file instead of config
      const currentVersion = await this.getCurrentLocalVersion();
      const localVersionData = await this.getLocalVersionData();
      
      const latestVersion = latestVersionData.version;
      const isUpdateAvailable = this.isNewerVersion(latestVersion, currentVersion);
      
      return {
        name: localVersionData?.name || latestVersionData.name || 'Unknown Modpack',
        description: localVersionData?.description || latestVersionData.description || 'Modpack for the server',
        currentVersion: currentVersion,
        latestVersion: latestVersion,
        minecraftVersion: localVersionData?.minecraftVersion || latestVersionData.minecraftVersion || 'Unknown',
        isInstalled: currentVersion !== '0.0.0',
        isUpdateAvailable: isUpdateAvailable,
        localModsPath: config.modsPath || this.defaultModsPath,
        repositoryUrl: config.repositoryUrl || this.config.defaultRepositoryUrl,
        lastUpdateCheck: config.lastUpdateCheck
      };
    } catch (error) {
      console.error('Failed to get modpack info:', error);
      throw error;
    }
  }

  async checkForUpdates(): Promise<boolean> {
    try {
      const config = await this.getLocalConfig();
      const latestVersion = await this.getLatestVersion();
      
      // Update last check time
      config.lastUpdateCheck = new Date().toISOString();
      await this.writeConfigSafely(config);
      
      // Compare with local version.json file
      const currentVersion = await this.getCurrentLocalVersion();
      return this.isNewerVersion(latestVersion.version, currentVersion);
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }

  async downloadAndInstallModpack(
    progressCallback?: (progress: DownloadProgress) => void,
    bypassVersionCheck = false
  ): Promise<void> {
    try {
      // Check version compatibility first (unless bypassed)
      if (!bypassVersionCheck) {
        const versionCheck = await this.checkVersionCompatibility();
        if (!versionCheck.isCompatible) {
          const errorMessage = versionCheck.patcherInfo?.message || 
            `Required version ${versionCheck.requiredVersion} is not installed. Please install it first.`;
          throw new Error(errorMessage);
        }
      }
      
      const config = await this.getLocalConfig();
      const latestVersionData = await this.getLatestVersionData();
      const modsPath = config.modsPath || this.defaultModsPath;
      
      // Clear existing mods
      await this.clearModsDirectory(modsPath);
      
      // Get list of mod files from GitHub
      const modFiles = await this.getModFilesList();
      
      // Download each mod file
      for (let i = 0; i < modFiles.length; i++) {
        const file = modFiles[i];
        const progress: DownloadProgress = {
          fileName: file.name,
          downloaded: i,
          total: modFiles.length,
          percentage: Math.round((i / modFiles.length) * 100)
        };
        
        if (progressCallback) {
          progressCallback(progress);
        }
        
        await this.downloadModFile(file, modsPath);
      }
      
      // Final progress update
      if (progressCallback) {
        progressCallback({
          fileName: 'Complete',
          downloaded: modFiles.length,
          total: modFiles.length,
          percentage: 100
        });
      }
      
      // Write local version.json file to .minecraft folder
      await this.writeLocalVersionData(latestVersionData);
      
      // Update config with last check time only (no version tracking)
      config.lastUpdateCheck = new Date().toISOString();
      await this.writeConfigSafely(config);
      
    } catch (error) {
      console.error('Failed to download and install modpack:', error);
      throw error;
    }
  }

  async uninstallModpack(): Promise<void> {
    try {
      const config = await this.getLocalConfig();
      const modsPath = config.modsPath || this.defaultModsPath;
      
      await this.clearModsDirectory(modsPath);
      
      // Remove local version.json file
      const versionPath = this.getLocalVersionPath();
      if (await fs.pathExists(versionPath)) {
        await fs.remove(versionPath);
        console.log('Removed local version.json file');
      }
      
      // No need to reset version in config anymore - it's handled by version.json
      await this.writeConfigSafely(config);
      
    } catch (error) {
      console.error('Failed to uninstall modpack:', error);
      throw error;
    }
  }

  async getModsDirectoryPath(): Promise<string> {
    const config = await this.getLocalConfig();
    return config.modsPath || this.defaultModsPath;
  }

  async setModsDirectoryPath(newPath: string): Promise<void> {
    try {
      // Ensure the directory exists
      await fs.ensureDir(newPath);
      
      // Update config
      const config = await this.getLocalConfig();
      config.modsPath = newPath;
      await this.writeConfigSafely(config);
      
    } catch (error) {
      console.error('Failed to set mods directory path:', error);
      throw error;
    }
  }

  async setRepositoryUrl(repositoryUrl: string): Promise<void> {
    try {
      // Validate the repository URL format
      this.parseRepositoryUrl(repositoryUrl);
      
      // Update config
      const config = await this.getLocalConfig();
      config.repositoryUrl = repositoryUrl;
      await this.writeConfigSafely(config);
      
    } catch (error) {
      console.error('Failed to set repository URL:', error);
      throw error;
    }
  }

  async getRepositoryUrl(): Promise<string> {
    try {
      const config = await this.getLocalConfig();
      return config.repositoryUrl || this.config.defaultRepositoryUrl;
    } catch (error) {
      console.error('Failed to get repository URL:', error);
      return this.config.defaultRepositoryUrl;
    }
  }


  private async getLocalConfig(): Promise<any> {
    try {
      let config = {};
      
      // Check if config file exists and is readable
      if (await fs.pathExists(this.configPath)) {
        try {
          const fileContent = await fs.readFile(this.configPath, 'utf-8');
          if (fileContent.trim()) {
            config = JSON.parse(fileContent);
          }
        } catch (parseError) {
          console.error('Failed to parse config file, recreating:', parseError);
          // Delete corrupted file and continue with default config
          await fs.remove(this.configPath);
        }
      }
      
      // Always ensure the config uses the correct Minecraft mods path
      config = {
        modsPath: this.defaultModsPath, // Always use correct Minecraft path
        lastUpdateCheck: new Date().toISOString(),
        repositoryUrl: this.config.defaultRepositoryUrl,
        ...config // Preserve existing values, but modsPath will be overwritten
      };
      
      // Always write back the corrected config atomically
      await this.writeConfigSafely(config);
      
      return config;
    } catch (error) {
      console.error('Failed to read local config:', error);
      // Return default config if all else fails
      const defaultConfig = {
        modsPath: this.defaultModsPath,
        lastUpdateCheck: new Date().toISOString(),
        repositoryUrl: this.config.defaultRepositoryUrl
      };
      
      // Try to write the default config
      try {
        await this.writeConfigSafely(defaultConfig);
      } catch (writeError) {
        console.error('Failed to write default config:', writeError);
      }
      
      return defaultConfig;
    }
  }

  private async writeConfigSafely(config: any): Promise<void> {
    const tempPath = this.configPath + '.tmp';
    try {
      // Write to temporary file first
      await fs.writeJson(tempPath, config, { spaces: 2 });
      
      // On Windows, we need to remove the destination file first
      if (await fs.pathExists(this.configPath)) {
        await fs.remove(this.configPath);
      }
      
      // Move the temp file to the actual config file
      await fs.move(tempPath, this.configPath);
    } catch (error) {
      // Clean up temp file if it exists
      if (await fs.pathExists(tempPath)) {
        await fs.remove(tempPath);
      }
      throw error;
    }
  }

  private async getLatestVersion(): Promise<ModpackVersion> {
    try {
      const { owner, repo } = await this.getRepositoryInfo();
      // Look for version.json in the mods folder
      const url = `${this.config.githubRawBase}/${owner}/${repo}/main/${this.config.modsDirectory}/${this.config.versionFileName}`;
      const response = await axios.get(url, { timeout: 10000 });
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch version info: ${response.statusText}`);
      }
      
      const versionData = response.data as GitHubVersionData;
      return {
        version: versionData.version || '1.0.0',
        url: '', // Not needed for your use case
        date: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get latest version:', error);
      // Return a default version if fetching fails
      return {
        version: '1.0.0',
        url: '',
        date: new Date().toISOString()
      };
    }
  }

  private async getLatestVersionData(): Promise<GitHubVersionData> {
    try {
      const { owner, repo } = await this.getRepositoryInfo();
      // Look for version.json in the mods folder
      const url = `${this.config.githubRawBase}/${owner}/${repo}/main/${this.config.modsDirectory}/${this.config.versionFileName}`;
      
      console.log(`Fetching version data from: ${url}`);
      const response = await axios.get(url, { timeout: 10000 });
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch version info: ${response.status} ${response.statusText}`);
      }
      
      const versionData = response.data as GitHubVersionData;
      
      // Validate the response data
      if (!versionData.version) {
        throw new Error('Invalid version data: missing version field');
      }
      
      console.log('Successfully fetched version data:', versionData);
      return {
        version: versionData.version,
        name: versionData.name || 'Unknown Modpack',
        description: versionData.description || 'Modpack for the server',
        minecraftVersion: versionData.minecraftVersion || 'Unknown'
      };
    } catch (error: any) {
      console.error('Failed to get latest version data:', error);
      
      // Check if it's a network error or repository not found
      if (error.response?.status === 404) {
        throw new Error('Repository or version file not found. Please check the repository URL and ensure version.json exists in the mods folder.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied to repository. Please check if the repository is public.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error: Unable to connect to GitHub. Please check your internet connection.');
      }
      
      // Re-throw the original error for other cases
      throw error;
    }
  }

  private async getModFilesList(): Promise<any[]> {
    try {
      const { owner, repo } = await this.getRepositoryInfo();
      
      // First try to get a mods manifest file if it exists
      try {
        const manifestUrl = `${this.config.githubRawBase}/${owner}/${repo}/main/${this.config.modsDirectory}/manifest.json`;
        console.log(`Trying to fetch mods manifest from: ${manifestUrl}`);
        const manifestResponse = await axios.get(manifestUrl);
        
        if (manifestResponse.status === 200 && manifestResponse.data.mods) {
          console.log(`Found mods manifest with ${manifestResponse.data.mods.length} mods`);
          return manifestResponse.data.mods.map((mod: any) => ({
            name: mod.name || mod.filename,
            download_url: `${this.config.githubRawBase}/${owner}/${repo}/main/${this.config.modsDirectory}/${mod.name || mod.filename}`,
            type: 'file'
          }));
        }
      } catch (manifestError) {
        console.log('No manifest file found, falling back to API method');
      }
      
      // Fallback to GitHub API method
      const url = `${this.config.githubApiBase}/repos/${owner}/${repo}/contents/${this.config.modsDirectory}`;
      console.log(`Fetching mod files list from: ${url}`);
      const response = await axios.get(url);
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch mod files list: ${response.status} ${response.statusText}`);
      }
      
      const files = response.data as GitHubFileData[];
      const jarFiles = files.filter((file: GitHubFileData) => file.type === 'file' && file.name.endsWith('.jar'));
      
      console.log(`Found ${jarFiles.length} mod files`);
      return jarFiles;
    } catch (error: any) {
      console.error('Failed to get mod files list:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Mods directory not found in repository. Please check the repository structure.');
      } else if (error.response?.status === 403) {
        throw new Error('GitHub API rate limited - please wait a little bit and try again.');
      }
      
      throw error;
    }
  }

  private async downloadModFile(file: any, modsPath: string): Promise<void> {
    try {
      const response = await axios.get(file.download_url, { responseType: 'arraybuffer' });
      
      if (response.status !== 200) {
        throw new Error(`Failed to download ${file.name}: ${response.statusText}`);
      }
      
      const buffer = Buffer.from(response.data);
      const filePath = path.join(modsPath, file.name);
      
      await fs.writeFile(filePath, buffer);
    } catch (error) {
      console.error(`Failed to download mod file ${file.name}:`, error);
      throw error;
    }
  }

  private async clearModsDirectory(modsPath: string): Promise<void> {
    try {
      if (await fs.pathExists(modsPath)) {
        const files = await fs.readdir(modsPath);
        for (const file of files) {
          if (file.endsWith('.jar')) {
            await fs.remove(path.join(modsPath, file));
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear mods directory:', error);
      throw error;
    }
  }

  private isNewerVersion(latest: string, current: string): boolean {
    // Handle edge cases
    if (latest === current) return false;
    if (current === '0.0.0') return true;
    if (latest === '0.0.0') return false;
    
    // Clean versions (remove 'v' prefix if present)
    const cleanLatest = latest.replace(/^v/, '');
    const cleanCurrent = current.replace(/^v/, '');
    
    // Split into parts and convert to numbers
    const latestParts = cleanLatest.split('.').map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? 0 : num;
    });
    const currentParts = cleanCurrent.split('.').map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? 0 : num;
    });
    
    // Compare each part
    const maxLength = Math.max(latestParts.length, currentParts.length);
    for (let i = 0; i < maxLength; i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    
    return false;
  }

  private parseRepositoryUrl(repositoryUrl: string): { owner: string; repo: string } {
    try {
      // Handle both https://github.com/owner/repo and https://github.com/owner/repo.git formats
      const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/);
      
      if (!match) {
        throw new Error('Invalid GitHub repository URL format');
      }
      
      return {
        owner: match[1],
        repo: match[2]
      };
    } catch (error) {
      console.error('Failed to parse repository URL:', error);
      throw new Error('Invalid repository URL format. Expected: https://github.com/owner/repo');
    }
  }

  private async getRepositoryInfo(): Promise<{ owner: string; repo: string }> {
    const config = await this.getLocalConfig();
    const repositoryUrl = config.repositoryUrl || this.config.defaultRepositoryUrl;
    return this.parseRepositoryUrl(repositoryUrl);
  }

  private getLocalVersionPath(): string {
    return path.join(this.getMinecraftDirectory(), this.config.versionFileName);
  }

  private async getLocalVersionData(): Promise<GitHubVersionData | null> {
    try {
      const versionPath = this.getLocalVersionPath();
      
      if (!(await fs.pathExists(versionPath))) {
        return null;
      }
      
      const fileContent = await fs.readFile(versionPath, 'utf-8');
      const versionData = JSON.parse(fileContent) as GitHubVersionData;
      
      console.log('Local version data:', versionData);
      return versionData;
    } catch (error) {
      console.error('Failed to read local version data:', error);
      return null;
    }
  }

  private async writeLocalVersionData(versionData: GitHubVersionData): Promise<void> {
    try {
      const versionPath = this.getLocalVersionPath();
      const minecraftPath = path.dirname(versionPath);
      
      // Ensure the .minecraft directory exists
      await fs.ensureDir(minecraftPath);
      
      await fs.writeFile(versionPath, JSON.stringify(versionData, null, 2));
      console.log('Local version data written to:', versionPath);
    } catch (error) {
      console.error('Failed to write local version data:', error);
      throw error;
    }
  }

  private async getCurrentLocalVersion(): Promise<string> {
    const localVersionData = await this.getLocalVersionData();
    return localVersionData?.version || '0.0.0';
  }

  private async checkMinecraftVersion(requiredVersion: string): Promise<boolean> {
    try {
      const minecraftPath = path.join(this.getMinecraftDirectory(), 'versions');
      
      console.log(`[Version Check] Checking for required version: ${requiredVersion}`);
      console.log(`[Version Check] Checking path: ${minecraftPath}`);
      
      // Check if the versions directory exists
      if (!fs.existsSync(minecraftPath)) {
        console.log('[Version Check] Versions directory does not exist');
        return false;
      }
      
      // Check if the specific version folder exists
      const versionPath = path.join(minecraftPath, requiredVersion);
      console.log(`[Version Check] Version path: ${versionPath}`);
      
      const exists = fs.existsSync(versionPath);
      console.log(`[Version Check] Version exists: ${exists}`);
      
      return exists;
    } catch (error) {
      console.error('[Version Check] Error checking Minecraft version:', error);
      return false;
    }
  }

  private async fetchPatcherInfo(): Promise<PatcherInfo | null> {
    try {
      const repositoryUrl = await this.getRepositoryUrl();
      const repoUrl = repositoryUrl.replace('https://github.com/', '');
      const patcherUrl = `${this.config.githubApiBase}/repos/${repoUrl}/contents/patcher/patchinfo.json`;
      
      console.log('Fetching patcher info from:', patcherUrl);
      
      const response = await axios.get(patcherUrl);
      
      console.log('GitHub API response:', response.data);
      
      if (response.data && response.data.download_url) {
        console.log('Downloading patcher info from:', response.data.download_url);
        const patcherResponse = await axios.get(response.data.download_url);
        console.log('Patcher info data:', patcherResponse.data);
        return patcherResponse.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching patcher info:', error);
      return null;
    }
  }

  async checkVersionCompatibility(): Promise<VersionCheckResult> {
    try {
      console.log('Starting version compatibility check...');
      
      // First, get the patcher info to check the target version
      const patcherInfo = await this.fetchPatcherInfo();
      
      console.log('Patcher info result:', patcherInfo);
      
      if (!patcherInfo || !patcherInfo.target) {
        console.log('No patcher info found, falling back to minecraftVersion');
        // If no patcher info or target, fall back to minecraftVersion from version.json
        const versionData = await this.getLatestVersionData();
        const requiredVersion = versionData.minecraftVersion;
        const isCompatible = await this.checkMinecraftVersion(requiredVersion);
        
        console.log('Fallback compatibility check:', { isCompatible, requiredVersion });
        
        return {
          isCompatible,
          requiredVersion
        };
      }
      
      console.log('Checking target version:', patcherInfo.target);
      
      // Check if the target version is installed
      const isCompatible = await this.checkMinecraftVersion(patcherInfo.target);
      
      console.log('Version compatibility result:', { isCompatible, target: patcherInfo.target });
      
      if (!isCompatible) {
        console.log('Version incompatible, returning patcher info');
        return {
          isCompatible: false,
          requiredVersion: patcherInfo.target,
          patcherInfo: patcherInfo
        };
      }
      
      console.log('Version compatible');
      return {
        isCompatible: true,
        requiredVersion: patcherInfo.target
      };
    } catch (error) {
      console.error('Error checking version compatibility:', error);
      throw error;
    }
  }

  async checkEOL(): Promise<EOLInfo> {
    try {
      const repositoryUrl = await this.getRepositoryUrl();
      const apiUrl = repositoryUrl.replace('github.com', 'api.github.com/repos');
      
      // Try to fetch from GitHub API first
      const response = await axios.get(`${apiUrl}/contents/eol/eol.json`);
      
      if (response.data && response.data.content) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        const eolInfo: EOLInfo = JSON.parse(content);
        console.log('EOL check result:', eolInfo);
        return eolInfo;
      }
      
      // If GitHub API fails, try direct download
      const downloadUrl = `https://raw.githubusercontent.com/${repositoryUrl.split('/').slice(-2).join('/')}/main/eol/eol.json`;
      const directResponse = await axios.get(downloadUrl);
      
      console.log('EOL check result:', directResponse.data);
      return directResponse.data;
    } catch (error) {
      console.error('Failed to check EOL status:', error);
      // Return safe defaults if check fails
      return {
        isEOL: false,
        contentIfTrue: "This version of Netrix is no longer supported. Please update to the latest version."
      };
    }
  }

  private getMinecraftDirectory(): string {
    const userHome = app.getPath('home');
    
    if (process.platform === 'win32') {
      return path.join(userHome, 'AppData', 'Roaming', '.minecraft');
    } else if (process.platform === 'darwin') {
      return path.join(userHome, 'Library', 'Application Support', 'minecraft');
    } else {
      // Linux and other platforms
      return path.join(userHome, '.minecraft');
    }
  }
}