import Button from '../components/ui/Button';
import { useModpack } from '../hooks/useModpack';
import { Icons } from '../components/icons';
import VersionCompatibilityModal from '../components/ui/VersionCompatibilityModal';
import DownloadInstructionsModal from '../components/ui/DownloadInstructionsModal';
import EOLModal from '../components/ui/EOLModal';

export default function Mods() {
  const {
    modpackInfo,
    isLoading,
    isCheckingUpdates,
    isDownloading,
    downloadProgress,
    error,
    versionModal,
    downloadInstructionsModal,
    eolModal,
    checkForUpdates,
    downloadAndInstall,
    uninstall,
    openModsDirectory,
    handleDownloadPatcher,
    handleContinueWithout,
    handleCancelModal,
    handleDownloadInstructionsOkay,
    handleEOLModalClose
  } = useModpack();

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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Modpack Manager</h1>
        <p className="page-subtitle">
          Download, Manage, Update and Remove mods for the server - manually or automatically
        </p>
      </div>
      
      {error && (
        <div className="error-notification" style={{ marginBottom: '1rem' }}>
          <p className="error-message">Error: {error}</p>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Modpack Status</h2>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => checkForUpdates()}
            disabled={isCheckingUpdates || isDownloading}
          >
            {isCheckingUpdates ? 'Checking...' : 'Check for Updates'}
          </Button>
        </div>
        <div className="card-content">
          {isLoading ? (
            <div>Loading modpack information...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Modpack Name</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {modpackInfo?.name || 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Installed Version</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>
                  {modpackInfo?.currentVersion || 'Not installed'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Latest Version</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {modpackInfo?.latestVersion || 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Status</span>
                <span style={{ 
                  color: modpackInfo?.isUpdateAvailable ? 'var(--warning)' : 'var(--success)', 
                  fontWeight: '500' 
                }}>
                  {isDownloading ? 'Downloading...' : 
                   modpackInfo?.isUpdateAvailable ? 'Update Available' : 'Up to date'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Local Path</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {modpackInfo?.localModsPath || 'Not set'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Last Check</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {isCheckingUpdates ? 'Checking...' : formatLastCheck(modpackInfo?.lastUpdateCheck)}
                </span>
              </div>
              
              {/* Download Progress */}
              {isDownloading && downloadProgress && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Downloading {downloadProgress.fileName}</span>
                    <span>{Math.round(downloadProgress.percentage)}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${downloadProgress.percentage}%`, 
                      height: '100%', 
                      background: 'var(--accent-primary)',
                      transition: 'width 0.2s ease'
                    }}></div>
                  </div>
                </div>
              )}
              
              {/* Update Available Notification */}
              {modpackInfo?.isUpdateAvailable && !isDownloading && (
                <div style={{ 
                  padding: '1rem',
                  background: 'rgba(255, 170, 0, 0.1)',
                  border: '1px solid rgba(255, 170, 0, 0.3)',
                  borderRadius: '8px',
                  marginTop: '0.5rem'
                }}>
                  <p style={{ color: 'var(--warning)', fontSize: '0.875rem', margin: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icons.alert size={16} />
                    Update available: {modpackInfo.latestVersion}
                  </p>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => downloadAndInstall()}
                    disabled={isDownloading}
                  >
                    Install Update
                  </Button>
                </div>
              )}
              
              {/* Up to Date Notification */}
              {!modpackInfo?.isUpdateAvailable && !isDownloading && modpackInfo?.currentVersion !== '0.0.0' && (
                <div style={{ 
                  padding: '1rem',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '8px',
                  marginTop: '0.5rem'
                }}>
                  <p style={{ color: 'var(--success)', fontSize: '0.875rem', margin: 0 }}>
                    ✓ Modpack is installed and up to date
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Repository Info</h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span>Repository URL</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {modpackInfo?.repositoryUrl || 'Not configured'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Update Monitoring</span>
            <span style={{ color: 'var(--success)' }}>Active</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Actions</h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => downloadAndInstall()}
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download/Reinstall Modpack'}
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={uninstall}
              disabled={isDownloading}
            >
              Uninstall Modpack
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={openModsDirectory}
            >
              Open Local Mods Folder
            </Button>
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
