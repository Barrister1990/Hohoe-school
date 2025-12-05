'use client';

import { useAlert } from '@/components/shared/AlertProvider';

import { Class, Student } from '@/types';
import { ArrowLeft, Calendar, Download, Filter, School, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClassReportsPage() {
  const router = useRouter();
  const { showInfo } = useAlert();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('overview');
  const [academicYear, setAcademicYear] = useState<string>('2024/2025');
  const [term, setTerm] = useState<string>('1');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesRes, studentsRes] = await Promise.all([
          fetch('/api/classes', { credentials: 'include' }),
          fetch('/api/students', { credentials: 'include' }),
        ]);

        let classesData: Class[] = [];
        let studentsData: Student[] = [];

        if (classesRes.ok) {
          const data = await classesRes.json();
          classesData = Array.isArray(data) ? data : [];
        }

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          studentsData = Array.isArray(data) ? data : [];
        }

        setClasses(classesData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStudentsByClass = (classId: string) => {
    return students.filter((s) => s.classId === classId);
  };

  const filteredClasses = selectedClass === 'all' 
    ? classes 
    : classes.filter((c) => c.id === selectedClass);

  const handleExport = (format: 'pdf' | 'excel') => {
    showInfo(`${format.toUpperCase()} export functionality will be implemented`);
  };

  const reportTypes = [
    { value: 'overview', label: 'Class Overview', icon: <School className="h-4 w-4" /> },
    { value: 'performance', label: 'Performance Report', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'distribution', label: 'Student Distribution', icon: <Users className="h-4 w-4" /> },
    { value: 'comparison', label: 'Class Comparison', icon: <Filter className="h-4 w-4" /> }
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
            <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Class Reports</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Generate comprehensive class reports and analytics
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
              <School className="h-4 w-4 inline mr-2" />
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
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2024/2025"
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            />
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
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Classes</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredClasses.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredClasses.reduce((sum, cls) => sum + getStudentsByClass(cls.id).length, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Average per Class</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredClasses.length > 0
              ? Math.round(
                  filteredClasses.reduce((sum, cls) => sum + getStudentsByClass(cls.id).length, 0) /
                    filteredClasses.length
                )
              : 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Capacity Used</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredClasses.length > 0
              ? Math.round(
                  (filteredClasses.reduce((sum, cls) => sum + getStudentsByClass(cls.id).length, 0) /
                    filteredClasses.reduce((sum, cls) => sum + cls.capacity, 0)) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Class Report Data */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            {reportTypes.find((t) => t.value === reportType)?.label || 'Class Report'}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Academic Year: {academicYear} | Term: {term}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading report data...</div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No classes found for selected filters</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Capacity
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Class Teacher
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((cls) => {
                  const classStudents = getStudentsByClass(cls.id);
                  const capacityPercentage = cls.capacity > 0 
                    ? Math.round((classStudents.length / cls.capacity) * 100) 
                    : 0;
                  
                  return (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base font-medium text-gray-900">
                          {cls.name}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          Level {cls.level}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {classStudents.length}
                          </span>
                          <div className="w-16 md:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                capacityPercentage >= 90
                                  ? 'bg-red-500'
                                  : capacityPercentage >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                        {classStudents.length} / {cls.capacity}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                        {cls.classTeacherId ? 'Assigned' : 'Not Assigned'}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => router.push(`/admin/classes/${cls.id}`)}
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

