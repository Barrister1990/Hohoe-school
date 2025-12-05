'use client';

import { offlineDetector, OnlineStatus } from '@/lib/utils/offline-detector';
import { CloudOff, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Offline Status Indicator Component
 * Shows current online/offline status
 */
export function OfflineIndicator() {
  const [status, setStatus] = useState<OnlineStatus>('unknown');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = offlineDetector.subscribe((newStatus) => {
      setStatus(newStatus);
      
      // Show indicator when going offline
      if (newStatus === 'offline') {
        setIsVisible(true);
      } else if (newStatus === 'online') {
        // Hide after a delay when coming back online
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    });

    return unsubscribe;
  }, []);

  if (!isVisible && status === 'online') {
    return null;
  }

  const isOffline = status === 'offline';

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOffline
          ? 'bg-red-500 text-white'
          : 'bg-green-500 text-white'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      role="status"
      aria-live="polite"
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're offline</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </>
      )}
    </div>
  );
}

/**
 * Offline Banner Component
 * Shows a banner at the top when offline
 */
export function OfflineBanner() {
  const [status, setStatus] = useState<OnlineStatus>('unknown');

  useEffect(() => {
    const unsubscribe = offlineDetector.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  if (status !== 'offline') {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <CloudOff className="h-4 w-4" />
        <span>You're working offline. Changes will sync when you're back online.</span>
      </div>
    </div>
  );
}

