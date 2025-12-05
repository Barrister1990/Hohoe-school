/**
 * Standard Assessment Structure
 * Used by BOTH Class Teachers and Subject Teachers for grading
 * 
 * Project: 40 marks
 * Test 1: 20 marks
 * Test 2: 20 marks
 * Group Work: 20 marks
 * Exam: 100 marks
 * Total: 200 marks
 */

export interface StandardAssessmentStructure {
  project: {
    maxScore: 40;
    weight: number; // Percentage of total (default: 20%)
  };
  test1: {
    maxScore: 20;
    weight: number; // Percentage of total (default: 10%)
  };
  test2: {
    maxScore: 20;
    weight: number; // Percentage of total (default: 10%)
  };
  groupWork: {
    maxScore: 20;
    weight: number; // Percentage of total (default: 10%)
  };
  exam: {
    maxScore: 100;
    weight: number; // Percentage of total (default: 50%)
  };
}

/**
 * Default weights for standard assessment structure
 */
export const DEFAULT_ASSESSMENT_WEIGHTS: StandardAssessmentStructure = {
  project: {
    maxScore: 40,
    weight: 20, // 20% of total grade
  },
  test1: {
    maxScore: 20,
    weight: 10, // 10% of total grade
  },
  test2: {
    maxScore: 20,
    weight: 10, // 10% of total grade
  },
  groupWork: {
    maxScore: 20,
    weight: 10, // 10% of total grade
  },
  exam: {
    maxScore: 100,
    weight: 50, // 50% of total grade
  },
};

