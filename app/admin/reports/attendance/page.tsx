'use client';

import { useAlert } from '@/components/shared/AlertProvider';

import { getAcademicYearOptions, getCurrentAcademicYear } from '@/lib/utils/academic-years';
import { Class, Student } from '@/types';
import { ArrowLeft, Calendar, Download, FileBarChart, Filter, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AttendanceReportsPage() {
  const router = useRouter();
  const { showInfo } = useAlert();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classStats, setClassStats] = useState<Map<string, {
    totalStudents: number;
    averageAttendance: number;
    totalDays: number;
    presentDays: number;
    absentDays: number;
  }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('summary');
  const [academicYear, setAcademicYear] = useState<string>(getCurrentAcademicYear());
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

  // Load attendance stats for all classes
  useEffect(() => {
    const loadAttendanceStats = async () => {
      if (classes.length === 0 || students.length === 0) return;

      setStatsLoading(true);
      const statsMap = new Map();

      try {
        for (const cls of filteredClasses) {
          const classStudents = getStudentsByClass(cls.id);
          if (classStudents.length === 0) {
            statsMap.set(cls.id, {
              totalStudents: 0,
              averageAttendance: 0,
              totalDays: 0,
              presentDays: 0,
              absentDays: 0,
            });
            continue;
          }

          // Fetch attendance records for all students in this class
          const attendancePromises = classStudents.map((student) =>
            fetch(`/api/attendance?studentId=${student.id}&term=${term}&academicYear=${academicYear}`, { credentials: 'include' })
          );
          
          const attendanceResponses = await Promise.all(attendancePromises);
          const attendanceData = await Promise.all(
            attendanceResponses.map((res) => res.ok ? res.json() : Promise.resolve([]))
          );

          let totalPresent = 0;
          let totalDays = 0;
          let studentCount = 0;

          attendanceData.forEach((records) => {
            const recordsArray = Array.isArray(records) ? records : [];
            if (recordsArray.length > 0) {
              const record = recordsArray[0];
              totalPresent += record.presentDays || 0;
              totalDays += record.totalDays || 0;
              studentCount++;
            }
          });

          const averageAttendance = studentCount > 0 && totalDays > 0
            ? Math.round((totalPresent / totalDays) * 100)
            : 0;

          statsMap.set(cls.id, {
            totalStudents: classStudents.length,
            averageAttendance,
            totalDays: studentCount > 0 ? Math.round(totalDays / studentCount) : 0,
            presentDays: studentCount > 0 ? Math.round(totalPresent / studentCount) : 0,
            absentDays: studentCount > 0 && totalDays > 0
              ? Math.round((totalDays / studentCount) - (totalPresent / studentCount))
              : 0,
          });
        }

        setClassStats(statsMap);
      } catch (error) {
        console.error('Failed to load attendance stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadAttendanceStats();
  }, [classes, students, filteredClasses, term, academicYear]);

  const getAttendanceStats = (classId: string) => {
    return classStats.get(classId) || {
      totalStudents: 0,
      averageAttendance: 0,
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
    };
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    showInfo(`${format.toUpperCase()} export functionality will be implemented`);
  };

  const reportTypes = [
    { value: 'summary', label: 'Attendance Summary', icon: <FileBarChart className="h-4 w-4" /> },
    { value: 'term', label: 'Term-wise Attendance', icon: <Calendar className="h-4 w-4" /> },
    { value: 'trends', label: 'Attendance Trends', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'absenteeism', label: 'Absenteeism Analysis', icon: <Users className="h-4 w-4" /> }
  ];

  const overallStats = Array.from(filteredClasses).reduce(
    (acc, cls) => {
      const stats = getAttendanceStats(cls.id);
      return {
        totalStudents: acc.totalStudents + stats.totalStudents,
        totalAttendance: acc.totalAttendance + stats.averageAttendance,
        count: acc.count + 1
      };
    },
    { totalStudents: 0, totalAttendance: 0, count: 0 }
  );

  const overallAverage = overallStats.count > 0 
    ? Math.round(overallStats.totalAttendance / overallStats.count) 
    : 0;

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
            <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Attendance Reports</h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Track and analyze student attendance patterns
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
          <p className="text-xs md:text-sm text-gray-600 mb-1">Overall Attendance</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {overallAverage}%
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {overallStats.totalStudents}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Classes Monitored</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            {filteredClasses.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Term</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">
            Term {term}
          </p>
        </div>
      </div>

      {/* Attendance Report Data */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            {reportTypes.find((t) => t.value === reportType)?.label || 'Attendance Report'}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Academic Year: {academicYear} | Term: {term}
          </p>
        </div>

        {loading || statsLoading ? (
          <div className="p-8 text-center text-gray-500">Loading report data...</div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No classes found for selected filters</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Present Days
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Absent Days
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((cls) => {
                  const stats = getAttendanceStats(cls.id);
                  const isGood = stats.averageAttendance >= 90;
                  const isFair = stats.averageAttendance >= 75 && stats.averageAttendance < 90;
                  
                  return (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm md:text-base font-medium text-gray-900">
                          {cls.name}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {stats.totalStudents}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {stats.averageAttendance}%
                          </span>
                          <div className="w-16 md:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                isGood ? 'bg-green-500' : isFair ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${stats.averageAttendance}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                        {stats.presentDays} / {stats.totalDays}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                        {stats.absentDays}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          isGood
                            ? 'bg-green-100 text-green-800'
                            : isFair
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isGood ? 'Good' : isFair ? 'Fair' : 'Poor'}
                        </span>
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

