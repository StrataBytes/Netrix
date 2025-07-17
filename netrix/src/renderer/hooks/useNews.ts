import { useState, useEffect, useCallback } from 'react';
import type { NewsResponse, NewsArticle } from '../types/api';

export const useNews = () => {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load news on mount
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await window.api.news.getNews();
      setNewsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLatestNews = useCallback(async (limit: number = 5): Promise<NewsArticle[]> => {
    try {
      setError(null);
      return await window.api.news.getLatestNews(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load latest news');
      return [];
    }
  }, []);

  const getNewsArticle = useCallback(async (id: number): Promise<NewsArticle | null> => {
    try {
      setError(null);
      return await window.api.news.getNewsArticle(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news article');
      return null;
    }
  }, []);

  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const success = await window.api.news.clearCache();
      if (success) {
        // Reload news after clearing cache
        await loadNews();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear news cache');
      return false;
    }
  }, [loadNews]);

  const refreshNews = useCallback(async () => {
    await loadNews();
  }, [loadNews]);

  return {
    newsData,
    isLoading,
    error,
    loadNews,
    getLatestNews,
    getNewsArticle,
    clearCache,
    refreshNews
  };
};
