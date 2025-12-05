'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ArrowLeft, TrendingUp, Search, Filter, Calendar, Users, Award, AlertCircle } from 'lucide-react';
import { Student, Class, Subject } from '@/types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { calculateGrade, getGradeColorClass } from '@/lib/utils/grading';

interface StudentPerformance {
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  averageScore: number;
  grade: string;
  trend: 'improving' | 'stable' | 'declining';
  subjectsCompleted: number;
  totalSubjects: number;
  attendanceRate: number;
  termScores: { term: number; score: number }[];
}

export default function StudentPerformancePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [performance, setPerformance] = useState<StudentPerformance[]>([]);
  const [filteredPerformance, setFilteredPerformance] = useState<StudentPerformance[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('1');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024/2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load students and classes for filters
        const [studentsRes, classesRes, subjectsRes] = await Promise.all([
          fetch('/api/students', { credentials: 'include' }),
          fetch('/api/classes', { credentials: 'include' }),
          fetch('/api/subjects', { credentials: 'include' }),
        ]);

        const studentsData = studentsRes.ok ? await studentsRes.json() : [];
        const classesData = classesRes.ok ? await classesRes.json() : [];
        const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];

        // Filter based on teacher role
        let relevantStudents = studentsData;
        let relevantClasses = classesData;
        
        if (user?.isClassTeacher) {
          const myClasses = classesData.filter((c: any) => c.classTeacherId === user.id);
          const myClassIds = myClasses.map((c: any) => c.id);
          relevantStudents = studentsData.filter((s: any) => myClassIds.includes(s.classId));
          relevantClasses = myClasses;
        }

        setStudents(relevantStudents);
        setClasses(relevantClasses);
        setSubjects(subjectsData);

        // Load performance data
        const params = new URLSearchParams({
          academicYear: selectedAcademicYear,
          term: selectedTerm,
        });

        if (selectedClass !== 'all') {
          params.append('classId', selectedClass);
        }

        const perfRes = await fetch(`/api/analytics/students?${params.toString()}`, {
          credentials: 'include',
        });

        if (perfRes.ok) {
          const perfData = await perfRes.json();
          setPerformance(perfData);
          setFilteredPerformance(perfData);
        } else {
          setPerformance([]);
          setFilteredPerformance([]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setPerformance([]);
        setFilteredPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id, user?.isClassTeacher, selectedTerm, selectedAcademicYear, selectedClass]);

  useEffect(() => {
    let filtered = performance;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.studentName.toLowerCase().includes(query) ||
        p.studentId.toLowerCase().includes(query)
      );
    }

    // Filter by class
    if (selectedClass !== 'all') {
      const classStudents = students.filter((s) => s.classId === selectedClass);
      const classStudentIds = classStudents.map((s) => s.id);
      filtered = filtered.filter((p) => classStudentIds.includes(p.studentId));
    }

    setFilteredPerformance(filtered);
  }, [searchQuery, selectedClass, performance, students]);

  const selectedStudentData = selectedStudent
    ? performance.find((p) => p.studentId === selectedStudent)
    : null;

  // Performance trend data for selected student
  const studentTrendData = selectedStudentData?.termScores
    ? selectedStudentData.termScores.map((ts: { term: number; score: number }) => ({
        term: `Term ${ts.term}`,
        score: ts.score,
      }))
    : [];

  if (loading) {
    return (
      <div className="w-full min-w-0 space-y-4 md:space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.push('/teacher/analytics')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Student Performance</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Analyze individual student performance and trends
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base appearance-none bg-white"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="block w-full pl-9 md:pl-10 pr-3 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base appearance-none bg-white"
            >
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>
          <div>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="block w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            >
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Student List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Students ({filteredPerformance.length})
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredPerformance.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">No students found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPerformance.map((perf) => (
                  <button
                    key={perf.studentId}
                    onClick={() => setSelectedStudent(perf.studentId)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedStudent === perf.studentId ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{perf.studentName}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColorClass(perf.grade)}`}>
                        {perf.grade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{perf.averageScore.toFixed(1)}%</span>
                      <span className={`flex items-center gap-1 ${
                        perf.trend === 'improving' ? 'text-green-600' :
                        perf.trend === 'stable' ? 'text-gray-600' :
                        'text-red-600'
                      }`}>
                        <TrendingUp className={`h-3 w-3 ${perf.trend === 'declining' ? 'rotate-180' : ''}`} />
                        {perf.trend}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
          {selectedStudentData ? (
            <div className="space-y-6">
              {/* Student Header */}
              <div>
                <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-2">
                  {selectedStudentData.studentName}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-600">
                  <span>Average: <strong className="text-gray-900">{selectedStudentData.averageScore.toFixed(1)}%</strong></span>
                  <span>Grade: <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColorClass(selectedStudentData.grade)}`}>{selectedStudentData.grade}</span></span>
                  <span>Attendance: <strong className="text-gray-900">{selectedStudentData.attendanceRate}%</strong></span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Average Score</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudentData.averageScore.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Grade</p>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getGradeColorClass(selectedStudentData.grade)}`}>
                    {selectedStudentData.grade}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Subjects Completed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedStudentData.subjectsCompleted}/{selectedStudentData.totalSubjects}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Attendance Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudentData.attendanceRate}%</p>
                </div>
              </div>

              {/* Performance Trend Chart */}
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Performance Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={studentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="term" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Insights */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Performance Insights</h4>
                    <p className="text-xs text-blue-800">
                      {selectedStudentData.trend === 'improving' && 'Student performance is improving. Continue current support strategies.'}
                      {selectedStudentData.trend === 'stable' && 'Student performance is stable. Consider additional challenges or support.'}
                      {selectedStudentData.trend === 'declining' && 'Student performance is declining. Immediate intervention recommended.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/teacher/students/${selectedStudentData.studentId}`)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Student Details
                </button>
                <button
                  onClick={() => router.push(`/teacher/students/${selectedStudentData.studentId}/grades`)}
                  className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  View Grades
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm md:text-base text-gray-600 mb-2">Select a student to view performance</p>
              <p className="text-xs text-gray-500">Choose a student from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

