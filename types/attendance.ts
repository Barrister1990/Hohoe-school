export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: AttendanceStatus;
  markedBy: string; // Teacher ID
  remarks?: string;
  synced: boolean;
  createdAt: Date;
}

