export type SubjectCategory = 'core' | 'elective';
export type SubjectLevelCategory = 'KG' | 'Lower Primary' | 'Upper Primary' | 'JHS';

export interface Subject {
  id: string;
  name: string; // e.g., "Mathematics"
  code: string; // e.g., "MATH"
  category: SubjectCategory;
  levelCategories: SubjectLevelCategory[]; // Can belong to multiple level categories
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  createdAt: Date;
}

