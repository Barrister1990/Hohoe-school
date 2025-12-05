'use client';

import { useEffect } from 'react';
import { syncService } from '@/lib/services/sync-service';

/**
 * Sync Message Handler Component
 * Listens for sync messages from service worker
 */
export function SyncMessageHandler() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;

      const { type } = event.data;

      switch (type) {
        case 'SYNC_ALL':
          try {
            await syncService.syncAll();
          } catch (error) {
            console.error('[SyncMessageHandler] Sync all failed:', error);
          }
          break;

        case 'SYNC_ATTENDANCE':
          try {
            await syncService.syncAttendance();
          } catch (error) {
            console.error('[SyncMessageHandler] Sync attendance failed:', error);
          }
          break;

        case 'SYNC_GRADES':
          try {
            await syncService.syncGrades();
          } catch (error) {
            console.error('[SyncMessageHandler] Sync grades failed:', error);
          }
          break;

        case 'SYNC_EVALUATIONS':
          try {
            await syncService.syncEvaluations();
          } catch (error) {
            console.error('[SyncMessageHandler] Sync evaluations failed:', error);
          }
          break;

        default:
          break;
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return null; // This component doesn't render anything
}

