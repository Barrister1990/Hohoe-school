'use client';

import { serviceWorkerManager } from '@/lib/utils/service-worker';
import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * Registers the service worker on mount
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker
    serviceWorkerManager.register().catch((error) => {
      console.error('[SW Registration] Failed to register:', error);
    });

    // Listen for update available
    const handleUpdateAvailable = () => {
      // You can show a notification to the user here
      console.log('[SW] Update available');
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  return null; // This component doesn't render anything
}

