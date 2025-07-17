import { useState } from 'react';
import Button from '../components/ui/Button';
import { useStatus } from '../hooks/useStatus';
import { Icons } from '../components/icons';
import type { StatusAnnouncement } from '../types/api';

export default function Status() {
  const {
    status,
    loading,
    error,
    lastUpdated,
    fetchStatus,
    getActiveAnnouncements,
    hasActiveCriticalIssues,
    getStatusColor,
    formatTimeRange,
    clearCache
  } = useStatus();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  };

  const getStatusIcon = (type: StatusAnnouncement['type']) => {
    switch (type) {
      case 'maintenance': return <Icons.tool size={16} />;
      case 'outage': return <Icons.alert size={16} />;
      case 'degraded': return <Icons.alert size={16} />;
      case 'resolved': return <Icons.check size={16} />;
      case 'info': return <Icons.info size={16} />;
      default: return <Icons.info size={16} />;
    }
  };

  const getSeverityBadge = (severity: StatusAnnouncement['severity']) => {
    if (!severity) return null;
    
    const colors = {
      critical: 'var(--error)',
      high: '#ff6b35',
      medium: 'var(--warning)',
      low: 'var(--success)'
    };

    return (
      <span style={{
        background: colors[severity],
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '2px 6px',
        borderRadius: '4px',
        textTransform: 'uppercase'
      }}>
        {severity}
      </span>
    );
  };

  const AnnouncementCard = ({ announcement }: { announcement: StatusAnnouncement }) => (
    <div style={{
      background: 'rgba(10, 10, 10, 0.6)',
      border: `1px solid ${getStatusColor(announcement.type)}`,
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ color: getStatusColor(announcement.type), marginTop: '2px' }}>
          {getStatusIcon(announcement.type)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
              {announcement.title}
            </h3>
            {getSeverityBadge(announcement.severity)}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
            {announcement.message}
          </p>
          {announcement.services && announcement.services.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {announcement.services.map((service) => (
                <span key={service} style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {service}
                </span>
              ))}
            </div>
          )}
          {announcement.startTime && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {formatTimeRange(announcement.startTime, announcement.endTime)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const getOverallStatus = () => {
    const activeAnnouncements = getActiveAnnouncements();
    
    if (activeAnnouncements.some(a => a.type === 'outage')) {
      return { status: 'Major Outage', color: 'var(--error)' };
    }
    if (activeAnnouncements.some(a => a.type === 'degraded')) {
      return { status: 'Degraded Performance', color: 'var(--warning)' };
    }
    if (activeAnnouncements.some(a => a.type === 'maintenance')) {
      return { status: 'Maintenance', color: 'var(--warning)' };
    }
    if (hasActiveCriticalIssues()) {
      return { status: 'Issues Detected', color: 'var(--error)' };
    }
    
    return { status: 'All Systems Operational', color: 'var(--success)' };
  };

  const overallStatus = getOverallStatus();
  const activeAnnouncements = getActiveAnnouncements();

  if (loading && !status) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>Loading status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">CrashCraft Network Status</h1>
        <p className="page-subtitle">
          Service announcements and planned maintenance
        </p>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--error)', background: 'rgba(255, 71, 87, 0.1)' }}>
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.alert size={16} color="var(--error)" />
              <span style={{ color: 'var(--error)' }}>Error loading status: {error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Overall Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: overallStatus.color 
            }}></div>
            Overall Status
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {lastUpdated && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
        <div className="card-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: overallStatus.color,
              marginBottom: '0.5rem'
            }}>
              {overallStatus.status}
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              {activeAnnouncements.length > 0 
                ? `${activeAnnouncements.length} active announcement${activeAnnouncements.length !== 1 ? 's' : ''}`
                : 'No active issues reported'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Active Announcements */}
      {activeAnnouncements.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.alert size={20} />
              Active Announcements
            </h2>
          </div>
          <div className="card-content">
            {activeAnnouncements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </div>
      )}

      {/* Cache Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Cache Management</h2>
          <Button variant="ghost" size="sm" onClick={clearCache}>
            Clear Cache
          </Button>
        </div>
        <div className="card-content">
          <p style={{ color: 'var(--text-muted)' }}>
            Clear the status cache to force refresh from the remote repository.
          </p>
        </div>
      </div>
    </div>
  );
}
