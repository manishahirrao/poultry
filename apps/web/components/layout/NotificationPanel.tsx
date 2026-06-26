'use client';

import { X, Check, Bell, Warning, FileText, Info, TrendDown } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'price' | 'disease' | 'weather' | 'policy' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationPanelProps {
  onClose: () => void;
  onMarkAllRead: () => void;
}

export function NotificationPanel({ onClose, onMarkAllRead }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Set mock data for demo
        setNotifications([
          {
            id: '1',
            type: 'price',
            title: 'Price Drop Alert',
            message: 'Gorakhpur mandi price dropped by ₹5/kg due to oversupply',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            read: false,
          },
          {
            id: '2',
            type: 'disease',
            title: 'HPAI Alert',
            message: 'HPAI detected within 50km of your farms in Maharajganj',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            read: false,
          },
          {
            id: '3',
            type: 'weather',
            title: 'Heat Wave Warning',
            message: 'Temperature expected to exceed 42°C in the next 3 days',
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
            read: true,
          },
        ]);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price':
        return <TrendDown size={20} weight="fill" className="text-amber-600" />;
      case 'disease':
        return <Warning size={20} weight="fill" className="text-red-600" />;
      case 'weather':
        return <Warning size={20} weight="fill" className="text-blue-600" />;
      case 'policy':
        return <FileText size={20} weight="fill" className="text-gray-600" />;
      case 'system':
        return <Info size={20} weight="fill" className="text-gray-600" />;
      default:
        return <Bell size={20} weight="fill" className="text-gray-600" />;
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/mark-read`, { method: 'POST' });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3EDE7]">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="text-sm text-[#1A5C34] hover:text-[#1F7040] font-medium"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close notifications"
          >
            <X size={20} weight="regular" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <Bell size={48} weight="thin" className="text-gray-300 mb-4" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E3EDE7]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-[#EDF7F1] transition-colors ${
                  !notification.read ? 'bg-[#F4F7F5]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex-shrink-0 text-[#1A5C34] hover:text-[#1F7040]"
                          aria-label="Mark as read"
                        >
                          <Check size={16} weight="bold" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
