import { useState, useEffect } from 'react';

type Page = 'home' | 'mods' | 'news' | 'status' | 'settings';

interface TitleBarProps {
  currentPage: Page;
}

const getPageTitle = (page: Page): string => {
  switch (page) {
    case 'home': return 'Dashboard';
    case 'mods': return 'Modpack Manager';
    case 'news': return 'News';
    case 'status': return 'Status';
    case 'settings': return 'Settings';
    default: return 'Dashboard';
  }
};

export default function TitleBar({ currentPage }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check initial maximize state
    if (window.api?.window) {
      window.api.window.isMaximized().then(setIsMaximized);
    }
  }, []);

  const handleMinimize = async () => {
    if (window.api?.window) {
      await window.api.window.minimize();
    }
  };

  const handleMaximize = async () => {
    if (window.api?.window) {
      await window.api.window.maximize();
      // Update the state after maximizing/unmaximizing
      const newState = await window.api.window.isMaximized();
      setIsMaximized(newState);
    }
  };

  const handleClose = async () => {
    if (window.api?.window) {
      await window.api.window.close();
    }
  };

  return (
    <div className="title-bar">
      <span className="title-text">Netrix | {getPageTitle(currentPage)}</span>
      <div className="window-controls">
        <button 
          onClick={handleMinimize}
          className="window-control-btn minimize-btn"
          title="Minimize"
        >
          _
        </button>
        <button 
          onClick={handleMaximize}
          className="window-control-btn maximize-btn"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? '❐' : '□'}
        </button>
        <button 
          onClick={handleClose}
          className="window-control-btn close-btn"
          title="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
