export type Term = 1 | 2 | 3;

export interface Class {
  id: string;
  name: string; // e.g., "KG 1A", "Basic 1A"
  level: number; // 0-10 (KG 1=0, KG 2=1, Basic 1=2, ..., Basic 9=10)
  stream?: string; // A, B, C, etc.
  classTeacherId: string;
  academicYear: string; // e.g., "2024/2025"
  term: Term;
  studentCount: number;
  capacity: number;
  subjects: string[]; // Subject IDs
  createdAt: Date;
  updatedAt: Date;
}

