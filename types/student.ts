export type StudentStatus = 'active' | 'transferred' | 'graduated';
export type Gender = 'male' | 'female';

export interface Student {
  id: string;
  studentId: string; // Unique school ID
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: Gender;
  classId: string;
  classTeacherId: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  enrollmentDate: Date;
  status: StudentStatus;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

