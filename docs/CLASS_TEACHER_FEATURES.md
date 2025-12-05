# Class Teacher Features

## Overview

Class teachers have additional capabilities beyond basic class management. They can provide comprehensive evaluations for each student including attendance tracking, conduct ratings, interest levels, rewards, and standardized grading.

## Features

### 1. Attendance Summary Entry

Class teachers manually enter attendance summary for each student per term (not daily marking).

**Attendance Summary Fields:**
- Total Days: Total school days in the term
- Present Days: Number of days student was present
- Absent Days: Number of days student was absent
- Late Days: Number of days student was late
- Excused Days: Number of days student was excused
- Attendance Percentage: Automatically calculated as (Present Days / Total Days) × 100

**Features:**
- Enter attendance summary manually per term
- System automatically calculates attendance percentage
- View attendance history across terms
- Generate attendance reports

### 2. Student Conduct Rating

Class teachers can rate each student's conduct for each term.

**Conduct Ratings:**
- Excellent
- Very Good
- Good
- Satisfactory
- Needs Improvement

**Features:**
- Assign conduct rating per term
- Add remarks/notes about conduct
- View conduct history
- Track conduct trends

### 3. Student Interest Level

Class teachers can assess and record each student's interest level in learning.

**Interest Levels:**
- Very High
- High
- Moderate
- Low
- Very Low

**Features:**
- Assess interest level per term
- Add remarks about interest
- Track interest changes over time
- Identify students needing motivation

### 4. Class Teacher Rewards

Class teachers can award rewards to students for various achievements.

**Reward Types:**
- Merit
- Achievement
- Participation
- Leadership
- Improvement
- Other

**Features:**
- Award rewards to students
- Add description for each reward
- View reward history
- Track student achievements

### 5. Class Teacher Grading

Class teachers use the **standard assessment structure** (same as Subject Teachers) for grading students.

**Standard Assessment Structure:**
- **Project**: 40 marks
- **Test 1**: 20 marks
- **Test 2**: 20 marks
- **Group Work**: 20 marks
- **Exam**: 100 marks

**Total**: 200 marks

**Note**: This same structure is used by Subject Teachers for their subject grading.

**Features:**
- Enter grades for each assessment type
- Automatic calculation of total score
- Automatic grade letter assignment (A-F)
- View grade history
- Generate grade reports

## Data Models

### Class Teacher Evaluation

```typescript
interface ClassTeacherEvaluation {
  id: string;
  studentId: string;
  classId: string;
  classTeacherId: string;
  term: 1 | 2 | 3;
  academicYear: string;
  
  // Attendance summary
  attendanceSummary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendancePercentage: number;
  };
  
  // Conduct
  conduct: 'excellent' | 'very_good' | 'good' | 'satisfactory' | 'needs_improvement';
  conductRemarks?: string;
  
  // Interest
  interest: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
  interestRemarks?: string;
  
  // Rewards
  rewards: string[]; // Reward IDs
  
  // Remarks
  remarks?: string;
  
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Class Teacher Reward

```typescript
interface ClassTeacherReward {
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
```

## Assessment Structure

### Standard Assessment Breakdown

**Used by both Class Teachers and Subject Teachers** for grading:

| Assessment Type | Marks | Weight |
|----------------|-------|--------|
| Project | 40 | Variable |
| Test 1 | 20 | Variable |
| Test 2 | 20 | Variable |
| Group Work | 20 | Variable |
| Exam | 100 | Variable |
| **Total** | **200** | 100% |

**Note**: The weight for each assessment type can be configured, but the marks are standardized.

### Grade Calculation

1. Each assessment is scored out of its maximum marks
2. Scores are weighted according to their weight percentage
3. Total score is calculated: `(Project × weight) + (Test1 × weight) + (Test2 × weight) + (GroupWork × weight) + (Exam × weight)`
4. Final percentage: `(Total Score / Total Max Score) × 100`
5. Grade letter assigned based on percentage:
   - A: 80-100%
   - B: 70-79%
   - C: 60-69%
   - D: 50-59%
   - E: 40-49%
   - F: Below 40%

## User Interface

### Attendance Summary Entry Screen

- List of all students in class
- For each student, input fields:
  - Total Days (number input)
  - Present Days (number input)
  - Absent Days (number input)
  - Late Days (number input)
  - Excused Days (number input)
  - Attendance Percentage (auto-calculated, read-only)
- Validation: Present + Absent + Late + Excused = Total Days
- Save button to save all entries
- View attendance history across terms

### Student Evaluation Screen

- Student profile card
- Tabs for:
  - Attendance Summary (manual entry form and history)
  - Conduct (rating and remarks)
  - Interest (level and remarks)
  - Rewards (list and add new)
  - Grades (standard assessment breakdown)
- Save/Update button

### Grade Entry Screen

- Student list
- Assessment type selector
- Score input for each assessment
- Automatic calculation display
- Bulk entry option
- Save button

## Workflow

### Term Evaluation Workflow

1. **Throughout Term**: Award rewards as needed
2. **End of Term**:
   - Enter attendance summary manually (total days, present, absent, late, excused)
   - System calculates attendance percentage automatically
   - Enter grades for all assessments (Project, Test1, Test2, Group Work, Exam)
   - Assign conduct rating
   - Assess interest level
   - Add general remarks
   - Generate evaluation report

### Grade Entry Workflow

1. Select assessment type (Project, Test1, Test2, Group Work, Exam)
2. Enter scores for each student
3. System calculates:
   - Percentage for each assessment
   - Total score
   - Final percentage
   - Grade letter
4. Review and save

## Reports

### Student Evaluation Report

Includes:
- Attendance summary and percentage
- Conduct rating and remarks
- Interest level and remarks
- List of rewards earned
- Grade breakdown and final grade
- General remarks

### Class Summary Report

Includes:
- Overall class attendance statistics
- Conduct distribution
- Interest level distribution
- Reward statistics
- Grade distribution
- Top performers

## Permissions

- Only class teachers can:
  - Mark attendance for their assigned class
  - Create evaluations for their students
  - Award rewards to their students
  - Enter grades using the class teacher assessment structure

- Admins can:
  - View all evaluations
  - Edit evaluations (if needed)
  - Generate reports

## Integration

### With Subject Teacher Grades

- Class teacher grades are separate from subject teacher grades
- Both appear on student report cards
- Class teacher grades focus on overall performance and behavior
- Subject teacher grades focus on subject-specific performance

### With Attendance System

- Daily attendance feeds into term attendance summary
- Attendance percentage calculated automatically
- Attendance history available for review

---

**Last Updated**: Initial documentation  
**Status**: Feature specification complete

