# Standard Assessment Structure

## Overview

Both **Class Teachers** and **Subject Teachers** use the same standardized assessment structure for grading students. This ensures consistency across all subjects and evaluations.

## Assessment Breakdown

| Assessment Type | Maximum Marks | Default Weight | Description |
|-----------------|--------------|----------------|-------------|
| **Project** | 40 | 20% | Individual or group projects |
| **Test 1** | 20 | 10% | First test/quiz of the term |
| **Test 2** | 20 | 10% | Second test/quiz of the term |
| **Group Work** | 20 | 10% | Collaborative assignments |
| **Exam** | 100 | 50% | End-of-term examination |
| **Total** | **200** | **100%** | Complete assessment |

## Grade Calculation

### Step-by-Step Process

1. **Individual Assessment Scoring**
   - Each assessment is scored out of its maximum marks
   - Example: Student scores 35/40 on Project

2. **Weighted Score Calculation**
   - Each assessment's score is multiplied by its weight percentage
   - Example: Project = (35/40) × 20% = 17.5%

3. **Total Score Calculation**
   ```
   Total Score = (Project Score × Project Weight) +
                 (Test1 Score × Test1 Weight) +
                 (Test2 Score × Test2 Weight) +
                 (Group Work Score × Group Work Weight) +
                 (Exam Score × Exam Weight)
   ```

4. **Final Percentage**
   ```
   Final Percentage = (Total Score / 200) × 100
   ```

5. **Grade Letter Assignment**
   - A: 80-100%
   - B: 70-79%
   - C: 60-69%
   - D: 50-59%
   - E: 40-49%
   - F: Below 40%

### Example Calculation

**Student Scores:**
- Project: 35/40
- Test 1: 18/20
- Test 2: 16/20
- Group Work: 18/20
- Exam: 85/100

**Weighted Calculation:**
- Project: (35/40) × 20% = 17.5%
- Test 1: (18/20) × 10% = 9%
- Test 2: (16/20) × 10% = 8%
- Group Work: (18/20) × 10% = 9%
- Exam: (85/100) × 50% = 42.5%

**Total Score:** 17.5 + 9 + 8 + 9 + 42.5 = **86%**

**Final Grade:** **A** (86% falls in 80-100% range)

## Usage

### For Class Teachers

Class teachers use this structure to grade their assigned class. The grades reflect overall student performance and behavior in the class context.

### For Subject Teachers

Subject teachers use this same structure for each subject they teach. Each subject has its own set of assessments following this structure.

### Multiple Subjects

When a student has multiple subjects:
- Each subject is graded independently using this structure
- Each subject has its own Project, Test1, Test2, Group Work, and Exam
- Final report card shows grades for all subjects

## Configuration

### Default Weights

The default weights are:
- Project: 20%
- Test 1: 10%
- Test 2: 10%
- Group Work: 10%
- Exam: 50%

### Customizable Weights

While the marks are standardized (40, 20, 20, 20, 100), the weights can be adjusted per subject or term if needed. However, weights must always sum to 100%.

## Data Model

```typescript
interface StandardAssessmentStructure {
  project: {
    maxScore: 40;
    weight: number; // Default: 20
  };
  test1: {
    maxScore: 20;
    weight: number; // Default: 10
  };
  test2: {
    maxScore: 20;
    weight: number; // Default: 10
  };
  groupWork: {
    maxScore: 20;
    weight: number; // Default: 10
  };
  exam: {
    maxScore: 100;
    weight: number; // Default: 50
  };
}
```

## Assessment Types

The assessment types are defined as:

- `project` - Project (40 marks)
- `test1` - Test 1 (20 marks)
- `test2` - Test 2 (20 marks)
- `group_work` - Group Work (20 marks)
- `exam` - Exam (100 marks)

Additional types for backward compatibility:
- `exercise` - General exercises
- `test` - Generic tests
- `mid_term` - Mid-term tests

## Implementation Notes

1. **Consistency**: All teachers (class and subject) use the same structure
2. **Flexibility**: Weights can be adjusted, but marks are fixed
3. **Calculation**: System automatically calculates totals and grade letters
4. **Validation**: System ensures weights sum to 100%
5. **Reporting**: All reports use this standardized structure

## Academic Year Format

Academic years follow the format: **YYYY/YYYY**

Examples:
- 2024/2025
- 2025/2026
- 2026/2027

The format represents the academic year spanning two calendar years (e.g., September 2024 to August 2025 = 2024/2025).

## Terms

Each academic year has 3 terms:
- **Term 1**: September - December
- **Term 2**: January - April
- **Term 3**: May - August

Each term uses the same assessment structure.

---

**Last Updated**: Initial documentation  
**Status**: Standard structure defined

