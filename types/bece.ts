export interface BECEResult {
  id: string;
  studentId: string;
  subject: string;
  grade: string; // e.g., "A", "B", "C", "D", "E", "F"
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BECERecord {
  id: string;
  studentId: string;
  academicYear: string; // Year of graduation
  results: BECEResult[];
  createdAt: Date;
  updatedAt: Date;
}

