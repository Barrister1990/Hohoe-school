/**
 * Offline-First API Service
 * Wraps fetch calls with offline support and local caching
 */

import { offlineDetector } from '@/lib/utils/offline-detector';
import { OfflineStore, SyncStatus } from '@/lib/stores/offline-store';

export interface OfflineFetchOptions extends RequestInit {
  cacheKey?: string;
  storeInCache?: boolean;
  syncOnOnline?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export interface CachedResponse<T> {
  data: T;
  cached: boolean;
  timestamp: number;
}

/**
 * Offline-First Fetch Wrapper
 */
export class OfflineAPIService {
  private static instance: OfflineAPIService;
  private cache: Map<string, CachedResponse<any>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): OfflineAPIService {
    if (!OfflineAPIService.instance) {
      OfflineAPIService.instance = new OfflineAPIService();
    }
    return OfflineAPIService.instance;
  }

  /**
   * Fetch with offline support
   */
  async fetch<T>(
    url: string,
    options: OfflineFetchOptions = {}
  ): Promise<Response> {
    const {
      cacheKey,
      storeInCache = true,
      syncOnOnline = false,
      retryOnFailure = true,
      maxRetries = 3,
      ...fetchOptions
    } = options;

    const isOnline = offlineDetector.isOnline();
    const key = cacheKey || url;

    // If online, try network first
    if (isOnline) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          credentials: 'include',
        });

        // Cache successful GET responses
        if (response.ok && storeInCache && fetchOptions.method === undefined || fetchOptions.method === 'GET') {
          const data = await response.clone().json().catch(() => null);
          if (data) {
            this.cache.set(key, {
              data,
              cached: false,
              timestamp: Date.now(),
            });
          }
        }

        return response;
      } catch (error) {
        console.warn('[OfflineAPI] Network request failed, trying cache:', error);
        // Fall through to cache check
      }
    }

    // Try cache if offline or network failed
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached)) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If offline and no cache, queue for sync
    if (!isOnline && syncOnOnline && (fetchOptions.method === 'POST' || fetchOptions.method === 'PUT' || fetchOptions.method === 'DELETE')) {
      await this.queueForSync(url, fetchOptions);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Queued for sync when online',
          queued: true 
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // No cache and offline - return error
    throw new Error('Offline and no cached data available');
  }

  /**
   * Fetch JSON with offline support
   */
  async fetchJSON<T>(
    url: string,
    options: OfflineFetchOptions = {}
  ): Promise<T> {
    const response = await this.fetch<T>(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(cached: CachedResponse<any>): boolean {
    return Date.now() - cached.timestamp < this.CACHE_TTL;
  }

  /**
   * Queue request for sync when online
   */
  private async queueForSync(
    url: string,
    options: RequestInit
  ): Promise<void> {
    const type = this.getSyncType(url);
    
    await OfflineStore.addToSyncQueue({
      type,
      action: this.getActionType(options.method || 'GET'),
      data: {
        url,
        options: {
          method: options.method,
          headers: options.headers,
          body: options.body,
        },
      },
      status: 'pending',
      retries: 0,
    });
  }

  /**
   * Determine sync type from URL
   */
  private getSyncType(url: string): 'grade' | 'attendance' | 'evaluation' | 'student' {
    if (url.includes('/grades')) return 'grade';
    if (url.includes('/attendance')) return 'attendance';
    if (url.includes('/evaluations')) return 'evaluation';
    if (url.includes('/students')) return 'student';
    return 'student'; // default
  }

  /**
   * Get action type from HTTP method
   */
  private getActionType(method: string): 'create' | 'update' | 'delete' {
    if (method === 'POST') return 'create';
    if (method === 'PUT' || method === 'PATCH') return 'update';
    if (method === 'DELETE') return 'delete';
    return 'create';
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const offlineAPIService = OfflineAPIService.getInstance();

