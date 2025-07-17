import axios from 'axios';

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

export class StatusService {
  private readonly config = {
    statusFileName: 'status.json',
    statusDirectory: 'status'
  };

  private repositoryUrl: string;
  private memoryCache: StatusCache | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(repositoryUrl: string = 'https://github.com/Huckleboard/CrashCraftModpack') {
    this.repositoryUrl = repositoryUrl;
  }


  setRepositoryUrl(url: string): void {
    this.repositoryUrl = url;
  }


  private parseRepositoryUrl(): { owner: string; repo: string } {
    const match = this.repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return { owner: match[1], repo: match[2] };
  }


  async fetchStatusFromGitHub(): Promise<StatusResponse> {
    try {
      const { owner, repo } = this.parseRepositoryUrl();
      const githubRawBase = 'https://raw.githubusercontent.com';
      const url = `${githubRawBase}/${owner}/${repo}/main/${this.config.statusDirectory}/${this.config.statusFileName}`;
      
      console.log(`Fetching status data from: ${url}`);
      
      const response = await axios.get<StatusResponse>(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'NetrixLauncher/1.0'
        }
      });

      if (!response.data || !Array.isArray(response.data.status)) {
        throw new Error('Invalid status data format');
      }

      this.saveToCache(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching status from GitHub:', error);
      
      const cachedData = this.getFromCache();
      if (cachedData) {
        console.log('Using cached status data');
        return cachedData;
      }
      
      return {
        status: [],
        updated: 1
      };
    }
  }


  private saveToCache(data: StatusResponse): void {
    try {
      this.memoryCache = {
        data,
        timestamp: Date.now()
      };
      console.log('Status data cached in memory');
    } catch (error) {
      console.error('Error saving status cache:', error);
    }
  }


  private getFromCache(): StatusResponse | null {
    try {
      if (this.memoryCache) {
        const now = Date.now();
        const cacheAge = now - this.memoryCache.timestamp;
        
        // Return cached data if it's still fresh
        if (cacheAge < this.CACHE_DURATION) {
          return this.memoryCache.data;
        } else {
          this.memoryCache = null;
        }
      }
    } catch (error) {
      console.error('Error reading status cache:', error);
    }
    return null;
  }


  async getStatus(): Promise<StatusResponse> {
    try {
      return await this.fetchStatusFromGitHub();
    } catch (error) {
      console.error('Error in getStatus:', error);
      
      const cachedData = this.getFromCache();
      if (cachedData) {
        return cachedData;
      }
      
      return {
        status: [],
        updated: 1
      };
    }
  }


  async getActiveAnnouncements(): Promise<StatusAnnouncement[]> {
    const status = await this.getStatus();
    
    return status.status.filter((announcement: StatusAnnouncement) => {
      if (announcement.active !== undefined) {
        return announcement.active;
      }
      
      return true;
    });
  }


  async getAnnouncementsByType(type: StatusAnnouncement['type']): Promise<StatusAnnouncement[]> {
    const status = await this.getStatus();
    return status.status.filter((announcement: StatusAnnouncement) => announcement.type === type);
  }


  async getAnnouncementsBySeverity(severity: StatusAnnouncement['severity']): Promise<StatusAnnouncement[]> {
    const status = await this.getStatus();
    return status.status.filter((announcement: StatusAnnouncement) => announcement.severity === severity);
  }


  async hasActiveCriticalIssues(): Promise<boolean> {
    const activeAnnouncements = await this.getActiveAnnouncements();
    return activeAnnouncements.some(announcement => 
      announcement.severity === 'critical' || announcement.severity === 'high'
    );
  }


  async clearCache(): Promise<void> {
    try {
      this.memoryCache = null;
      console.log('Status cache cleared');
    } catch (error) {
      console.error('Error clearing status cache:', error);
    }
  }
}

export default StatusService;
