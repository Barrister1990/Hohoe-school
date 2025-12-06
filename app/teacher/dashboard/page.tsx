'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  LogOut,
  School,
  TrendingUp,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

interface TeacherStatistics {
  myStudents: number;
  myClasses: number;
  assignedSubjects: number;
  pendingGrades: number;
}

interface AssignedClass {
  id: string;
  name: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<TeacherStatistics>({
    myStudents: 0,
    myClasses: 0,
    assignedSubjects: 0,
    pendingGrades: 0,
  });
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [assessmentData, setAssessmentData] = useState<{ month: string; assessments: number }[]>([]);
  const [classPerformance, setClassPerformance] = useState<{ name: string; averageScore: number; students: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<Array<{
    type: 'grade' | 'attendance' | 'evaluation';
    title: string;
    time: string;
    icon: React.ReactNode;
    color: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const isClassTeacher = user?.isClassTeacher || false;
  const isSubjectTeacher = user?.isSubjectTeacher || false;

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Use router.push for better Next.js integration
      router.push('/');
      // Force a refresh to ensure all state is cleared
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      router.push('/');
      router.refresh();
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadDashboardData = async () => {
      try {
        // Load teacher's classes (if class teacher)
        let teacherClasses: any[] = [];
        if (isClassTeacher) {
          const classesRes = await fetch(`/api/classes/teacher/${user.id}`, {
            credentials: 'include',
          });
          if (classesRes.ok) {
            teacherClasses = await classesRes.json();
          }
        }

        // Load subject assignments
        const assignmentsRes = await fetch('/api/subject-assignments', {
          credentials: 'include',
        });
        const allAssignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
        const teacherAssignments = allAssignments.filter(
          (a: any) => a.teacherId === user.id
        );

        // Get unique class IDs from assignments
        const assignedClassIds = new Set<string>();
        teacherAssignments.forEach((a: any) => {
          assignedClassIds.add(a.classId);
        });
        teacherClasses.forEach((c: any) => {
          assignedClassIds.add(c.id);
        });

        // Load students from assigned classes
        let myStudents: any[] = [];
        if (assignedClassIds.size > 0) {
          const classIdsArray = Array.from(assignedClassIds);
          const studentsPromises = classIdsArray.map((classId) =>
            fetch(`/api/students?classId=${classId}`, {
              credentials: 'include',
            }).then((res) => (res.ok ? res.json() : []))
          );
          const studentsArrays = await Promise.all(studentsPromises);
          myStudents = studentsArrays.flat();
        }

        // Get unique subject IDs
        const assignedSubjectIds = new Set<string>();
        teacherAssignments.forEach((a: any) => {
          assignedSubjectIds.add(a.subjectId);
        });

        // Load analytics overview filtered by teacher
        const analyticsParams = new URLSearchParams({
          academicYear: '2024/2025',
          term: '1',
          teacherId: user.id,
        });
        const analyticsRes = await fetch(`/api/analytics/overview?${analyticsParams.toString()}`, {
          credentials: 'include',
        });
        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

        // Calculate pending grades (students with assigned subjects but no grades for current term)
        let pendingGrades = 0;
        if (assignedSubjectIds.size > 0 && myStudents.length > 0) {
          const gradesRes = await fetch(
            `/api/grades?term=1&academicYear=2024/2025&withDetails=true`,
            { credentials: 'include' }
          );
          const allGrades = gradesRes.ok ? await gradesRes.json() : [];
          
          // Count students who need grades for assigned subjects
          const gradedCombinations = new Set<string>();
          allGrades.forEach((g: any) => {
            if (assignedSubjectIds.has(g.subjectId) && myStudents.some((s: any) => s.id === g.studentId)) {
              gradedCombinations.add(`${g.studentId}-${g.subjectId}`);
            }
          });

          const expectedCombinations = myStudents.length * assignedSubjectIds.size;
          pendingGrades = Math.max(0, expectedCombinations - gradedCombinations.size);
        }

        // Update statistics
        setStats({
          myStudents: myStudents.length,
          myClasses: assignedClassIds.size, // Unique classes from both class teacher role and subject assignments
          assignedSubjects: assignedSubjectIds.size,
          pendingGrades,
        });

        // Load all classes to get names for assigned classes
        const allClassesRes = await fetch('/api/classes', {
          credentials: 'include',
        });
        const allClasses = allClassesRes.ok ? await allClassesRes.json() : [];
        
        // Combine teacher classes with assigned classes from subject assignments
        const allAssignedClasses = [
          ...teacherClasses,
          ...allClasses.filter((c: any) =>
            assignedClassIds.has(c.id) && !teacherClasses.some((tc: any) => tc.id === c.id)
          ),
        ];

        setAssignedClasses(
          allAssignedClasses.map((c: any) => ({ id: c.id, name: c.name }))
        );

        // Generate assessment trends from actual grade entries (last 6 months)
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1); // Start of 6 months ago
        
        // Get all grades for teacher's assigned subjects and students (we'll filter by date)
        let teacherGrades: any[] = [];
        if (assignedSubjectIds.size > 0 && myStudents.length > 0) {
          const gradesRes = await fetch(
            `/api/grades?withDetails=true`,
            { credentials: 'include' }
          );
          const allGrades = gradesRes.ok ? await gradesRes.json() : [];
          
          // Filter grades by teacher's assigned subjects and students
          teacherGrades = allGrades.filter((g: any) => {
            const isAssignedSubject = assignedSubjectIds.has(g.subjectId);
            const isMyStudent = myStudents.some((s: any) => s.id === g.studentId);
            return isAssignedSubject && isMyStudent;
          });
        }

        // Group by month
        const monthCounts = new Map<string, number>();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${monthNames[date.getMonth()]}`;
          monthCounts.set(monthKey, 0);
        }

        // Count grades by month
        teacherGrades.forEach((g: any) => {
          if (g.createdAt) {
            const createdDate = new Date(g.createdAt);
            if (createdDate >= sixMonthsAgo) {
              const monthKey = `${monthNames[createdDate.getMonth()]}`;
              monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
            }
          }
        });

        // Convert to array format for chart
        const assessmentTrends = Array.from(monthCounts.entries())
          .slice(-6) // Last 6 months
          .map(([month, count]) => ({
            month,
            assessments: count,
          }));
        setAssessmentData(assessmentTrends);

        // Generate class performance data
        if (isClassTeacher && teacherClasses.length > 0) {
          const classPerfPromises = teacherClasses.map(async (cls: any) => {
            const perfRes = await fetch(
              `/api/analytics/classes/${cls.id}?academicYear=2024/2025&term=1`,
              { credentials: 'include' }
            );
            if (perfRes.ok) {
              const perf = await perfRes.json();
              return {
                name: cls.name,
                averageScore: perf.averageScore || 0,
                students: perf.totalStudents || 0,
              };
            }
            return {
              name: cls.name,
              averageScore: 0,
              students: 0,
            };
          });
          const classPerf = await Promise.all(classPerfPromises);
          setClassPerformance(classPerf);
        } else {
          setClassPerformance([]);
        }

        // Load recent activities
        const activities: Array<{
          type: 'grade' | 'attendance' | 'evaluation';
          title: string;
          time: string;
          timestamp: number; // For sorting
          icon: React.ReactNode;
          color: string;
        }> = [];

        // Get recent grade entries (sorted by created_at)
        const recentGrades = teacherGrades
          .filter((g: any) => g.createdAt)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Most recent first
          })
          .slice(0, 5);

        recentGrades.forEach((g: any) => {
          const subjectName = g.subjectName || 'Subject';
          const createdDate = new Date(g.createdAt);
          const timeAgo = getTimeAgo(createdDate);
          
          activities.push({
            type: 'grade',
            title: `Grades entered for ${subjectName}`,
            time: timeAgo,
            timestamp: createdDate.getTime(),
            icon: <ClipboardList className="h-4 w-4 text-blue-600" />,
            color: 'blue',
          });
        });

        // Get recent attendance records (for class teachers)
        if (isClassTeacher && teacherClasses.length > 0) {
          const attendanceRes = await fetch(
            `/api/attendance?classId=${teacherClasses[0].id}`,
            { credentials: 'include' }
          );
          if (attendanceRes.ok) {
            const attendanceRecords = await attendanceRes.json();
            const recentAttendance = attendanceRecords
              .filter((a: any) => a.updatedAt)
              .sort((a: any, b: any) => {
                const dateA = new Date(a.updatedAt).getTime();
                const dateB = new Date(b.updatedAt).getTime();
                return dateB - dateA;
              })
              .slice(0, 2);

            recentAttendance.forEach((a: any) => {
              const updatedDate = new Date(a.updatedAt);
              activities.push({
                type: 'attendance',
                title: `Attendance recorded for Term ${a.term}`,
                time: getTimeAgo(updatedDate),
                timestamp: updatedDate.getTime(),
                icon: <Calendar className="h-4 w-4 text-purple-600" />,
                color: 'purple',
              });
            });
          }
        }

        // Get recent evaluations (for class teachers)
        if (isClassTeacher && teacherClasses.length > 0) {
          const evaluationsRes = await fetch(
            `/api/evaluations?classId=${teacherClasses[0].id}`,
            { credentials: 'include' }
          );
          if (evaluationsRes.ok) {
            const evaluations = await evaluationsRes.json();
            const recentEvaluations = evaluations
              .filter((e: any) => e.updatedAt)
              .sort((a: any, b: any) => {
                const dateA = new Date(a.updatedAt).getTime();
                const dateB = new Date(b.updatedAt).getTime();
                return dateB - dateA;
              })
              .slice(0, 1);

            recentEvaluations.forEach((e: any) => {
              const updatedDate = new Date(e.updatedAt);
              activities.push({
                type: 'evaluation',
                title: `Conduct & Interest evaluation updated`,
                time: getTimeAgo(updatedDate),
                timestamp: updatedDate.getTime(),
                icon: <Award className="h-4 w-4 text-green-600" />,
                color: 'green',
              });
            });
          }
        }

        // Sort all activities by timestamp (most recent first) and limit to 5
        activities.sort((a, b) => b.timestamp - a.timestamp);
        setRecentActivities(activities.slice(0, 5).map(({ timestamp, ...rest }) => rest));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Set defaults on error
        setStats({
          myStudents: 0,
          myClasses: 0,
          assignedSubjects: 0,
          pendingGrades: 0,
        });
        setAssignedClasses([]);
        setAssessmentData([]);
        setClassPerformance([]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, isClassTeacher, isSubjectTeacher]);

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">
            Welcome back, {user?.name || 'Teacher'}!
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {isClassTeacher && isSubjectTeacher 
              ? 'Class Teacher & Subject Teacher Dashboard'
              : isClassTeacher 
              ? 'Class Teacher Dashboard'
              : 'Subject Teacher Dashboard'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4 w-full">
        {isClassTeacher && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-1 md:mb-2">
                  <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">My Students</h3>
                  <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg shrink-0">
                    <Users className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-lg md:text-3xl font-semibold text-gray-900">
                  {loading ? '...' : stats.myStudents}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-1 md:mb-2">
                  <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">My Classes</h3>
                  <div className="p-1.5 md:p-2 bg-green-100 rounded-lg shrink-0">
                    <School className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-lg md:text-3xl font-semibold text-gray-900">
                  {loading ? '...' : stats.myClasses}
                </p>
              </div>
            </div>
          </>
        )}

        {isSubjectTeacher && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start justify-between mb-1 md:mb-2">
                <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">Assigned Subjects</h3>
                <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg shrink-0">
                  <BookOpen className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-lg md:text-3xl font-semibold text-gray-900">
                {loading ? '...' : stats.assignedSubjects}
              </p>
            </div>
          </div>
        )}

        {/* Assigned Classes Card - Show for all teachers */}
        {assignedClasses.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start justify-between mb-1 md:mb-2">
                <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">Assigned Classes</h3>
                <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg shrink-0">
                  <School className="h-4 w-4 md:h-6 md:w-6 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-lg md:text-3xl font-semibold text-gray-900">
                  {loading ? '...' : assignedClasses.length}
                </p>
                {assignedClasses.length > 0 && (
                  <p className="text-[10px] md:text-xs text-gray-600 truncate">
                    {assignedClasses.map((c) => c.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-5 h-24 md:h-auto shadow-sm min-w-0">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-1 md:mb-2">
              <h3 className="text-[10px] md:text-sm font-medium text-gray-600 leading-tight">Pending Grades</h3>
              <div className="p-1.5 md:p-2 bg-yellow-100 rounded-lg shrink-0">
                <ClipboardList className="h-4 w-4 md:h-6 md:w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-lg md:text-3xl font-semibold text-gray-900">
              {loading ? '...' : stats.pendingGrades}
            </p>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {isClassTeacher && (
            <>
              <button
                onClick={() => router.push('/teacher/my-class')}
                className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <School className="h-5 w-5 md:h-6 md:w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-1">My Class</h3>
                <p className="text-[10px] md:text-xs text-gray-600">View class details</p>
              </button>

              <button
                onClick={() => router.push('/teacher/my-class/attendance')}
                className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-1">Attendance</h3>
                <p className="text-[10px] md:text-xs text-gray-600">Record attendance</p>
              </button>

              <button
                onClick={() => router.push('/teacher/my-class/conduct')}
                className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <Award className="h-5 w-5 md:h-6 md:w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-1">Conduct & Interest</h3>
                <p className="text-[10px] md:text-xs text-gray-600">Evaluate students</p>
              </button>
            </>
          )}

          <button
            onClick={() => router.push('/teacher/grades/enter')}
            className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-1">Enter Grades</h3>
            <p className="text-[10px] md:text-xs text-gray-600">Add student grades</p>
          </button>


          <button
            onClick={() => router.push('/teacher/students')}
            className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-1">View Students</h3>
            <p className="text-[10px] md:text-xs text-gray-600">Student list</p>
          </button>

          <button
            onClick={() => router.push('/teacher/analytics')}
            className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-1">Analytics</h3>
            <p className="text-[10px] md:text-xs text-gray-600">View performance</p>
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Assessment Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Assessment Trends</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="assessments" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Class Performance (Class Teachers Only) */}
        {isClassTeacher && classPerformance.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Class Performance</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity / Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-xs md:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'purple' ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-[10px] md:text-xs text-gray-600 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          )}
          </div>
      </div>
    </div>
  );
}
