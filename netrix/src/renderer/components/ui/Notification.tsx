import { useEffect } from 'react';
import './Notification.css';
import { Icons } from '../icons';

export interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  isClosing?: boolean;
  onClose: (id: string) => void;
}

export default function Notification({
  id,
  title,
  message,
  type,
  duration = 5000,
  isClosing = false,
  onClose
}: NotificationProps) {
  useEffect(() => {
    if (isClosing) return; // Don't set timer if already closing
    
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose, isClosing]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Icons.check size={16} />;
      case 'warning':
        return <Icons.alert size={16} />;
      case 'error':
        return <Icons.x size={16} />;
      default:
        return <Icons.bell size={16} />;
    }
  };

  return (
    <div className={`notification notification-${type} ${isClosing ? 'notification-closing' : ''}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <div className="notification-message">{message}</div>
      </div>
      <button
        className="notification-close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
