/**
 * React Hook for Offline Data Management
 * Provides easy access to offline-first data fetching
 */

import { useEffect, useState, useCallback } from 'react';
import { offlineTeacherService } from '@/lib/services/offline-teacher-service';
import { offlineDetector } from '@/lib/utils/offline-detector';
import { Student, Class, Subject } from '@/types';

export function useOfflineData() {
  const [isOnline, setIsOnline] = useState(offlineDetector.isOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineDetector.subscribe((status) => {
      setIsOnline(status === 'online');
    });

    // Update pending sync count periodically
    const updatePendingCount = async () => {
      try {
        const count = await offlineTeacherService.getPendingSyncCount();
        setPendingSyncCount(count);
      } catch (error) {
        console.error('[useOfflineData] Failed to get pending sync count:', error);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000); // Update every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const preloadData = useCallback(async (teacherId: string) => {
    setLoading(true);
    try {
      await offlineTeacherService.preloadData(teacherId);
    } catch (error) {
      console.error('[useOfflineData] Failed to preload data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isOnline,
    pendingSyncCount,
    loading,
    preloadData,
  };
}

/**
 * Hook for fetching students with offline support
 */
export function useOfflineStudents(classId?: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await offlineTeacherService.getStudents(classId);
        setStudents(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load students'));
        console.error('[useOfflineStudents] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [classId]);

  return { students, loading, error };
}

/**
 * Hook for fetching classes with offline support
 */
export function useOfflineClasses(teacherId?: string) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await offlineTeacherService.getClasses(teacherId);
        setClasses(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load classes'));
        console.error('[useOfflineClasses] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [teacherId]);

  return { classes, loading, error };
}

/**
 * Hook for fetching subjects with offline support
 */
export function useOfflineSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await offlineTeacherService.getSubjects();
        setSubjects(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load subjects'));
        console.error('[useOfflineSubjects] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  return { subjects, loading, error };
}

