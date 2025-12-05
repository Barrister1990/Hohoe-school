'use client';

import { getAcademicYearOptions, getCurrentAcademicYear } from '@/lib/utils/academic-years';

interface AcademicYearSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  includeFuture?: boolean;
}

export function AcademicYearSelect({ 
  value, 
  onChange, 
  className = '',
  includeFuture = false 
}: AcademicYearSelectProps) {
  const options = getAcademicYearOptions(includeFuture);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

