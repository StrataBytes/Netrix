import { useState, useEffect, useCallback } from 'react';
import type { ModpackInfo, DownloadProgress, PatcherInfo } from '../types/api';
import { useNotification } from '../components/NotificationManager';

export const useModpack = () => {
  const [modpackInfo, setModpackInfo] = useState<ModpackInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [versionModal, setVersionModal] = useState<{
    isOpen: boolean;
    patcherInfo: PatcherInfo | null;
    onContinue: (() => void) | null;
  }>({
    isOpen: false,
    patcherInfo: null,
    onContinue: null
  });
  
  const [downloadInstructionsModal, setDownloadInstructionsModal] = useState<{
    isOpen: boolean;
    patcherInfo: PatcherInfo | null;
  }>({
    isOpen: false,
    patcherInfo: null
  });

  const [eolModal, setEolModal] = useState<{
    isOpen: boolean;
    content: string;
  }>({
    isOpen: false,
    content: ''
  });

  const { showNotification } = useNotification();

  // Load modpack info on mount
  useEffect(() => {
    loadModpackInfo();
  }, []);

  // Check EOL status on mount
  useEffect(() => {
    checkEOLStatus();
  }, []);

  // Set up download progress listener
  useEffect(() => {
    const handleProgress = (progress: DownloadProgress) => {
      setDownloadProgress(progress);
    };

    window.api.modpack.onDownloadProgress(handleProgress);

    return () => {
      window.api.modpack.removeDownloadProgressListener(handleProgress);
    };
  }, []);

  const loadModpackInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const info = await window.api.modpack.getInfo();
      setModpackInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load modpack info');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkForUpdates = useCallback(async (showNotifications = true) => {
    try {
      setIsCheckingUpdates(true);
      setError(null);
      const hasUpdates = await window.api.modpack.checkUpdates();
      
      // Reload modpack info to get updated status
      await loadModpackInfo();
      
      if (showNotifications) {
        if (hasUpdates) {
          showNotification({
            type: 'info',
            title: 'Netrix Mod Manager',
            message: 'New modpack updates are available for download.',
            duration: 8000
          });
        } else {
          showNotification({
            type: 'success',
            title: 'Netrix Mod Manager',
            message: 'Your modpack is up to date.',
            duration: 4000
          });
        }
      }
      
      return hasUpdates;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
      if (showNotifications) {
        showNotification({
          type: 'error',
          title: 'Netrix Mod Manager',
          message: err instanceof Error ? err.message : 'Failed to check for updates',
          duration: 8000
        });
      }
      return false;
    } finally {
      setIsCheckingUpdates(false);
    }
  }, [loadModpackInfo, showNotification]);

  const downloadAndInstall = useCallback(async (bypassVersionCheck = false) => {
    try {
      setIsDownloading(true);
      setError(null);
      setDownloadProgress(null);
      
      // Check version compatibility first (unless bypassed)
      if (!bypassVersionCheck) {
        const versionCheck = await window.api.modpack.checkVersionCompatibility();
        
        if (!versionCheck.isCompatible && versionCheck.patcherInfo) {
          // Show the version compatibility modal
          setVersionModal({
            isOpen: true,
            patcherInfo: versionCheck.patcherInfo!,
            onContinue: () => {
              // Close modal and continue with bypass
              setVersionModal({ isOpen: false, patcherInfo: null, onContinue: null });
              downloadAndInstall(true);
            }
          });
          
          // Set downloading to false since we're waiting for user action
          setIsDownloading(false);
          return false;
        }
      }
      
      showNotification({
        type: 'info',
        title: 'Netrix Mod Manager',
        message: 'Starting modpack download and installation...',
        duration: 3000
      });
      
      const success = await window.api.modpack.downloadAndInstall(bypassVersionCheck);
      
      if (success) {
        // Reload modpack info after successful installation
        await loadModpackInfo();
        
        showNotification({
          type: 'success',
          title: 'Netrix Mod Manager',
          message: 'Modpack has been successfully installed and updated.',
          duration: 5000
        });
        
      } else {
        showNotification({
          type: 'error',
          title: 'Netrix Mod Manager',
          message: 'Failed to install modpack. Please check your configuration.',
          duration: 8000
        });
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download and install modpack');
      showNotification({
        type: 'error',
        title: 'Netrix Mod Manager',
        message: err instanceof Error ? err.message : 'Failed to download and install modpack',
        duration: 8000
      });
      return false;
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  }, [loadModpackInfo, showNotification]);

  const uninstall = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await window.api.modpack.uninstall();
      
      if (success) {
        // Reload modpack info after successful uninstall
        await loadModpackInfo();
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to uninstall modpack');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadModpackInfo]);

  const openModsDirectory = useCallback(async () => {
    try {
      setError(null);
      return await window.api.modpack.openModsDirectory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open mods directory');
      return false;
    }
  }, []);

  const getModsPath = useCallback(async () => {
    try {
      setError(null);
      return await window.api.modpack.getModsPath();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get mods path');
      return null;
    }
  }, []);

  const setModsPath = useCallback(async (path: string) => {
    try {
      setError(null);
      const success = await window.api.modpack.setModsPath(path);
      
      if (success) {
        // Reload modpack info after changing path
        await loadModpackInfo();
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set mods path');
      return false;
    }
  }, [loadModpackInfo]);

  const getRepositoryUrl = useCallback(async () => {
    try {
      setError(null);
      return await window.api.modpack.getRepositoryUrl();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get repository URL');
      return null;
    }
  }, []);

  const setRepositoryUrl = useCallback(async (url: string) => {
    try {
      setError(null);
      const success = await window.api.modpack.setRepositoryUrl(url);
      
      if (success) {
        // Reload modpack info after changing repository URL
        await loadModpackInfo();
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set repository URL');
      return false;
    }
  }, [loadModpackInfo]);

  // Check EOL status
  const checkEOLStatus = useCallback(async () => {
    try {
      const eolInfo = await window.api.modpack.checkEOL();
      
      if (eolInfo.isEOL) {
        setEolModal({
          isOpen: true,
          content: eolInfo.contentIfTrue
        });
      }
    } catch (error) {
      console.error('Failed to check EOL status:', error);
      // Don't show error to user for EOL check failures
    }
  }, []);

  // Modal control methods
  const handleDownloadPatcher = useCallback(() => {
    if (versionModal.patcherInfo?.installerUrl) {
      // Open the installer URL in the default browser
      window.api.shell.openExternal(versionModal.patcherInfo.installerUrl);
      
      // Close the version modal and show the download instructions modal
      setVersionModal({ isOpen: false, patcherInfo: null, onContinue: null });
      setDownloadInstructionsModal({
        isOpen: true,
        patcherInfo: versionModal.patcherInfo
      });
    } else {
      // If no installer URL, just close the modal
      setVersionModal({ isOpen: false, patcherInfo: null, onContinue: null });
    }
  }, [versionModal.patcherInfo]);

  const handleDownloadInstructionsOkay = useCallback(() => {
    setDownloadInstructionsModal({ isOpen: false, patcherInfo: null });
  }, []);

  const handleContinueWithout = useCallback(() => {
    if (versionModal.onContinue) {
      versionModal.onContinue();
    }
  }, [versionModal.onContinue]);

  const handleCancelModal = useCallback(() => {
    setVersionModal({ isOpen: false, patcherInfo: null, onContinue: null });
  }, []);

  const handleEOLModalClose = useCallback(() => {
    setEolModal({ isOpen: false, content: '' });
  }, []);

  return {
    modpackInfo,
    isLoading,
    isCheckingUpdates,
    isDownloading,
    downloadProgress,
    error,
    versionModal,
    downloadInstructionsModal,
    eolModal,
    loadModpackInfo,
    checkForUpdates,
    downloadAndInstall,
    uninstall,
    openModsDirectory,
    getModsPath,
    setModsPath,
    getRepositoryUrl,
    setRepositoryUrl,
    handleDownloadPatcher,
    handleContinueWithout,
    handleCancelModal,
    handleDownloadInstructionsOkay,
    handleEOLModalClose
  };
};
