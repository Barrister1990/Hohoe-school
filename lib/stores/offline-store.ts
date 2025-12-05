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
// Lazy initialization - only initialize on client side
let offlineDBInstance: IndexedDBManager | null = null;

const getOfflineDB = (): IndexedDBManager => {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB can only be used in the browser. Make sure to call this only in client components.');
  }
  
  if (!offlineDBInstance) {
    offlineDBInstance = IndexedDBManager.getInstance(DB_CONFIG);
  }
  
  return offlineDBInstance;
};

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
    const db = getOfflineDB();
    await db.putAll('students', students);
  }

  static async getStudents(): Promise<Student[]> {
    const db = getOfflineDB();
    return db.getAll<Student>('students');
  }

  static async getStudentsByClass(classId: string): Promise<Student[]> {
    const db = getOfflineDB();
    return db.getByIndex<Student>('students', 'classId', classId);
  }

  static async getStudent(id: string): Promise<Student | undefined> {
    const db = getOfflineDB();
    return db.get<Student>('students', id);
  }

  static async saveStudent(student: Student): Promise<void> {
    const db = getOfflineDB();
    await db.put('students', student);
  }

  /**
   * Classes
   */
  static async saveClasses(classes: Class[]): Promise<void> {
    const db = getOfflineDB();
    await db.putAll('classes', classes);
  }

  static async getClasses(): Promise<Class[]> {
    const db = getOfflineDB();
    return db.getAll<Class>('classes');
  }

  static async getClass(id: string): Promise<Class | undefined> {
    const db = getOfflineDB();
    return db.get<Class>('classes', id);
  }

  /**
   * Subjects
   */
  static async saveSubjects(subjects: Subject[]): Promise<void> {
    const db = getOfflineDB();
    await db.putAll('subjects', subjects);
  }

  static async getSubjects(): Promise<Subject[]> {
    const db = getOfflineDB();
    return db.getAll<Subject>('subjects');
  }

  static async getSubject(id: string): Promise<Subject | undefined> {
    const db = getOfflineDB();
    return db.get<Subject>('subjects', id);
  }

  /**
   * Subject Assignments
   */
  static async saveSubjectAssignments(assignments: any[]): Promise<void> {
    const db = getOfflineDB();
    await db.putAll('subjectAssignments', assignments);
  }

  static async getSubjectAssignments(): Promise<any[]> {
    const db = getOfflineDB();
    return db.getAll('subjectAssignments');
  }

  static async getSubjectAssignmentsByTeacher(teacherId: string): Promise<any[]> {
    const db = getOfflineDB();
    return db.getByIndex('subjectAssignments', 'teacherId', teacherId);
  }

  /**
   * Grades
   */
  static async saveGrade(grade: any): Promise<void> {
    const db = getOfflineDB();
    await db.put('grades', {
      ...grade,
      syncStatus: 'pending' as SyncStatus,
      updatedAt: Date.now(),
    });
  }

  static async getGrades(): Promise<any[]> {
    const db = getOfflineDB();
    return db.getAll('grades');
  }

  static async getGradesByStudent(studentId: string): Promise<any[]> {
    const db = getOfflineDB();
    return db.getByIndex('grades', 'studentId', studentId);
  }

  static async getPendingGrades(): Promise<any[]> {
    const db = getOfflineDB();
    return db.getByIndex('grades', 'syncStatus', 'pending');
  }

  /**
   * Attendance
   */
  static async saveAttendance(attendance: any): Promise<void> {
    const db = getOfflineDB();
    await db.put('attendance', {
      ...attendance,
      syncStatus: 'pending' as SyncStatus,
      updatedAt: Date.now(),
    });
  }

  static async getAttendance(): Promise<any[]> {
    const db = getOfflineDB();
    return db.getAll('attendance');
  }

  static async getAttendanceByStudent(studentId: string): Promise<any[]> {
    const db = getOfflineDB();
    return db.getByIndex('attendance', 'studentId', studentId);
  }

  static async getPendingAttendance(): Promise<any[]> {
    const db = getOfflineDB();
    return db.getByIndex('attendance', 'syncStatus', 'pending');
  }

  /**
   * Evaluations
   */
  static async saveEvaluation(evaluation: any): Promise<void> {
    const db = getOfflineDB();
    await db.put('evaluations', {
      ...evaluation,
      syncStatus: 'pending' as SyncStatus,
      updatedAt: Date.now(),
    });
  }

  static async getEvaluations(): Promise<any[]> {
    const db = getOfflineDB();
    return db.getAll('evaluations');
  }

  static async getEvaluationsByStudent(studentId: string): Promise<any[]> {
    const db = getOfflineDB();
    return db.getByIndex('evaluations', 'studentId', studentId);
  }

  static async getPendingEvaluations(): Promise<any[]> {
    const db = getOfflineDB();
    return db.getByIndex('evaluations', 'syncStatus', 'pending');
  }

  /**
   * Sync Queue
   */
  static async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = getOfflineDB();
    const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queueItem: SyncQueueItem = {
      ...item,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.put('syncQueue', queueItem);
    return id;
  }

  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = getOfflineDB();
    return db.getAll<SyncQueueItem>('syncQueue');
  }

  static async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const db = getOfflineDB();
    return db.getByIndex<SyncQueueItem>('syncQueue', 'status', 'pending');
  }

  static async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const db = getOfflineDB();
    const item = await db.get<SyncQueueItem>('syncQueue', id);
    if (item) {
      await db.put('syncQueue', {
        ...item,
        ...updates,
        updatedAt: Date.now(),
      });
    }
  }

  static async removeSyncQueueItem(id: string): Promise<void> {
    const db = getOfflineDB();
    await db.delete('syncQueue', id);
  }

  /**
   * Clear all data (for testing/logout)
   */
  static async clearAll(): Promise<void> {
    const db = getOfflineDB();
    await Promise.all([
      db.clear('students'),
      db.clear('classes'),
      db.clear('subjects'),
      db.clear('subjectAssignments'),
      db.clear('grades'),
      db.clear('attendance'),
      db.clear('evaluations'),
      db.clear('syncQueue'),
    ]);
  }
}

