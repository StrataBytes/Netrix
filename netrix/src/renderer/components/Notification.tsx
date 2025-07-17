import React, { useState, useEffect } from 'react';

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
  isClosing?: boolean;
}

export const Notification: React.FC<NotificationProps> = ({ 
  type, 
  title, 
  message, 
  onClose, 
  duration = 5000,
  isClosing = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  // Progress bar animation
  useEffect(() => {
    if (isClosing || isHovered) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;
      
      setProgress(progressPercent);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, isClosing, isHovered]);

  const handleClose = () => {
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10b981',
          color: 'white',
          borderColor: '#059669',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          )
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          color: 'white',
          borderColor: '#dc2626',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )
        };
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          color: 'white',
          borderColor: '#d97706',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="m12 17 .01 0"/>
            </svg>
          )
        };
      case 'info':
        return {
          backgroundColor: '#3b82f6',
          color: 'white',
          borderColor: '#2563eb',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="m12 8 .01 0"/>
            </svg>
          )
        };
      default:
        return {
          backgroundColor: '#3b82f6',
          color: 'white',
          borderColor: '#2563eb',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="m12 8 .01 0"/>
            </svg>
          )
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`notification ${isClosing ? 'notification--closing' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${styles.backgroundColor} 0%, ${styles.backgroundColor}dd 100%)`,
        color: styles.color,
        padding: '18px 22px',
        borderRadius: '14px',
        boxShadow: isHovered 
          ? '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          : '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minWidth: '340px',
        maxWidth: '450px',
        border: `1px solid ${styles.borderColor}`,
        backdropFilter: 'blur(12px)',
        animation: isClosing 
          ? 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards' 
          : 'slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        transform: isHovered && !isClosing ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          width: `${progress}%`,
          transition: 'width 0.05s linear',
          borderRadius: '0 0 14px 14px'
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div 
          className="notification-icon"
          style={{ 
            marginTop: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {styles.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: '700', 
            marginBottom: '8px',
            fontSize: '15px',
            lineHeight: '1.4',
            letterSpacing: '-0.025em'
          }}>
            {title}
          </div>
          <div style={{ 
            fontSize: '13px', 
            opacity: 0.95,
            lineHeight: '1.5',
            letterSpacing: '-0.01em'
          }}>
            {message}
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '6px',
            borderRadius: '8px',
            lineHeight: '1',
            opacity: isHovered ? 1 : 0.7,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
