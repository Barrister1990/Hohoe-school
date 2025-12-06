/**
 * Class Teacher Evaluation Types
 * These are evaluations that class teachers can provide for each student
 * 
 * Note: Attendance is entered manually as a summary, not daily marking
 */

export type ConductRating = 'Respectful' | 'Obedience' | 'Hardworking' | 'Dutiful' | 'Humble' | 'Calm' | 'Approachable' | 'Unruly';
export type InterestLevel = 'Artwork' | 'Reading' | 'Football' | 'Athletics' | 'Music' | 'Computing Skills';
export type ClassTeacherRemarks = 'Dutiful' | 'Dutiful. Well done. Keep it up' | 'Keep it up' | 'Has improved' | 'Could do better' | 'More room for improvement' | 'Very positive in the class' | 'Very courteous' | 'Conduct well in class';

export interface ClassTeacherReward {
  id: string;
  studentId: string;
  classId: string;
  term: 1 | 2 | 3;
  academicYear: string;
  rewardType: 'merit' | 'achievement' | 'participation' | 'leadership' | 'improvement' | 'other';
  description: string;
  date: Date;
  awardedBy: string; // Class teacher ID
  synced: boolean;
  createdAt: Date;
}

export interface ClassTeacherEvaluation {
  id: string;
  studentId: string;
  classId: string;
  classTeacherId: string;
  term: 1 | 2 | 3;
  academicYear: string;
  
  // Attendance summary for the term (manually entered by class teacher)
  attendanceSummary: {
    totalDays: number;           // Total school days in term
    presentDays: number;         // Days student was present
    absentDays: number;          // Days student was absent
    lateDays: number;            // Days student was late
    excusedDays: number;         // Days student was excused
    attendancePercentage: number; // Calculated: (presentDays / totalDays) * 100
  };
  
  // Conduct rating
  conduct: ConductRating;
  conductRemarks?: string;
  
  // Interest level
  interest: InterestLevel;
  interestRemarks?: string;
  
  // Class teacher remarks
  classTeacherRemarks?: ClassTeacherRemarks;
  
  // Rewards earned in this term
  rewards: string[]; // Reward IDs
  
  // General remarks (deprecated - use classTeacherRemarks instead)
  remarks?: string;
  
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Note: Class teachers and Subject teachers both use the same standard assessment structure.
 * See types/assessment-structure.ts for the shared structure.
 */

