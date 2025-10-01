import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  show = false 
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`notification notification-${type} ${visible ? 'notification-show' : ''}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    showNotification,
    removeNotification
  };
};

export default Notification;