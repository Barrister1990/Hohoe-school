'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/layout/DashboardNav';
import DrawerNav from '@/components/layout/DrawerNav';
import Header from '@/components/layout/Header';
import { OfflineBanner } from '@/components/shared/OfflineIndicator';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types';
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  List,
  Plus,
  School,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

const teacherNavItems = [
  {
    name: 'Dashboard',
    href: '/teacher/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['class_teacher', 'subject_teacher'] as UserRole[],
  },
  {
    name: 'My Class',
    href: '/teacher/my-class',
    icon: <School className="w-5 h-5" />,
    roles: ['class_teacher'] as UserRole[],
    children: [
      {
        name: 'Class Overview',
        href: '/teacher/my-class',
        icon: <List className="w-4 h-4" />,
      },
      {
        name: 'Attendance',
        href: '/teacher/my-class/attendance',
        icon: <UserCheck className="w-4 h-4" />,
      },
      {
        name: 'Conduct & Interest',
        href: '/teacher/my-class/conduct',
        icon: <Award className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Students',
    href: '/teacher/students',
    icon: <Users className="w-5 h-5" />,
    roles: ['class_teacher', 'subject_teacher'] as UserRole[],
    children: [
      {
        name: 'All Students',
        href: '/teacher/students',
        icon: <List className="w-4 h-4" />,
      },
      {
        name: 'Student Profiles',
        href: '/teacher/students/profiles',
        icon: <Users className="w-4 h-4" />,
      },
      {
        name: 'Student Reports',
        href: '/teacher/students/reports',
        icon: <FileBarChart className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Grades',
    href: '/teacher/grades',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['class_teacher', 'subject_teacher'] as UserRole[],
    children: [
      {
        name: 'All Grades',
        href: '/teacher/grades',
        icon: <List className="w-4 h-4" />,
      },
      {
        name: 'Enter Grades',
        href: '/teacher/grades/enter',
        icon: <Plus className="w-4 h-4" />,
      },
      {
        name: 'Grade Reports',
        href: '/teacher/grades/reports',
        icon: <FileBarChart className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Analytics',
    href: '/teacher/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['class_teacher', 'subject_teacher'] as UserRole[],
    children: [
      {
        name: 'Overview',
        href: '/teacher/analytics',
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        name: 'Student Performance',
        href: '/teacher/analytics/students',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        name: 'Subject Performance',
        href: '/teacher/analytics/subjects',
        icon: <BookOpen className="w-4 h-4" />,
      },
    ],
  },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  // Determine user role for navigation filtering
  // If user has both roles, we'll show all navigation items
  const userRole = user?.role || 'class_teacher';
  
  // Helper function to check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    if (role === 'admin') return user.role === 'admin';
    if (role === 'class_teacher') return user.isClassTeacher === true;
    if (role === 'subject_teacher') return user.isSubjectTeacher === true;
    return false;
  };

  return (
    <ProtectedRoute allowedRoles={['class_teacher', 'subject_teacher']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Desktop Sidebar */}
        <DashboardNav navItems={teacherNavItems} userRole={userRole} />
        
        {/* Mobile Drawer */}
        <DrawerNav navItems={teacherNavItems} userRole={userRole} />
        
        <div className="lg:ml-64">
          {/* Offline Banner */}
          <OfflineBanner />
          
          {/* Header - Universal to all teacher routes */}
          <Header />

          {/* Main Content */}
          <main className="w-full min-w-0 overflow-x-hidden pt-14 lg:pt-16">
          <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
