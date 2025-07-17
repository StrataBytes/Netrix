import { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { useModpack } from '../hooks/useModpack';
import { Icons } from '../components/icons';

export default function Settings() {
  const { 
    modpackInfo, 
    getRepositoryUrl, 
    setRepositoryUrl, 
    getModsPath, 
    setModsPath, 
    error 
  } = useModpack();
  
  const [repositoryUrl, setRepositoryUrlState] = useState('');
  const [modsPath, setModsPathState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  //load current settings on startup
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [currentRepoUrl, currentModsPath] = await Promise.all([
        getRepositoryUrl(),
        getModsPath()
      ]);
      
      setRepositoryUrlState(currentRepoUrl || '');
      setModsPathState(currentModsPath || '');
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRepository = async () => {
    if (!repositoryUrl.trim()) {
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage('');
    
    try {
      const success = await setRepositoryUrl(repositoryUrl.trim());
      if (success) {
        setSuccessMessage('Repository URL updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save repository URL:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveModsPath = async () => {
    if (!modsPath.trim()) {
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage('');
    
    try {
      const success = await setModsPath(modsPath.trim());
      if (success) {
        setSuccessMessage('Mods path updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save mods path:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Netrix Settings</h1>
        <p className="page-subtitle">
          Configure your modpack manager preferences
        </p>
      </div>
      
      {error && (
        <div className="error-notification">
          <p className="error-message">Error: {error}</p>
        </div>
      )}
      
      {successMessage && (
        <div style={{ 
          padding: '1rem',
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <p style={{ color: 'var(--success)', fontSize: '0.875rem', margin: 0 }}>
            done: {successMessage}
          </p>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🔗 Repository Configuration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
            Configure the GitHub repository where your modpack is stored
          </p>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'var(--text-primary)', 
                fontWeight: '500' 
              }}>
                Repository URL
              </label>
              <input
                type="text"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrlState(e.target.value)}
                placeholder="https://github.com/username/modpack-repo"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
                disabled={isLoading}
              />
              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.75rem', 
                margin: '0.5rem 0 0 0' 
              }}>
                The GitHub repository URL where your modpack files are stored. Must contain a <code>mods/</code> folder and <code>version.json</code> file.
              </p>
            </div>
            
            <div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSaveRepository}
                disabled={isSaving || isLoading || !repositoryUrl.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Repository URL'}
              </Button>
            </div>
            
            <div style={{ 
              padding: '1rem',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px',
              marginTop: '0.5rem'
            }}>
              <p style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.info size={16} />
                Current repository: {modpackInfo?.repositoryUrl || 'Not configured'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.folder size={20} />
            Local Storage
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
            Configure where mods are stored on your local machine
          </p>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'var(--text-primary)', 
                fontWeight: '500' 
              }}>
                Mods Directory Path
              </label>
              <input
                type="text"
                value={modsPath}
                onChange={(e) => setModsPathState(e.target.value)}
                placeholder="Path to your Minecraft mods folder"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
                disabled={isLoading}
              />
              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.75rem', 
                margin: '0.5rem 0 0 0' 
              }}>
                The local directory where mod files will be downloaded and stored. This should be your Minecraft mods folder.
              </p>
            </div>
            
            <div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSaveModsPath}
                disabled={isSaving || isLoading || !modsPath.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Mods Path'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.settings size={20} />
            Mod Management
          </h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Auto-update mods</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Automatically sync mods when GitHub repository is updated</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Check for updates on startup</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Verify mod versions when Netrix starts</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Show update notifications</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Display notifications when mod updates are available</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
