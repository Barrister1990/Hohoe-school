export type UserRole = 'admin' | 'class_teacher' | 'subject_teacher';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isClassTeacher?: boolean; // For teachers: can be class teacher
  isSubjectTeacher?: boolean; // For teachers: can be subject teacher
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher extends User {
  role: 'class_teacher' | 'subject_teacher';
  assignedClassId?: string; // If class teacher
  assignedSubjects?: string[]; // Subject IDs
  isClassTeacher: boolean;
  isSubjectTeacher: boolean;
}

