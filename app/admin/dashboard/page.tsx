'use client';

import { Clock, School, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface Statistics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  pendingTasks: number;
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Statistics>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeClasses: 0,
    pendingTasks: 0,
  });
  const [assessmentData, setAssessmentData] = useState<{ month: string; assessments: number }[]>([]);
  const [classData, setClassData] = useState<{ name: string; students: number }[]>([]);
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [studentsRes, teachersRes, classesRes, gradesRes] = await Promise.all([
          fetch('/api/students', { credentials: 'include' }),
          fetch('/api/teachers', { credentials: 'include' }),
          fetch('/api/classes', { credentials: 'include' }),
          fetch('/api/grades?withDetails=true', { credentials: 'include' }),
        ]);

        // Parse responses
        const students = studentsRes.ok ? await studentsRes.json() : [];
        const teachers = teachersRes.ok ? await teachersRes.json() : [];
        const classes = classesRes.ok ? await classesRes.json() : [];
        const grades = gradesRes.ok ? await gradesRes.json() : [];

        const studentsArray = Array.isArray(students) ? students : [];
        const teachersArray = Array.isArray(teachers) ? teachers : [];
        const classesArray = Array.isArray(classes) ? classes : [];
        const gradesArray = Array.isArray(grades) ? grades : [];

        // Calculate Statistics
        const totalStudents = studentsArray.length;
        const totalTeachers = teachersArray.length;
        const totalClasses = classesArray.length;
        const activeClasses = classesArray.filter((c: any) => c.isActive !== false).length;
        
        // Calculate pending tasks (students without grades, classes without teachers, etc.)
        const studentsWithoutGrades = studentsArray.filter((s: any) => {
          const studentGrades = gradesArray.filter((g: any) => g.studentId === s.id);
          return studentGrades.length === 0;
        }).length;
        const classesWithoutTeachers = classesArray.filter((c: any) => !c.classTeacherId).length;
        const pendingTasks = studentsWithoutGrades + classesWithoutTeachers;

        setStats({
          totalStudents,
          totalTeachers,
          totalClasses,
          activeClasses,
          pendingTasks,
        });

        // Calculate Assessment Trends (last 6 months of grade entries)
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        
        const monthlyGrades = new Map<string, number>();
        gradesArray.forEach((grade: any) => {
          // Use updatedAt or createdAt, whichever is available
          const dateStr = grade.updatedAt || grade.createdAt;
          if (dateStr) {
            const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
            if (!isNaN(date.getTime()) && date >= sixMonthsAgo) {
              const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              monthlyGrades.set(monthKey, (monthlyGrades.get(monthKey) || 0) + 1);
            }
          }
        });

        // Generate last 6 months array
        const assessmentTrends: { month: string; assessments: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          assessmentTrends.push({
            month: monthKey,
            assessments: monthlyGrades.get(monthKey) || 0,
          });
        }

        setAssessmentData(assessmentTrends);

        // Calculate Class Distribution
        const classDistribution = classesArray.map((cls: any) => {
          const classStudents = studentsArray.filter((s: any) => s.classId === cls.id);
          return {
            name: cls.name,
            students: classStudents.length,
          };
        }).sort((a, b) => b.students - a.students);

        setClassData(classDistribution);

        // Calculate Gender Distribution
        const genderCounts = new Map<string, number>();
        studentsArray.forEach((student: any) => {
          const gender = student.gender || 'unknown';
          genderCounts.set(gender, (genderCounts.get(gender) || 0) + 1);
        });

        const genderDistribution = Array.from(genderCounts.entries())
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
          }))
          .filter((item) => item.name !== 'Unknown');

        setGenderData(genderDistribution);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="w-full  space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-3xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4 w-full ">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">Total Students</h3>
              <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg shrink-0">
                <Users className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-lg md:text-3xl font-semibold text-gray-900">
              {loading ? '...' : stats.totalStudents}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">Total Teachers</h3>
              <div className="p-1.5 md:p-2 bg-green-100 rounded-lg shrink-0">
                <UserCheck className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
            <p className="text-lg md:text-3xl font-semibold text-gray-900">
              {loading ? '...' : stats.totalTeachers}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">Active Classes</h3>
              <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg shrink-0">
                <School className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-lg md:text-3xl font-semibold text-gray-900">
              {loading ? '...' : stats.activeClasses}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">Pending Tasks</h3>
              <div className="p-1.5 md:p-2 bg-orange-100 rounded-lg shrink-0">
                <Clock className="h-4 w-4 md:h-6 md:w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-lg md:text-3xl font-semibold text-gray-900">
              {loading ? '...' : stats.pendingTasks}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full min-w-0">
        {/* Assessment Trends Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Assessment Trends</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={assessmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="assessments"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Class Distribution Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Class Distribution</h2>
            <School className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="students" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Distribution & Additional Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full min-w-0">
        {/* Gender Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Gender Distribution</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const percentage = percent ?? 0;
                  return `${name}: ${(percentage * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
            </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm min-w-0">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full min-w-0">
            <button
              onClick={() => window.location.href = '/admin/students/new'}
              className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left min-w-0"
            >
              <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1">Add Student</h3>
              <p className="text-[10px] md:text-xs text-gray-600">Register new student</p>
            </button>
            <button
              onClick={() => window.location.href = '/admin/teachers/new'}
              className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left min-w-0"
            >
              <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1">Add Teacher</h3>
              <p className="text-[10px] md:text-xs text-gray-600">Create teacher account</p>
            </button>
            <button
              onClick={() => window.location.href = '/admin/classes/new'}
              className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left min-w-0"
            >
              <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1">Create Class</h3>
              <p className="text-[10px] md:text-xs text-gray-600">Set up new class</p>
            </button>
            <button
              onClick={() => window.location.href = '/admin/reports'}
              className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left min-w-0"
            >
              <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1">View Reports</h3>
              <p className="text-[10px] md:text-xs text-gray-600">Generate reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
