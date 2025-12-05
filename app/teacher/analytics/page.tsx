'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Calendar, Filter } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend
} from 'recharts';

export default function AnalyticsOverviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<string>('1');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2024/2025');
  
  // Statistics
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [passRate, setPassRate] = useState(0);
  const [completedGrades, setCompletedGrades] = useState(0);
  
  // Chart data
  const [gradeDistribution, setGradeDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [performanceTrend, setPerformanceTrend] = useState<{ term: string; average: number }[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<{ subject: string; average: number }[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const params = new URLSearchParams({
          academicYear: selectedAcademicYear,
          term: selectedTerm,
        });

        if (user?.id) {
          params.append('teacherId', user.id);
        }

        const res = await fetch(`/api/analytics/overview?${params.toString()}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to load analytics');
        }

        const data = await res.json();

        setTotalStudents(data.totalStudents || 0);
        setAverageScore(data.averageScore || 0);
        setPassRate(data.passRate || 0);
        setCompletedGrades(data.completedGrades || 0);
        setGradeDistribution(data.gradeDistribution || []);
        setPerformanceTrend(data.performanceTrend || []);
        setSubjectPerformance(data.subjectPerformance || []);
      } catch (error) {
        console.error('Failed to load analytics:', error);
        // Set defaults on error
        setTotalStudents(0);
        setAverageScore(0);
        setPassRate(0);
        setCompletedGrades(0);
        setGradeDistribution([]);
        setPerformanceTrend([]);
        setSubjectPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadAnalytics();
    }
  }, [user?.id, selectedTerm, selectedAcademicYear]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Analytics Overview</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Performance insights and trends
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Total Students</p>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Average Score</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-green-600">{averageScore.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Pass Rate</p>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-purple-600">{passRate}%</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Grades Completed</p>
            <BookOpen className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-orange-600">{completedGrades}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="term" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="average" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6 lg:col-span-2">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Subject Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/teacher/analytics/students')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <TrendingUp className="h-5 w-5 text-blue-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">Student Performance</h3>
            <p className="text-xs text-gray-600">View detailed student performance analytics</p>
          </button>
          <button
            onClick={() => router.push('/teacher/analytics/subjects')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <BookOpen className="h-5 w-5 text-green-600 mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">Subject Performance</h3>
            <p className="text-xs text-gray-600">Analyze subject-wise performance metrics</p>
          </button>
        </div>
      </div>
    </div>
  );
}

