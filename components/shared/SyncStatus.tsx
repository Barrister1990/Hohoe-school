'use client';

import { useEffect, useState } from 'react';
import { syncService } from '@/lib/services/sync-service';
import { useOfflineData } from '@/hooks/useOfflineData';
import { RefreshCw, CheckCircle, AlertCircle, CloudOff } from 'lucide-react';

/**
 * Sync Status Component
 * Shows current sync status and pending sync count
 */
export function SyncStatus() {
  const { pendingSyncCount, isOnline } = useOfflineData();
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'idle' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  const handleSync = async () => {
    if (!isOnline || syncStatus === 'syncing') return;

    try {
      await syncService.syncAll();
    } catch (error) {
      console.error('[SyncStatus] Sync failed:', error);
    }
  };

  const handleRetry = async () => {
    if (!isOnline) return;

    try {
      await syncService.retryFailed();
    } catch (error) {
      console.error('[SyncStatus] Retry failed:', error);
    }
  };

  // Don't show if no pending items and not syncing
  if (pendingSyncCount === 0 && syncStatus === 'idle' && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {syncStatus === 'syncing' ? (
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            ) : syncStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : pendingSyncCount > 0 ? (
              <CloudOff className="h-4 w-4 text-yellow-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {syncStatus === 'syncing' ? 'Syncing...' : 
               syncStatus === 'error' ? 'Sync Error' :
               pendingSyncCount > 0 ? `${pendingSyncCount} Pending` : 'All Synced'}
            </span>
          </div>
          {pendingSyncCount > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && pendingSyncCount > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              {pendingSyncCount} item{pendingSyncCount !== 1 ? 's' : ''} waiting to sync
            </p>
            {isOnline ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncStatus !== 'idle'}
                  className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </button>
                {syncStatus === 'error' && (
                  <button
                    onClick={handleRetry}
                    disabled={false}
                    className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Waiting for connection...
              </p>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        {syncStatus === 'syncing' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

