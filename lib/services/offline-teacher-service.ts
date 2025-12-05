/**
 * Offline-First Teacher Service
 * Provides offline-capable methods for teacher operations
 */

import { offlineAPIService } from './offline-api-service';
import { OfflineStore } from '@/lib/stores/offline-store';
import { offlineDetector } from '@/lib/utils/offline-detector';
import { Student, Class, Subject } from '@/types';

export class OfflineTeacherService {
  private static instance: OfflineTeacherService;

  private constructor() {}

  static getInstance(): OfflineTeacherService {
    if (!OfflineTeacherService.instance) {
      OfflineTeacherService.instance = new OfflineTeacherService();
    }
    return OfflineTeacherService.instance;
  }

  /**
   * Get students (cache-first strategy)
   */
  async getStudents(classId?: string): Promise<Student[]> {
    const isOnline = offlineDetector.isOnline();

    // Try cache first
    let students = await OfflineStore.getStudents();
    
    if (classId) {
      students = students.filter(s => s.classId === classId);
    }

    // If online, fetch fresh data and update cache
    if (isOnline) {
      try {
        const url = classId 
          ? `/api/students?classId=${classId}`
          : '/api/students';
        
        const freshStudents = await offlineAPIService.fetchJSON<Student[]>(url, {
          cacheKey: `students-${classId || 'all'}`,
          storeInCache: true,
        });

        // Update local cache
        await OfflineStore.saveStudents(freshStudents);
        return freshStudents;
      } catch (error) {
        console.warn('[OfflineTeacher] Failed to fetch students, using cache:', error);
        // Return cached data if available
        if (students.length > 0) {
          return students;
        }
        throw error;
      }
    }

    // Offline - return cached data
    if (students.length > 0) {
      return students;
    }

    throw new Error('No students available offline');
  }

  /**
   * Get classes (cache-first strategy)
   */
  async getClasses(teacherId?: string): Promise<Class[]> {
    const isOnline = offlineDetector.isOnline();

    // Try cache first
    let classes = await OfflineStore.getClasses();

    // If online, fetch fresh data
    if (isOnline) {
      try {
        const url = teacherId
          ? `/api/classes/teacher/${teacherId}`
          : '/api/classes';
        
        const freshClasses = await offlineAPIService.fetchJSON<Class[]>(url, {
          cacheKey: `classes-${teacherId || 'all'}`,
          storeInCache: true,
        });

        // Update local cache
        await OfflineStore.saveClasses(freshClasses);
        return freshClasses;
      } catch (error) {
        console.warn('[OfflineTeacher] Failed to fetch classes, using cache:', error);
        if (classes.length > 0) {
          return classes;
        }
        throw error;
      }
    }

    // Offline - return cached data
    if (classes.length > 0) {
      return classes;
    }

    throw new Error('No classes available offline');
  }

  /**
   * Get subjects (cache-first strategy)
   */
  async getSubjects(): Promise<Subject[]> {
    const isOnline = offlineDetector.isOnline();

    // Try cache first
    let subjects = await OfflineStore.getSubjects();

    // If online, fetch fresh data
    if (isOnline) {
      try {
        const freshSubjects = await offlineAPIService.fetchJSON<Subject[]>('/api/subjects', {
          cacheKey: 'subjects-all',
          storeInCache: true,
        });

        // Update local cache
        await OfflineStore.saveSubjects(freshSubjects);
        return freshSubjects;
      } catch (error) {
        console.warn('[OfflineTeacher] Failed to fetch subjects, using cache:', error);
        if (subjects.length > 0) {
          return subjects;
        }
        throw error;
      }
    }

    // Offline - return cached data
    if (subjects.length > 0) {
      return subjects;
    }

    throw new Error('No subjects available offline');
  }

  /**
   * Save grade (offline-capable)
   */
  async saveGrade(gradeData: any): Promise<any> {
    const isOnline = offlineDetector.isOnline();

    // Always save locally first
    await OfflineStore.saveGrade(gradeData);

    // If online, try to sync immediately
    if (isOnline) {
      try {
        const response = await offlineAPIService.fetchJSON('/api/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gradeData),
          syncOnOnline: true,
        });

        // Mark as synced
        await OfflineStore.saveGrade({
          ...gradeData,
          syncStatus: 'synced',
        });

        return response;
      } catch (error) {
        console.warn('[OfflineTeacher] Failed to sync grade, will retry:', error);
        // Grade is already saved locally with 'pending' status
        return { success: true, queued: true, message: 'Saved locally, will sync when online' };
      }
    }

    // Offline - return success, will sync later
    return { success: true, queued: true, message: 'Saved locally, will sync when online' };
  }

  /**
   * Save attendance (offline-capable)
   */
  async saveAttendance(attendanceData: any): Promise<any> {
    const isOnline = offlineDetector.isOnline();

    // Always save locally first
    await OfflineStore.saveAttendance(attendanceData);

    // If online, try to sync immediately
    if (isOnline) {
      try {
        const response = await offlineAPIService.fetchJSON('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attendanceData),
          syncOnOnline: true,
        });

        // Mark as synced
        await OfflineStore.saveAttendance({
          ...attendanceData,
          syncStatus: 'synced',
        });

        return response;
      } catch (error) {
        console.warn('[OfflineTeacher] Failed to sync attendance, will retry:', error);
        return { success: true, queued: true, message: 'Saved locally, will sync when online' };
      }
    }

    // Offline - return success, will sync later
    return { success: true, queued: true, message: 'Saved locally, will sync when online' };
  }

  /**
   * Save evaluation (offline-capable)
   */
  async saveEvaluation(evaluationData: any): Promise<any> {
    const isOnline = offlineDetector.isOnline();

    // Always save locally first
    await OfflineStore.saveEvaluation(evaluationData);

    // If online, try to sync immediately
    if (isOnline) {
      try {
        const response = await offlineAPIService.fetchJSON('/api/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(evaluationData),
          syncOnOnline: true,
        });

        // Mark as synced
        await OfflineStore.saveEvaluation({
          ...evaluationData,
          syncStatus: 'synced',
        });

        return response;
      } catch (error) {
        console.warn('[OfflineTeacher] Failed to sync evaluation, will retry:', error);
        return { success: true, queued: true, message: 'Saved locally, will sync when online' };
      }
    }

    // Offline - return success, will sync later
    return { success: true, queued: true, message: 'Saved locally, will sync when online' };
  }

  /**
   * Get pending sync count
   */
  async getPendingSyncCount(): Promise<number> {
    const [pendingGrades, pendingAttendance, pendingEvaluations] = await Promise.all([
      OfflineStore.getPendingGrades(),
      OfflineStore.getPendingAttendance(),
      OfflineStore.getPendingEvaluations(),
    ]);

    return pendingGrades.length + pendingAttendance.length + pendingEvaluations.length;
  }

  /**
   * Preload essential data for offline use
   */
  async preloadData(teacherId: string): Promise<void> {
    if (!offlineDetector.isOnline()) {
      console.warn('[OfflineTeacher] Cannot preload data while offline');
      return;
    }

    try {
      // Load all essential data in parallel
      const [classes, students, subjects, assignmentsResponse] = await Promise.all([
        this.getClasses(teacherId),
        this.getStudents(),
        this.getSubjects(),
        offlineAPIService.fetchJSON('/api/subject-assignments', {
          cacheKey: 'subject-assignments',
          storeInCache: true,
        }),
      ]);

      // Save assignments (ensure it's an array)
      const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : [];
      await OfflineStore.saveSubjectAssignments(assignments);

      console.log('[OfflineTeacher] Data preloaded successfully', {
        classes: classes.length,
        students: students.length,
        subjects: subjects.length,
        assignments: assignments.length,
      });
    } catch (error) {
      console.error('[OfflineTeacher] Failed to preload data:', error);
    }
  }
}

// Export singleton instance
export const offlineTeacherService = OfflineTeacherService.getInstance();

