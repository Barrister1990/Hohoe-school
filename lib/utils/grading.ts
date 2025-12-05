/**
 * Grading Utilities
 * Centralized functions for grade calculations
 */

import { DEFAULT_GRADING_SYSTEM, getGradeFromPercentage, GradingSystem } from '@/types/grading-system';

let currentGradingSystem: GradingSystem = DEFAULT_GRADING_SYSTEM;

/**
 * Set the active grading system
 */
export function setGradingSystem(system: GradingSystem) {
  currentGradingSystem = system;
}

/**
 * Get the active grading system
 */
export function getGradingSystem(): GradingSystem {
  return currentGradingSystem;
}

/**
 * Calculate grade from percentage using the active grading system
 */
export function calculateGrade(percentage: number): string {
  return getGradeFromPercentage(percentage, currentGradingSystem);
}

/**
 * Get grade level details from percentage
 */
export function getGradeLevel(percentage: number) {
  const gradeLevel = currentGradingSystem.gradeLevels.find(
    (level) => percentage >= level.minPercentage && percentage <= level.maxPercentage
  );
  return gradeLevel || currentGradingSystem.gradeLevels[currentGradingSystem.gradeLevels.length - 1];
}

/**
 * Get grade color class for UI
 */
export function getGradeColorClass(gradeCode: string): string {
  switch (gradeCode) {
    case 'HP':
      return 'bg-green-100 text-green-800';
    case 'P':
      return 'bg-blue-100 text-blue-800';
    case 'AP':
      return 'bg-yellow-100 text-yellow-800';
    case 'D':
      return 'bg-orange-100 text-orange-800';
    case 'E':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

