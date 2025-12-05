/**
 * Background Sync Service
 * Handles syncing of offline data when connection is restored
 */

import { offlineDetector } from '@/lib/utils/offline-detector';
import { OfflineStore, SyncStatus } from '@/lib/stores/offline-store';
import { offlineAPIService } from './offline-api-service';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ item: any; error: string }>;
}

export class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private syncListeners: Set<(status: 'syncing' | 'idle' | 'error') => void> = new Set();

  private constructor() {
    // Listen for online events
    if (typeof window !== 'undefined') {
      offlineDetector.subscribe((status) => {
        if (status === 'online' && !this.isSyncing) {
          // Auto-sync when coming online
          this.syncAll().catch((error) => {
            console.error('[SyncService] Auto-sync failed:', error);
          });
        }
      });
    }
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(callback: (status: 'syncing' | 'idle' | 'error') => void): () => void {
    this.syncListeners.add(callback);
    return () => {
      this.syncListeners.delete(callback);
    };
  }

  /**
   * Notify listeners of status change
   */
  private notifyListeners(status: 'syncing' | 'idle' | 'error'): void {
    this.syncListeners.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('[SyncService] Error in listener:', error);
      }
    });
  }

  /**
   * Sync all pending items
   */
  async syncAll(): Promise<SyncResult> {
    if (!offlineDetector.isOnline()) {
      throw new Error('Cannot sync while offline');
    }

    if (this.isSyncing) {
      console.warn('[SyncService] Sync already in progress');
      return { success: false, synced: 0, failed: 0, errors: [] };
    }

    this.isSyncing = true;
    this.notifyListeners('syncing');

    try {
      const [gradesResult, attendanceResult, evaluationsResult] = await Promise.all([
        this.syncGrades(),
        this.syncAttendance(),
        this.syncEvaluations(),
      ]);

      const result: SyncResult = {
        success: true,
        synced: gradesResult.synced + attendanceResult.synced + evaluationsResult.synced,
        failed: gradesResult.failed + attendanceResult.failed + evaluationsResult.failed,
        errors: [...gradesResult.errors, ...attendanceResult.errors, ...evaluationsResult.errors],
      };

      this.notifyListeners('idle');
      return result;
    } catch (error) {
      this.notifyListeners('error');
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync pending grades
   */
  async syncGrades(): Promise<SyncResult> {
    const pendingGrades = await OfflineStore.getPendingGrades();
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    for (const grade of pendingGrades) {
      try {
        // Mark as syncing
        await OfflineStore.saveGrade({
          ...grade,
          syncStatus: 'syncing',
        });

        // Attempt to sync
        const response = await offlineAPIService.fetchJSON('/api/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(grade),
        }) as { id?: string };

        // Mark as synced
        await OfflineStore.saveGrade({
          ...grade,
          syncStatus: 'synced',
          id: response?.id || grade.id, // Update with server ID if provided
        });

        result.synced++;
      } catch (error) {
        console.error('[SyncService] Failed to sync grade:', error);
        
        // Mark as failed
        await OfflineStore.saveGrade({
          ...grade,
          syncStatus: 'failed',
        });

        result.failed++;
        result.errors.push({
          item: grade,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Sync pending attendance
   */
  async syncAttendance(): Promise<SyncResult> {
    const pendingAttendance = await OfflineStore.getPendingAttendance();
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    for (const attendance of pendingAttendance) {
      try {
        // Mark as syncing
        await OfflineStore.saveAttendance({
          ...attendance,
          syncStatus: 'syncing',
        });

        // Attempt to sync
        const response = await offlineAPIService.fetchJSON('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attendance),
        }) as { id?: string };

        // Mark as synced
        await OfflineStore.saveAttendance({
          ...attendance,
          syncStatus: 'synced',
          id: response?.id || attendance.id,
        });

        result.synced++;
      } catch (error) {
        console.error('[SyncService] Failed to sync attendance:', error);
        
        // Mark as failed
        await OfflineStore.saveAttendance({
          ...attendance,
          syncStatus: 'failed',
        });

        result.failed++;
        result.errors.push({
          item: attendance,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Sync pending evaluations
   */
  async syncEvaluations(): Promise<SyncResult> {
    const pendingEvaluations = await OfflineStore.getPendingEvaluations();
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    for (const evaluation of pendingEvaluations) {
      try {
        // Mark as syncing
        await OfflineStore.saveEvaluation({
          ...evaluation,
          syncStatus: 'syncing',
        });

        // Attempt to sync
        const response = await offlineAPIService.fetchJSON('/api/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(evaluation),
        }) as { id?: string };

        // Mark as synced
        await OfflineStore.saveEvaluation({
          ...evaluation,
          syncStatus: 'synced',
          id: response?.id || evaluation.id,
        });

        result.synced++;
      } catch (error) {
        console.error('[SyncService] Failed to sync evaluation:', error);
        
        // Mark as failed
        await OfflineStore.saveEvaluation({
          ...evaluation,
          syncStatus: 'failed',
        });

        result.failed++;
        result.errors.push({
          item: evaluation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Retry failed syncs
   */
  async retryFailed(): Promise<SyncResult> {
    if (!offlineDetector.isOnline()) {
      throw new Error('Cannot retry sync while offline');
    }

    // Get failed items and reset their status to pending
    const [grades, attendance, evaluations] = await Promise.all([
      OfflineStore.getGrades(),
      OfflineStore.getAttendance(),
      OfflineStore.getEvaluations(),
    ]);

    const failedGrades = grades.filter((g: any) => g.syncStatus === 'failed');
    const failedAttendance = attendance.filter((a: any) => a.syncStatus === 'failed');
    const failedEvaluations = evaluations.filter((e: any) => e.syncStatus === 'failed');

    // Reset to pending
    for (const grade of failedGrades) {
      await OfflineStore.saveGrade({ ...grade, syncStatus: 'pending' });
    }
    for (const att of failedAttendance) {
      await OfflineStore.saveAttendance({ ...att, syncStatus: 'pending' });
    }
    for (const evaluation of failedEvaluations) {
      await OfflineStore.saveEvaluation({ ...evaluation, syncStatus: 'pending' });
    }

    // Sync again
    return this.syncAll();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): 'syncing' | 'idle' | 'error' {
    return this.isSyncing ? 'syncing' : 'idle';
  }

  /**
   * Check if currently syncing
   */
  isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();

