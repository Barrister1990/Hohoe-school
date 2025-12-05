'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Search, Filter, FileBarChart, Eye } from 'lucide-react';
import { Student } from '@/types';
import { beceService } from '@/lib/services/bece-service';
import { useAlert } from '@/components/shared/AlertProvider';

export default function GraduatedStudentsPage() {
  const router = useRouter();
  const { showError } = useAlert();
  const [students, setStudents] = useState<Student[]>([]);
  const [beceAggregates, setBeceAggregates] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load graduated students
        const res = await fetch('/api/students/graduated', { credentials: 'include' });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to load graduated students');
        }
        const graduatedStudents = await res.json();
        setStudents(Array.isArray(graduatedStudents) ? graduatedStudents : []);

        // Load BECE results for aggregates
        const beceRes = await fetch('/api/bece-results', { credentials: 'include' });
        if (beceRes.ok) {
          const beceResults = await beceRes.json();
          const aggregates: Record<string, number | null> = {};
          
          // Group results by student
          const grouped: Record<string, any[]> = {};
          beceResults.forEach((result: any) => {
            if (!grouped[result.studentId]) {
              grouped[result.studentId] = [];
            }
            grouped[result.studentId].push(result);
          });

          // Calculate aggregates
          Object.keys(grouped).forEach((studentId) => {
            aggregates[studentId] = beceService.calculateAggregate(grouped[studentId]);
          });

          setBeceAggregates(aggregates);
        }
      } catch (error: any) {
        console.error('Failed to load graduated students:', error);
        showError(error.message || 'Failed to load graduated students. Please try again.');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique graduation years from students (we'll need to track this in the future)
  const graduationYears = Array.from(
    new Set(students.map((s) => '2024/2025')) // Placeholder - should come from graduation date
  );

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchQuery === '' ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${student.firstName} ${student.middleName || ''} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    
    // Filter by year (placeholder - should filter by actual graduation year)
    const matchesYear = selectedYear === 'all' || true; // TODO: Implement year filtering
    
    return matchesSearch && matchesYear;
  });

  // Calculate statistics
  const studentsWithBECE = Object.keys(beceAggregates).length;
  const totalAggregate = Object.values(beceAggregates)
    .filter((agg): agg is number => agg !== null)
    .reduce((sum, agg) => sum + agg, 0);
  const averageAggregate = studentsWithBECE > 0 
    ? (totalAggregate / studentsWithBECE).toFixed(1)
    : '0';
  const topPerformers = Object.values(beceAggregates)
    .filter((agg): agg is number => agg !== null && agg <= 12).length;

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            Graduated Students
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            View and manage graduated students and their BECE results
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-2" />
              Search Students
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or student ID..."
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Graduation Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            >
              <option value="all">All Years</option>
              {graduationYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Graduated</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredStudents.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">With BECE Results</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {studentsWithBECE}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Average Aggregate</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">{averageAggregate}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Top Performers (≤12)</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {topPerformers}
          </p>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Graduated Students</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading graduated students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No graduated students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Student ID
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Graduation Year
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    BECE Aggregate
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm md:text-base font-medium text-gray-900 truncate">
                            {student.firstName} {student.middleName} {student.lastName}
                          </div>
                          <div className="text-xs text-gray-500 md:hidden">
                            {student.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                      {student.studentId}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                      {/* TODO: Get actual graduation year from student record */}
                      2024/2025
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      {beceAggregates[student.id] !== null && beceAggregates[student.id] !== undefined ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          beceAggregates[student.id]! <= 12 
                            ? 'bg-green-100 text-green-800' 
                            : beceAggregates[student.id]! <= 18
                            ? 'bg-blue-100 text-blue-800'
                            : beceAggregates[student.id]! <= 24
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {beceAggregates[student.id]}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

