/**
 * Offline Store Configuration
 * Defines IndexedDB schema for offline data storage
 */

import { IndexedDBManager, IDBConfig } from '@/lib/utils/indexeddb';
import { Student, Class, Subject } from '@/types';

// Database configuration
const DB_CONFIG: IDBConfig = {
  name: 'HohoeLMS',
  version: 1,
  stores: [
    {
      name: 'students',
      keyPath: 'id',
      indexes: [
        { name: 'classId', keyPath: 'classId', unique: false },
        { name: 'name', keyPath: 'name', unique: false },
      ],
    },
    {
      name: 'classes',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name', unique: false },
        { name: 'level', keyPath: 'level', unique: false },
      ],
    },
    {
      name: 'subjects',
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name', unique: false },
      ],
    },
    {
      name: 'subjectAssignments',
      keyPath: 'id',
      indexes: [
        { name: 'teacherId', keyPath: 'teacherId', unique: false },
        { name: 'classId', keyPath: 'classId', unique: false },
        { name: 'subjectId', keyPath: 'subjectId', unique: false },
      ],
    },
    {
      name: 'grades',
      keyPath: 'id',
      indexes: [
        { name: 'studentId', keyPath: 'studentId', unique: false },
        { name: 'subjectId', keyPath: 'subjectId', unique: false },
        { name: 'classId', keyPath: 'classId', unique: false },
        { name: 'academicYear', keyPath: 'academicYear', unique: false },
        { name: 'term', keyPath: 'term', unique: false },
        { name: 'syncStatus', keyPath: 'syncStatus', unique: false },
      ],
    },
    {
      name: 'attendance',
      keyPath: 'id',
      indexes: [
        { name: 'studentId', keyPath: 'studentId', unique: false },
        { name: 'classId', keyPath: 'classId', unique: false },
        { name: 'date', keyPath: 'date', unique: false },
        { name: 'academicYear', keyPath: 'academicYear', unique: false },
        { name: 'term', keyPath: 'term', unique: false },
        { name: 'syncStatus', keyPath: 'syncStatus', unique: false },
      ],
    },
    {
      name: 'evaluations',
      keyPath: 'id',
      indexes: [
        { name: 'studentId', keyPath: 'studentId', unique: false },
        { name: 'classId', keyPath: 'classId', unique: false },
        { name: 'academicYear', keyPath: 'academicYear', unique: false },
        { name: 'term', keyPath: 'term', unique: false },
        { name: 'syncStatus', keyPath: 'syncStatus', unique: false },
      ],
    },
    {
      name: 'syncQueue',
      keyPath: 'id',
      indexes: [
        { name: 'type', keyPath: 'type', unique: false },
        { name: 'status', keyPath: 'status', unique: false },
        { name: 'createdAt', keyPath: 'createdAt', unique: false },
      ],
    },
  ],
};

// Initialize database
export const offlineDB = IndexedDBManager.getInstance(DB_CONFIG);

/**
 * Sync Status Types
 */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

/**
 * Sync Queue Item
 */
export interface SyncQueueItem {
  id: string;
  type: 'grade' | 'attendance' | 'evaluation' | 'student';
  action: 'create' | 'update' | 'delete';
  data: any;
  status: SyncStatus;
  retries: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Offline Store Helper Functions
 */
export class OfflineStore {
  /**
   * Students
   */
  static async saveStudents(students: Student[]): Promise<void> {
    await offlineDB.putAll('students', students);
  }

  static async getStudents(): Promise<Student[]> {
    return offlineDB.getAll<Student>('students');
  }

  static async getStudentsByClass(classId: string): Promise<Student[]> {
    return offlineDB.getByIndex<Student>('students', 'classId', classId);
  }

  static async getStudent(id: string): Promise<Student | undefined> {
    return offlineDB.get<Student>('students', id);
  }

  static async saveStudent(student: Student): Promise<void> {
    await offlineDB.put('students', student);
  }

  /**
   * Classes
   */
  static async saveClasses(classes: Class[]): Promise<void> {
    await offlineDB.putAll('classes', classes);
  }

  static async getClasses(): Promise<Class[]> {
    return offlineDB.getAll<Class>('classes');
  }

  static async getClass(id: string): Promise<Class | undefined> {
    return offlineDB.get<Class>('classes', id);
  }

  /**
   * Subjects
   */
  static async saveSubjects(subjects: Subject[]): Promise<void> {
    await offlineDB.putAll('subjects', subjects);
  }

  static async getSubjects(): Promise<Subject[]> {
    return offlineDB.getAll<Subject>('subjects');
  }

  static async getSubject(id: string): Promise<Subject | undefined> {
    return offlineDB.get<Subject>('subjects', id);
  }

  /**
   * Subject Assignments
   */
  static async saveSubjectAssignments(assignments: any[]): Promise<void> {
    await offlineDB.putAll('subjectAssignments', assignments);
  }

  static async getSubjectAssignments(): Promise<any[]> {
    return offlineDB.getAll('subjectAssignments');
  }

  static async getSubjectAssignmentsByTeacher(teacherId: string): Promise<any[]> {
    return offlineDB.getByIndex('subjectAssignments', 'teacherId', teacherId);
  }

  /**
   * Grades
   */
  static async saveGrade(grade: any): Promise<void> {
    await offlineDB.put('grades', {
      ...grade,
      syncStatus: 'pending' as SyncStatus,
      updatedAt: Date.now(),
    });
  }

  static async getGrades(): Promise<any[]> {
    return offlineDB.getAll('grades');
  }

  static async getGradesByStudent(studentId: string): Promise<any[]> {
    return offlineDB.getByIndex('grades', 'studentId', studentId);
  }

  static async getPendingGrades(): Promise<any[]> {
    return offlineDB.getByIndex('grades', 'syncStatus', 'pending');
  }

  /**
   * Attendance
   */
  static async saveAttendance(attendance: any): Promise<void> {
    await offlineDB.put('attendance', {
      ...attendance,
      syncStatus: 'pending' as SyncStatus,
      updatedAt: Date.now(),
    });
  }

  static async getAttendance(): Promise<any[]> {
    return offlineDB.getAll('attendance');
  }

  static async getAttendanceByStudent(studentId: string): Promise<any[]> {
    return offlineDB.getByIndex('attendance', 'studentId', studentId);
  }

  static async getPendingAttendance(): Promise<any[]> {
    return offlineDB.getByIndex('attendance', 'syncStatus', 'pending');
  }

  /**
   * Evaluations
   */
  static async saveEvaluation(evaluation: any): Promise<void> {
    await offlineDB.put('evaluations', {
      ...evaluation,
      syncStatus: 'pending' as SyncStatus,
      updatedAt: Date.now(),
    });
  }

  static async getEvaluations(): Promise<any[]> {
    return offlineDB.getAll('evaluations');
  }

  static async getEvaluationsByStudent(studentId: string): Promise<any[]> {
    return offlineDB.getByIndex('evaluations', 'studentId', studentId);
  }

  static async getPendingEvaluations(): Promise<any[]> {
    return offlineDB.getByIndex('evaluations', 'syncStatus', 'pending');
  }

  /**
   * Sync Queue
   */
  static async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queueItem: SyncQueueItem = {
      ...item,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await offlineDB.put('syncQueue', queueItem);
    return id;
  }

  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    return offlineDB.getAll<SyncQueueItem>('syncQueue');
  }

  static async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    return offlineDB.getByIndex<SyncQueueItem>('syncQueue', 'status', 'pending');
  }

  static async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const item = await offlineDB.get<SyncQueueItem>('syncQueue', id);
    if (item) {
      await offlineDB.put('syncQueue', {
        ...item,
        ...updates,
        updatedAt: Date.now(),
      });
    }
  }

  static async removeSyncQueueItem(id: string): Promise<void> {
    await offlineDB.delete('syncQueue', id);
  }

  /**
   * Clear all data (for testing/logout)
   */
  static async clearAll(): Promise<void> {
    await Promise.all([
      offlineDB.clear('students'),
      offlineDB.clear('classes'),
      offlineDB.clear('subjects'),
      offlineDB.clear('subjectAssignments'),
      offlineDB.clear('grades'),
      offlineDB.clear('attendance'),
      offlineDB.clear('evaluations'),
      offlineDB.clear('syncQueue'),
    ]);
  }
}

