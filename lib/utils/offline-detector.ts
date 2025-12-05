/**
 * Offline Detection Utility
 * Detects online/offline status and provides callbacks
 */

export type OnlineStatus = 'online' | 'offline' | 'unknown';

export class OfflineDetector {
  private static instance: OfflineDetector;
  private status: OnlineStatus = 'unknown';
  private listeners: Set<(status: OnlineStatus) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.status = navigator.onLine ? 'online' : 'offline';
      this.setupListeners();
    }
  }

  static getInstance(): OfflineDetector {
    if (!OfflineDetector.instance) {
      OfflineDetector.instance = new OfflineDetector();
    }
    return OfflineDetector.instance;
  }

  /**
   * Setup online/offline event listeners
   */
  private setupListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.setStatus('online');
    });

    window.addEventListener('offline', () => {
      this.setStatus('offline');
    });
  }

  /**
   * Set the current status and notify listeners
   */
  private setStatus(status: OnlineStatus): void {
    if (this.status === status) return;

    this.status = status;
    this.notifyListeners();
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('[OfflineDetector] Error in listener:', error);
      }
    });
  }

  /**
   * Get current online status
   */
  getStatus(): OnlineStatus {
    if (typeof window === 'undefined') {
      return 'unknown';
    }
    return navigator.onLine ? 'online' : 'offline';
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.getStatus() === 'online';
  }

  /**
   * Check if currently offline
   */
  isOffline(): boolean {
    return this.getStatus() === 'offline';
  }

  /**
   * Subscribe to status changes
   */
  subscribe(callback: (status: OnlineStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current status
    callback(this.getStatus());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Unsubscribe from status changes
   */
  unsubscribe(callback: (status: OnlineStatus) => void): void {
    this.listeners.delete(callback);
  }
}

// Export singleton instance
export const offlineDetector = OfflineDetector.getInstance();

