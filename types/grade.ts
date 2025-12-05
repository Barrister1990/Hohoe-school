export type AssessmentType = 
  | 'project'      // 40 marks
  | 'test1'         // 20 marks
  | 'test2'         // 20 marks
  | 'group_work'    // 20 marks
  | 'exam'          // 100 marks
  | 'exercise'      // For other exercises
  | 'test'          // Generic test
  | 'mid_term';     // Mid-term test

export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Assessment {
  id: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  name: string; // e.g., "Mid-term Test"
  type: AssessmentType;
  maxScore: number;
  weight: number; // Percentage of total grade
  date: Date;
  term: 1 | 2 | 3;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  assessmentId: string;
  subjectId: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: GradeLetter;
  remarks?: string;
  teacherId: string;
  date: Date;
  synced: boolean; // For offline sync
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeSummary {
  studentId: string;
  subjectId: string;
  term: 1 | 2 | 3;
  academicYear: string;
  totalScore: number;
  maxTotalScore: number;
  average: number;
  finalGrade: GradeLetter;
  assessments: string[]; // Assessment IDs
}

