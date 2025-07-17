import { useState } from 'react';
import Button from '../components/ui/Button';
import { useNews } from '../hooks/useNews';
import { Icons } from '../components/icons';
import type { NewsArticle } from '../types/api';

export default function News() {
  const { newsData, isLoading, error, refreshNews, clearCache } = useNews();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNews();
    setIsRefreshing(false);
  };

  const handleClearCache = async () => {
    await clearCache();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return {
          backgroundColor: '#8b5cf6', // Purple
          color: 'white'
        };
      case 'medium':
        return {
          backgroundColor: '#3b82f6', // Blue
          color: 'white'
        };
      case 'low':
        return {
          backgroundColor: '#10b981', // Green
          color: 'white'
        };
      default:
        return {
          backgroundColor: '#6b7280',
          color: 'white'
        };
    }
  };

  const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Priority';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">News & Updates</h1>
        <p className="page-subtitle">
          Stay updated with the latest developments and server news
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.bell size={20} />
            Server Announcements
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearCache}
              disabled={isLoading}
            >
              Clear Cache
            </Button>
          </div>
        </div>
        <div className="card-content">
          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'var(--error-bg)', 
              color: 'var(--error-text)', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {isLoading ? (
            <p>Loading news...</p>
          ) : newsData && newsData.articles.length > 0 ? (
            <div>
              {newsData.articles.map((article: NewsArticle) => (
                <div key={article.id} style={{ 
                  marginBottom: '1.5rem', 
                  paddingBottom: '1.5rem', 
                  borderBottom: article.id !== newsData.articles[newsData.articles.length - 1].id ? '1px solid var(--border-color)' : 'none'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span 
                      style={{
                        ...getPriorityColor(article.priority),
                        padding: '1px 4px',
                        borderRadius: '2px',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        textTransform: 'uppercase',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                      }}
                    >
                      {getPriorityLabel(article.priority)}
                    </span>
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {article.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {formatDate(article.date)}
                    {article.author && ` • by ${article.author}`}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {article.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No news available at this time. Check back later for updates!</p>
          )}
        </div>
      </div>
    </div>
  );
}
