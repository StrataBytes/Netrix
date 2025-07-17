import { useState, useEffect } from 'react';
import type { StatusResponse, StatusAnnouncement } from '../types/api';

export function useStatus() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await window.api.status.getStatus();
      
      if (result.success && result.data) {
        setStatus(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getActiveAnnouncements = (): StatusAnnouncement[] => {
    if (!status) return [];
    
    return status.status.filter((announcement: StatusAnnouncement) => {
      // If active is explicitly set, use that
      if (announcement.active !== undefined) {
        return announcement.active;
      }
      
      // If no active field, assume active
      return true;
    });
  };

  const getAnnouncementsByType = (type: StatusAnnouncement['type']): StatusAnnouncement[] => {
    if (!status) return [];
    return status.status.filter((announcement: StatusAnnouncement) => announcement.type === type);
  };

  const getAnnouncementsBySeverity = (severity: StatusAnnouncement['severity']): StatusAnnouncement[] => {
    if (!status) return [];
    return status.status.filter((announcement: StatusAnnouncement) => announcement.severity === severity);
  };

  const hasActiveCriticalIssues = (): boolean => {
    const activeAnnouncements = getActiveAnnouncements();
    return activeAnnouncements.some(announcement => 
      announcement.severity === 'critical' || announcement.severity === 'high'
    );
  };

  const getStatusColor = (type: StatusAnnouncement['type']): string => {
    switch (type) {
      case 'maintenance': return 'var(--warning)';
      case 'outage': return 'var(--error)';
      case 'degraded': return 'var(--warning)';
      case 'resolved': return 'var(--success)';
      case 'info': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  };

  const getSeverityColor = (severity: StatusAnnouncement['severity']): string => {
    switch (severity) {
      case 'critical': return 'var(--error)';
      case 'high': return '#ff6b35';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  const formatTimeRange = (startTime?: string, endTime?: string): string => {
    if (!startTime) return '';
    
    if (endTime) {
      return `${startTime} - ${endTime}`;
    }
    
    return `Started: ${startTime}`;
  };

  const clearCache = async () => {
    try {
      await window.api.status.clearStatusCache();
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    error,
    lastUpdated,
    fetchStatus,
    getActiveAnnouncements,
    getAnnouncementsByType,
    getAnnouncementsBySeverity,
    hasActiveCriticalIssues,
    getStatusColor,
    getSeverityColor,
    formatTimeRange,
    clearCache
  };
}
