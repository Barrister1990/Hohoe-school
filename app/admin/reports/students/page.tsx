'use client';

import { useAlert } from '@/components/shared/AlertProvider';

import { getAcademicYearOptions, getCurrentAcademicYear } from '@/lib/utils/academic-years';
import { Class, Student } from '@/types';
import { ArrowLeft, Calendar, Download, FileText, Filter, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StudentReportsPage() {
  const router = useRouter();
  const { showInfo } = useAlert();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('performance');
  const [academicYear, setAcademicYear] = useState<string>(getCurrentAcademicYear());
  const [term, setTerm] = useState<string>('1');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsRes, classesRes] = await Promise.all([
          fetch('/api/students', { credentials: 'include' }),
          fetch('/api/classes', { credentials: 'include' }),
        ]);

        let studentsData: Student[] = [];
        let classesData: Class[] = [];

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          studentsData = Array.isArray(data) ? data : [];
        }

        if (classesRes.ok) {
          const data = await classesRes.json();
          classesData = Array.isArray(data) ? data : [];
        }

        setStudents(studentsData);
        setClasses(classesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredStudents = students.filter((student) => {
    return selectedClass === 'all' || student.classId === selectedClass;
  });

  const getClassById = (classId: string) => {
    return classes.find((c) => c.id === classId);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // In a real app, this would generate and download a PDF/Excel report
    showInfo(`${format.toUpperCase()} export functionality will be implemented`);
  };

  const reportTypes = [
    { value: 'performance', label: 'Performance Report', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'enrollment', label: 'Enrollment Report', icon: <Users className="h-4 w-4" /> },
    { value: 'demographics', label: 'Demographics Report', icon: <FileText className="h-4 w-4" /> },
    { value: 'attendance', label: 'Attendance Report', icon: <Calendar className="h-4 w-4" /> }
  ];

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
            <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Student Reports</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Generate comprehensive student reports and analytics
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
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-2" />
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
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
              Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            >
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredStudents.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Male</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredStudents.filter((s) => s.gender === 'male').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Female</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredStudents.filter((s) => s.gender === 'female').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Active</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredStudents.filter((s) => s.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Report Data */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            {reportTypes.find((t) => t.value === reportType)?.label || 'Report'}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Academic Year: {academicYear} | Term: {term}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading report data...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No students found for selected filters</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Gender
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Enrollment Date
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const studentClass = getClassById(student.classId);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base font-medium text-gray-900">
                          {student.firstName} {student.middleName} {student.lastName}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {studentClass?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize hidden md:table-cell">
                        {student.gender}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                        {new Date(student.enrollmentDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : student.status === 'transferred'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => router.push(`/admin/students/${student.id}`)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Details
                        </button>
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

