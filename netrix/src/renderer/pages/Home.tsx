import { useState, useEffect, useRef } from 'react';
import Button from '../components/ui/Button';
import { useModpack } from '../hooks/useModpack';
import { useNews } from '../hooks/useNews';
import { useStatus } from '../hooks/useStatus';
import type { NewsArticle } from '../types/api';
import { Icons } from '../components/icons';
import VersionCompatibilityModal from '../components/ui/VersionCompatibilityModal';
import DownloadInstructionsModal from '../components/ui/DownloadInstructionsModal';
import EOLModal from '../components/ui/EOLModal';

type Page = 'home' | 'mods' | 'news' | 'status' | 'settings';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const startupCheckDone = useRef(false);
  
  // Use the modpack hook for real functionality
  const {
    modpackInfo,
    isCheckingUpdates,
    isDownloading,
    downloadProgress,
    error,
    versionModal,
    downloadInstructionsModal,
    eolModal,
    checkForUpdates,
    downloadAndInstall,
    handleDownloadPatcher,
    handleContinueWithout,
    handleCancelModal,
    handleDownloadInstructionsOkay,
    handleEOLModalClose
  } = useModpack();

  // Use the news hook for real news functionality
  const { getLatestNews } = useNews();
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);

  // Use the status hook for real status functionality
  const { getActiveAnnouncements, hasActiveCriticalIssues } = useStatus();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    
    // Set greeting based on time
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning!');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon!');
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good evening!');
    } else {
      setGreeting('Hope you are having a good night!');
    }
  }, [currentTime]);

  // Removed automatic update check on startup to prevent spam
  // User can manually check for updates using the button

  // Check for updates on startup - controlled single execution
  useEffect(() => {
    const performStartupCheck = async () => {
      if (!startupCheckDone.current && modpackInfo) {
        startupCheckDone.current = true;
        
        try {
          // Check localStorage for startup notification setting
          const shouldCheckOnStartup = localStorage.getItem('checkOnStartup');
          
          if (shouldCheckOnStartup === null || shouldCheckOnStartup === 'true') {
            // Perform the check and show notification based on result
            await checkForUpdates(true);
          }
        } catch (error) {
          console.error('Startup update check failed:', error);
        }
      }
    };
    
    // Only run when modpackInfo is available and we haven't checked yet
    if (modpackInfo && !startupCheckDone.current) {
      performStartupCheck();
    }
  }, [modpackInfo, checkForUpdates]);

  // Load latest news on component mount
  useEffect(() => {
    const loadLatestNews = async () => {
      try {
        const news = await getLatestNews(2); // Get only 2 latest news items
        setLatestNews(news);
      } catch (error) {
        console.error('Failed to load latest news:', error);
      }
    };
    
    loadLatestNews();
  }, [getLatestNews]);

  const getPriorityDotColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return '#8b5cf6'; // Purple
      case 'medium':
        return '#3b82f6'; // Blue
      case 'low':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  const handleCheckUpdates = async () => {
    await checkForUpdates(true);
  };

  const handleInstallUpdate = async () => {
    await downloadAndInstall();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatLastCheck = (lastCheckString?: string) => {
    if (!lastCheckString) return 'Never';
    
    const lastCheck = new Date(lastCheckString);
    const now = new Date();
    const diffMs = now.getTime() - lastCheck.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return lastCheck.toLocaleDateString();
    }
  };

  // Get overall status for the status widget
  const getOverallStatus = () => {
    const activeAnnouncements = getActiveAnnouncements();
    
    if (activeAnnouncements.some(a => a.type === 'outage')) {
      return { status: 'Major Outage', color: 'var(--error)', icon: '⚠️' };
    }
    if (activeAnnouncements.some(a => a.type === 'degraded')) {
      return { status: 'Degraded Performance', color: 'var(--warning)', icon: '⚠️' };
    }
    if (activeAnnouncements.some(a => a.type === 'maintenance')) {
      return { status: 'Maintenance', color: 'var(--warning)', icon: '🔧' };
    }
    if (hasActiveCriticalIssues()) {
      return { status: 'Issues Detected', color: 'var(--error)', icon: '❌' };
    }
    
    return { status: 'All Systems Operational', color: 'var(--success)', icon: '✅' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="home-container">
      {/* Animated Gradient Background */}
      <div className="gradient-background">
        <div className="gradient-overlay"></div>
      </div>

      {/* 6 Content */}
      <div className="dashboard-layout">
        {/* Top Bar with Clock */}
        <div className="dashboard-top-bar">
          <div className="welcome-section">
            <h1 className="dashboard-title">Netrix Dashboard</h1>
            <p className="dashboard-subtitle">{greeting}</p>
          </div>
          <div className="clock-section">
            <div className="clock-time">{formatTime(currentTime)}</div>
            <div className="clock-date">{formatDate(currentTime)}</div>
          </div>
        </div>

        {/* Widget Grid */}
        <div className="dashboard-grid">
          {/* Overall Status Widget */}
          <div className="widget widget-status" onClick={() => onNavigate('status')} style={{ cursor: 'pointer' }}>
            <h3 className="widget-title">Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <div className="status-indicator" style={{ backgroundColor: overallStatus.color }}></div>
                <span style={{ color: overallStatus.color, fontWeight: '600' }}>
                  {overallStatus.icon} {overallStatus.status}
                </span>
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-muted)', 
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                Click for details
              </div>
            </div>
          </div>

          {/* Modpack Status Widget */}
          <div className="widget widget-mods">
            <div className="widget-header">
              <h3 className="widget-title">Modpack Status</h3>
              <button
                className={`refresh-button ${isCheckingUpdates ? 'spinning' : ''}`}
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdates || isDownloading}
                title="Check for updates"
              >
                {isCheckingUpdates ? '⟳' : '↻'}
              </button>
            </div>
            <div className="mod-status">
              <div className="mod-status-item">
                <span>Installed Version</span>
                <span className="mod-version">{modpackInfo?.currentVersion || 'Unknown'}</span>
              </div>
              <div className="mod-status-item">
                <span>Status</span>
                <span className={
                  isDownloading ? "mod-status-downloading" :
                  modpackInfo?.isUpdateAvailable ? "mod-status-update-available" : "mod-status-up-to-date"
                }>
                  {isDownloading ? 'Downloading...' :
                   modpackInfo?.isUpdateAvailable ? 'Update Available' : 'Up to date'}
                </span>
              </div>
              <div className="mod-status-item">
                <span>Last Check</span>
                <span>{isCheckingUpdates ? 'Checking...' : formatLastCheck(modpackInfo?.lastUpdateCheck)}</span>
              </div>
            </div>
            
            {/* Progress Bars */}
            {isDownloading && downloadProgress && (
              <div className="progress-section">
                <div className="progress-label">
                  Downloading {downloadProgress.fileName}... {Math.round(downloadProgress.percentage)}%
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${downloadProgress.percentage}%` }}></div>
                </div>
              </div>
            )}
            
            {modpackInfo?.isUpdateAvailable && !isDownloading && (
              <div className="update-notification">
                <p className="update-message">
                  Update available: {modpackInfo.latestVersion}
                </p>
                <Button variant="primary" size="sm" onClick={handleInstallUpdate}>
                  Install Update
                </Button>
              </div>
            )}
            
            {error && (
              <div className="error-notification">
                <p className="error-message">
                  Error: {error}
                </p>
              </div>
            )}
          </div>

          {/* News Widget */}
          <div className="widget widget-news">
            <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.news size={18} />
              News & Updates
            </h3>
            {latestNews.length === 0 ? (
              <div className="news-loading">Loading latest news...</div>
            ) : (
              latestNews.map((newsItem) => (
                <div 
                  key={newsItem.id} 
                  className="news-item clickable"
                  onClick={() => onNavigate('news')}
                  title="Click to read more"
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div 
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: getPriorityDotColor(newsItem.priority),
                        flexShrink: 0
                      }}
                    />
                    <div className="news-title">{newsItem.title}</div>
                  </div>
                  <div className="news-date">{new Date(newsItem.date).toLocaleDateString()}</div>
                  <div className="news-excerpt">{newsItem.excerpt}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Version Compatibility Modal */}
      {versionModal.patcherInfo && (
        <VersionCompatibilityModal
          isOpen={versionModal.isOpen}
          patcherInfo={versionModal.patcherInfo}
          onDownload={handleDownloadPatcher}
          onContinueWithout={handleContinueWithout}
          onCancel={handleCancelModal}
        />
      )}

      {/* Download Instructions Modal */}
      {downloadInstructionsModal.patcherInfo && (
        <DownloadInstructionsModal
          isOpen={downloadInstructionsModal.isOpen}
          patcherInfo={downloadInstructionsModal.patcherInfo}
          onOkay={handleDownloadInstructionsOkay}
        />
      )}

      {/* EOL Modal */}
      <EOLModal
        isOpen={eolModal.isOpen}
        content={eolModal.content}
        onClose={handleEOLModalClose}
      />
    </div>
  );
}
