'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ArrowLeft, BookOpen, Filter, Calendar, TrendingUp, Award, Users } from 'lucide-react';
import { Subject, Class, Student } from '@/types';
import { getCurrentAcademicYear, getAcademicYearOptions } from '@/lib/utils/academic-years';
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
import { getLevelCategory } from '@/lib/utils/class-levels';

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  averageScore: number;
  passRate: number;
  totalStudents: number;
  studentsCompleted: number;
  gradeDistribution: {
    HP: number;
    P: number;
    AP: number;
    D: number;
    E: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  termScores: { term: number; score: number }[];
  classPerformance: { className: string; average: number }[];
}

export default function SubjectPerformancePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [performance, setPerformance] = useState<SubjectPerformance[]>([]);
  const [filteredPerformance, setFilteredPerformance] = useState<SubjectPerformance[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('1');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(getCurrentAcademicYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subjects, classes, and students for filters
        const [subjectsRes, classesRes, studentsRes] = await Promise.all([
          fetch('/api/subjects', { credentials: 'include' }),
          fetch('/api/classes', { credentials: 'include' }),
          fetch('/api/students', { credentials: 'include' }),
        ]);

        const subjectsData = subjectsRes.ok ? await subjectsRes.json() : [];
        const classesData = classesRes.ok ? await classesRes.json() : [];
        const studentsData = studentsRes.ok ? await studentsRes.json() : [];

        let relevantStudents = studentsData;
        let relevantClasses = classesData;
        
        if (user?.isClassTeacher) {
          const myClasses = classesData.filter((c: any) => c.classTeacherId === user.id);
          const myClassIds = myClasses.map((c: any) => c.id);
          relevantStudents = studentsData.filter((s: any) => myClassIds.includes(s.classId));
          relevantClasses = myClasses;
        }

        setSubjects(subjectsData);
        setClasses(relevantClasses);
        setStudents(relevantStudents);

        // Load performance data
        const params = new URLSearchParams({
          academicYear: selectedAcademicYear,
          term: selectedTerm,
        });

        if (selectedClass !== 'all') {
          params.append('classId', selectedClass);
        }

        const perfRes = await fetch(`/api/analytics/subjects?${params.toString()}`, {
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

    // Filter by class (if class teacher, show subjects for their class level)
    if (selectedClass !== 'all' && user?.role === 'class_teacher') {
      const selectedClassData = classes.find((c) => c.id === selectedClass);
      if (selectedClassData) {
        const levelCategory = getLevelCategory(selectedClassData.level);
        filtered = performance.filter((p) => {
          const subject = subjects.find((s) => s.id === p.subjectId);
          return subject?.levelCategories.includes(levelCategory);
        });
      }
    }

    setFilteredPerformance(filtered);
  }, [selectedClass, performance, classes, subjects, user?.role]);

  const selectedSubjectData = selectedSubject
    ? performance.find((p) => p.subjectId === selectedSubject)
    : null;

  // Performance trend data for selected subject
  const subjectTrendData = selectedSubjectData?.termScores
    ? selectedSubjectData.termScores.map((ts: { term: number; score: number }) => ({
        term: `Term ${ts.term}`,
        average: ts.score,
      }))
    : [];

  // Class performance for selected subject
  const classPerformanceData = selectedSubjectData?.classPerformance || [];

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
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Subject Performance</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Analyze subject-wise performance across classes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {getAcademicYearOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
        {/* Subject List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Subjects ({filteredPerformance.length})
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredPerformance.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">No subjects found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPerformance.map((perf) => (
                  <button
                    key={perf.subjectId}
                    onClick={() => setSelectedSubject(perf.subjectId)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedSubject === perf.subjectId ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{perf.subjectName}</h3>
                      <span className="text-xs font-semibold text-blue-600">
                        {perf.averageScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Pass Rate: {perf.passRate}%</span>
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

        {/* Subject Details */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
          {selectedSubjectData ? (
            <div className="space-y-6">
              {/* Subject Header */}
              <div>
                <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-2">
                  {selectedSubjectData.subjectName}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-600">
                  <span>Average Score: <strong className="text-gray-900">{selectedSubjectData.averageScore.toFixed(1)}%</strong></span>
                  <span>Pass Rate: <strong className="text-gray-900">{selectedSubjectData.passRate}%</strong></span>
                  <span>Students: <strong className="text-gray-900">{selectedSubjectData.studentsCompleted}/{selectedSubjectData.totalStudents}</strong></span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Average Score</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedSubjectData.averageScore.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Pass Rate</p>
                  <p className="text-lg font-semibold text-green-600">{selectedSubjectData.passRate}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Total Students</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedSubjectData.totalStudents}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Grades Completed</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedSubjectData.studentsCompleted}</p>
                </div>
              </div>

              {/* Grade Distribution */}
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(selectedSubjectData.gradeDistribution).map(([grade, count]) => (
                    <div
                      key={grade}
                      className={`text-center p-3 rounded-lg ${
                        grade === 'HP' ? 'bg-green-50' :
                        grade === 'P' ? 'bg-blue-50' :
                        grade === 'AP' ? 'bg-yellow-50' :
                        grade === 'D' ? 'bg-orange-50' :
                        'bg-red-50'
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-900">{grade}</p>
                      <p className="text-sm font-bold text-gray-900">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Trend Chart */}
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Performance Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={subjectTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="term" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="average" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Class Performance */}
              {selectedClass === 'all' && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Performance by Class</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={classPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="class" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="average" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm md:text-base text-gray-600 mb-2">Select a subject to view performance</p>
              <p className="text-xs text-gray-500">Choose a subject from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

