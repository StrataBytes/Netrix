import { useState, useCallback } from 'react';
import Notification from './Notification';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  isClosing?: boolean;
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    // First mark as closing to trigger exit animation
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isClosing: true } : n
    ));
    
    // Then remove from DOM after animation completes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300); // Match the Notification.css animation duration
  }, []);

  // Expose methods globally
  if (typeof window !== 'undefined') {
    (window as any).showNotification = addNotification;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
}

// Helper function to show notifications
export const showNotification = (notification: Omit<NotificationData, 'id'>) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    (window as any).showNotification(notification);
  }
};
