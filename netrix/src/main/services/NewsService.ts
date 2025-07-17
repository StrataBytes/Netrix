import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';
import { app } from 'electron';
import type { NewsResponse, NewsArticle, NewsCache } from '../../renderer/types/api';

export class NewsService {
  private readonly config = {
    newsFileName: 'news.json',
    newsDirectory: 'news'
  };

  private readonly userDataPath: string;
  private readonly localCachePath: string;
  private repositoryUrl: string;

  constructor(repositoryUrl: string = 'https://github.com/Huckleboard/CrashCraftModpack') {
    this.repositoryUrl = repositoryUrl;
    this.userDataPath = app.getPath('userData');
    this.localCachePath = path.join(this.userDataPath, 'news-cache.json');
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

  async fetchNewsFromGitHub(): Promise<NewsResponse> {
    try {
      const { owner, repo } = this.parseRepositoryUrl();
      const githubRawBase = 'https://raw.githubusercontent.com';
      const url = `${githubRawBase}/${owner}/${repo}/main/${this.config.newsDirectory}/${this.config.newsFileName}`;
      
      console.log(`Fetching news data from: ${url}`);
      const response = await axios.get(url);
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch news data: ${response.status} ${response.statusText}`);
      }
      
      const newsData = response.data as NewsResponse;
      
      // Validate the response data
      if (!newsData.articles || !Array.isArray(newsData.articles)) {
        throw new Error('Invalid news data: missing articles array');
      }
      
      if (typeof newsData.version !== 'number') {
        throw new Error('Invalid news data: missing version number');
      }
      
      // Sort articles by ID (higher = newer)
      newsData.articles.sort((a, b) => b.id - a.id);
      
      console.log(`Successfully fetched ${newsData.articles.length} news articles (version ${newsData.version})`);
      return newsData;
    } catch (error: any) {
      console.error('Failed to fetch news from GitHub:', error);
      
      // Check if it's a network error or repository not found
      if (error.response?.status === 404) {
        throw new Error('News file not found in repository. Please check if news.json exists in the news folder.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied to repository. Please check if the repository is public.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error: Unable to connect to GitHub. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  private async getCachedNews(): Promise<NewsCache | null> {
    try {
      if (await fs.pathExists(this.localCachePath)) {
        const fileContent = await fs.readFile(this.localCachePath, 'utf-8');
        return JSON.parse(fileContent) as NewsCache;
      }
      return null;
    } catch (error) {
      console.error('Failed to read cached news:', error);
      return null;
    }
  }

  private async saveCachedNews(newsData: NewsResponse): Promise<void> {
    try {
      const cache: NewsCache = {
        version: newsData.version,
        articleIds: newsData.articles.map(article => article.id)
      };
      
      await fs.ensureDir(this.userDataPath);
      await fs.writeFile(this.localCachePath, JSON.stringify(cache, null, 2));
      console.log(`News cache saved successfully (version ${cache.version}, ${cache.articleIds.length} articles)`);
    } catch (error) {
      console.error('Failed to cache news data:', error);
    }
  }

  async getNews(): Promise<NewsResponse> {
    try {
      // Always fetch from GitHub for latest data
      const newsData = await this.fetchNewsFromGitHub();
      
      // Check if we need to update cache
      const cachedNews = await this.getCachedNews();
      if (!cachedNews || cachedNews.version < newsData.version) {
        await this.saveCachedNews(newsData);
      }
      
      return newsData;
    } catch (error) {
      console.error('Failed to fetch news from GitHub:', error);
      
      // Return default news if fetch fails
      return {
        version: 0,
        articles: [
          {
            id: 1,
            title: 'CrashCraft Network Revival',
            excerpt: 'The CrashCraft network is back online with a brand new modded Minecraft server experience!',
            content: 'The CrashCraft network is back online with a brand new modded Minecraft server experience! Join us for an exciting journey through our custom modpack with enhanced gameplay, community events, and regular updates.',
            author: 'CrashCraft Team',
            date: '2025-01-15',
            priority: 'high'
          },
          {
            id: 2,
            title: 'Netrix 3.0 Launch',
            excerpt: 'New mod manager with automatic GitHub repository syncing and seamless updates.',
            content: 'New mod manager with automatic GitHub repository syncing and seamless updates. Experience hassle-free mod management with our latest Netrix client featuring automated updates, repository synchronization, and improved user interface.',
            author: 'Development Team',
            date: '2025-01-10',
            priority: 'medium'
          }
        ]
      };
    }
  }

  async getLatestNews(limit: number = 5): Promise<NewsArticle[]> {
    const newsData = await this.getNews();
    return newsData.articles.slice(0, limit);
  }

  async getNewsArticle(id: number): Promise<NewsArticle | null> {
    const newsData = await this.getNews();
    return newsData.articles.find(article => article.id === id) || null;
  }

  async clearCache(): Promise<boolean> {
    try {
      if (await fs.pathExists(this.localCachePath)) {
        await fs.remove(this.localCachePath);
        console.log('News cache cleared');
      }
      return true;
    } catch (error) {
      console.error('Failed to clear news cache:', error);
      return false;
    }
  }
}
