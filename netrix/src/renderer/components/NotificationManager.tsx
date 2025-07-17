import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Notification } from './Notification';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  isClosing?: boolean;
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationItem, 'id' | 'isClosing'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [idCounter, setIdCounter] = useState(0);
  const [lastNotificationTime, setLastNotificationTime] = useState<Record<string, number>>({});

  const showNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'isClosing'>) => {
    const notificationKey = `${notification.title}-${notification.message}`;
    const now = Date.now();
    
    // Prevent duplicate notifications within 2 seconds
    if (lastNotificationTime[notificationKey] && (now - lastNotificationTime[notificationKey]) < 2000) {
      return;
    }
    
    // Also check if the same notification is currently being displayed
    const isDuplicate = notifications.some(n => 
      n.title === notification.title && 
      n.message === notification.message &&
      !n.isClosing
    );
    
    if (isDuplicate) {
      return;
    }

    const id = `notification-${now}-${idCounter}`;
    setIdCounter(prev => prev + 1);
    setLastNotificationTime(prev => ({ ...prev, [notificationKey]: now }));
    
    const newNotification: NotificationItem = {
      ...notification,
      id,
      duration: notification.duration || 5000,
      isClosing: false
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }, [idCounter, notifications, lastNotificationTime]);

  const removeNotification = useCallback((id: string) => {
    // First mark as closing to trigger exit animation
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isClosing: true } : n
    ));
    
    // Then remove from DOM after animation completes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 400); // Match the slideOut animation duration
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      <div 
        className="notification-container"
        style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '450px',
          pointerEvents: 'none'
        }}
      >
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              pointerEvents: 'auto',
              animationDelay: `${index * 100}ms`,
              transform: `translateY(${index * 2}px)`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Notification
              type={notification.type}
              title={notification.title}
              message={notification.message}
              duration={notification.duration}
              isClosing={notification.isClosing}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
