'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileBarChart, Filter, Download, Calendar } from 'lucide-react';
import { beceService } from '@/lib/services/bece-service';
import { Student } from '@/types';
import { useAlert } from '@/components/shared/AlertProvider';
import { getCurrentAcademicYear, getAcademicYearOptions } from '@/lib/utils/academic-years';

interface BECEResultWithStudent {
  id: string;
  studentId: string;
  student?: Student;
  academicYear: string;
  subject: string;
  grade: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function BECEResultsPage() {
  const router = useRouter();
  const { showError, showInfo } = useAlert();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentAcademicYear());
  const [results, setResults] = useState<BECEResultWithStudent[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [aggregateFilter, setAggregateFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load BECE results
        const beceRes = await fetch(`/api/bece-results?academicYear=${selectedYear}`, { credentials: 'include' });
        if (!beceRes.ok) {
          throw new Error('Failed to load BECE results');
        }
        const beceResults = await beceRes.json();

        // Load all students to get names
        const studentsRes = await fetch('/api/students', { credentials: 'include' });
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          const studentsMap: Record<string, Student> = {};
          studentsData.forEach((student: Student) => {
            studentsMap[student.id] = student;
          });
          setStudents(studentsMap);
        }

        // Combine results with student data
        const resultsWithStudents = beceResults.map((result: any) => ({
          ...result,
          student: students[result.studentId],
          createdAt: result.createdAt ? new Date(result.createdAt) : new Date(),
          updatedAt: result.updatedAt ? new Date(result.updatedAt) : new Date(),
        }));

        setResults(resultsWithStudents);
      } catch (error: any) {
        console.error('Failed to load BECE results:', error);
        showError(error.message || 'Failed to load BECE results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  const handleExport = (format: 'pdf' | 'excel') => {
    showInfo(`${format.toUpperCase()} export functionality will be implemented`);
  };

  // Group results by student
  const resultsByStudent: Record<string, BECEResultWithStudent[]> = {};
  results.forEach((result) => {
    if (!resultsByStudent[result.studentId]) {
      resultsByStudent[result.studentId] = [];
    }
    resultsByStudent[result.studentId].push(result);
  });

  // Calculate aggregates and filter
  const studentAggregates: Record<string, number | null> = {};
  Object.keys(resultsByStudent).forEach((studentId) => {
    studentAggregates[studentId] = beceService.calculateAggregate(resultsByStudent[studentId]);
  });

  // Filter by aggregate
  const filteredStudentIds = Object.keys(resultsByStudent).filter((studentId) => {
    const aggregate = studentAggregates[studentId];
    if (aggregate === null) return aggregateFilter === 'all';
    if (aggregateFilter === 'all') return true;
    if (aggregateFilter === 'excellent') return aggregate <= 12;
    if (aggregateFilter === 'very-good') return aggregate >= 13 && aggregate <= 18;
    if (aggregateFilter === 'good') return aggregate >= 19 && aggregate <= 24;
    if (aggregateFilter === 'fair') return aggregate >= 25 && aggregate <= 30;
    return true;
  });

  // Calculate statistics
  const totalStudents = filteredStudentIds.length;
  const aggregates = filteredStudentIds
    .map((id) => studentAggregates[id])
    .filter((agg): agg is number => agg !== null);
  const averageAggregate = aggregates.length > 0
    ? (aggregates.reduce((sum, agg) => sum + agg, 0) / aggregates.length).toFixed(1)
    : '0';
  const excellentResults = aggregates.filter((agg) => agg <= 12).length;
  const passRate = totalStudents > 0 ? '100%' : '0%'; // All graduated students passed

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-semibold text-gray-900 flex items-center gap-2">
              <FileBarChart className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              BECE Results
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              View and analyze Basic Education Certificate Examination results
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            >
              {getAcademicYearOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Filter by Aggregate
            </label>
            <select
              value={aggregateFilter}
              onChange={(e) => setAggregateFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            >
              <option value="all">All Results</option>
              <option value="excellent">Excellent (6-12)</option>
              <option value="very-good">Very Good (13-18)</option>
              <option value="good">Good (19-24)</option>
              <option value="fair">Fair (25-30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Average Aggregate</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">{averageAggregate}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Excellent Results</p>
          <p className="text-xl md:text-2xl font-semibold text-green-600">
            {excellentResults} ({totalStudents > 0 ? Math.round((excellentResults / totalStudents) * 100) : 0}%)
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Pass Rate</p>
          <p className="text-xl md:text-2xl font-semibold text-blue-600">{passRate}</p>
        </div>
      </div>

      {/* BECE Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            BECE Results - {selectedYear}
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading BECE results...</div>
        ) : filteredStudentIds.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileBarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No BECE results found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Subjects & Grades
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Aggregate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudentIds.map((studentId) => {
                  const student = students[studentId];
                  const studentResults = resultsByStudent[studentId];
                  const aggregate = studentAggregates[studentId];
                  
                  return (
                    <tr key={studentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base font-medium text-gray-900">
                          {student 
                            ? `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()
                            : `Student ${studentId.substring(0, 8)}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student?.studentId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {studentResults.map((result) => (
                            <span
                              key={result.id}
                              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                            >
                              {result.subject}: {result.grade}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        {aggregate !== null ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            aggregate <= 12 
                              ? 'bg-green-100 text-green-800' 
                              : aggregate <= 18
                              ? 'bg-blue-100 text-blue-800'
                              : aggregate <= 24
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {aggregate}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            N/A
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

