/**
 * Academic Year Utilities
 * Generates academic years dynamically based on current year
 * Format: YYYY/YYYY (e.g., 2024/2025)
 */

/**
 * Get the current academic year based on current date
 * Academic year runs from September to August
 * If current month is September-December, it's the start of a new academic year
 * If current month is January-August, it's the continuation of the previous academic year
 */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Academic year starts in September (month 9)
  // If we're in September-December, we're in the new academic year
  // If we're in January-August, we're still in the previous academic year
  if (currentMonth >= 9) {
    // September-December: Current year to next year
    return `${currentYear}/${currentYear + 1}`;
  } else {
    // January-August: Previous year to current year
    return `${currentYear - 1}/${currentYear}`;
  }
}

/**
 * Generate list of academic years
 * Returns: Past 5 years + current year (6 total)
 * When next year comes, it will automatically be: Past 6 years + current year (7 total)
 * 
 * @param includeFuture - Whether to include next academic year (default: false)
 * @returns Array of academic years in format "YYYY/YYYY", sorted chronologically (oldest first)
 */
export function getAcademicYears(includeFuture: boolean = false): string[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Determine the current academic year's start year
  let startYear: number;
  if (currentMonth >= 9) {
    // September-December: Current year is the start year
    startYear = currentYear;
  } else {
    // January-August: Previous year is the start year
    startYear = currentYear - 1;
  }

  const academicYears: string[] = [];
  
  // Generate past 5 years + current year (6 total)
  // When next year comes, it becomes past 6 + current (7 total) automatically
  for (let i = 5; i >= 0; i--) {
    const year = startYear - i;
    academicYears.push(`${year}/${year + 1}`);
  }

  // Optionally include next academic year
  if (includeFuture) {
    const nextYear = startYear + 1;
    academicYears.push(`${nextYear}/${nextYear + 1}`);
  }

  return academicYears;
}

/**
 * Get academic year options for select dropdowns
 * Returns array of { value, label } objects
 */
export function getAcademicYearOptions(includeFuture: boolean = false): Array<{ value: string; label: string }> {
  return getAcademicYears(includeFuture).map(year => ({
    value: year,
    label: year,
  }));
}

/**
 * Parse academic year string to get start and end years
 * @param academicYear - Academic year in format "YYYY/YYYY"
 * @returns Object with startYear and endYear
 */
export function parseAcademicYear(academicYear: string): { startYear: number; endYear: number } {
  const [start, end] = academicYear.split('/').map(Number);
  return { startYear: start, endYear: end };
}

/**
 * Format year to academic year format
 * @param startYear - Start year (e.g., 2024)
 * @returns Academic year string (e.g., "2024/2025")
 */
export function formatAcademicYear(startYear: number): string {
  return `${startYear}/${startYear + 1}`;
}

/**
 * Check if an academic year is in the past
 * @param academicYear - Academic year in format "YYYY/YYYY"
 * @returns true if the academic year is in the past
 */
export function isPastAcademicYear(academicYear: string): boolean {
  const current = getCurrentAcademicYear();
  const { startYear: currentStart } = parseAcademicYear(current);
  const { startYear: checkStart } = parseAcademicYear(academicYear);
  return checkStart < currentStart;
}

/**
 * Check if an academic year is the current one
 * @param academicYear - Academic year in format "YYYY/YYYY"
 * @returns true if the academic year is the current one
 */
export function isCurrentAcademicYear(academicYear: string): boolean {
  return academicYear === getCurrentAcademicYear();
}

