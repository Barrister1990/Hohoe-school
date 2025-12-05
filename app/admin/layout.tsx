'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/layout/DashboardNav';
import DrawerNav from '@/components/layout/DrawerNav';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types';
import {
  BookOpen,
  ClipboardList,
  FileBarChart,
  FileText,
  FileUp,
  GraduationCap,
  LayoutDashboard,
  List,
  Plus,
  School,
  Settings,
  Shield,
  Sparkles,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';

const adminNavItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
  },
  {
    name: 'Student Information',
    href: '/admin/students',
    icon: <Users className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
    children: [
      {
        name: 'All Students',
        href: '/admin/students',
        icon: <List className="w-4 h-4" />,
      },
      {
        name: 'Add New Student',
        href: '/admin/students/new',
        icon: <UserPlus className="w-4 h-4" />,
      },
      {
        name: 'Import Students',
        href: '/admin/students/import',
        icon: <FileUp className="w-4 h-4" />,
      },
      {
        name: 'Student Reports',
        href: '/admin/students/reports',
        icon: <FileBarChart className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Teachers',
    href: '/admin/teachers',
    icon: <UserCheck className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
    children: [
      {
        name: 'All Teachers',
        href: '/admin/teachers',
        icon: <List className="w-4 h-4" />,
      },
      {
        name: 'Add New Teacher',
        href: '/admin/teachers/new',
        icon: <UserPlus className="w-4 h-4" />,
      },
      {
        name: 'Assignments',
        href: '/admin/teachers/assignments',
        icon: <ClipboardList className="w-4 h-4" />,
      },
      {
        name: 'Permissions',
        href: '/admin/teachers/permissions',
        icon: <Shield className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Classes',
    href: '/admin/classes',
    icon: <School className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
    children: [
      {
        name: 'All Classes',
        href: '/admin/classes',
        icon: <List className="w-4 h-4" />,
      },
      {
        name: 'Add New Class',
        href: '/admin/classes/new',
        icon: <Plus className="w-4 h-4" />,
      },
      {
        name: 'Class Assignments',
        href: '/admin/classes/assignments',
        icon: <UserCheck className="w-4 h-4" />,
      },
      {
        name: 'Promotions',
        href: '/admin/classes/promotions',
        icon: <GraduationCap className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Subjects',
    href: '/admin/academics/subjects',
    icon: <BookOpen className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: <FileText className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
    children: [
      {
        name: 'Student Reports',
        href: '/admin/reports/students',
        icon: <Users className="w-4 h-4" />,
      },
      {
        name: 'Class Reports',
        href: '/admin/reports/classes',
        icon: <School className="w-4 h-4" />,
      },
      {
        name: 'Academic Reports',
        href: '/admin/reports/academic',
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        name: 'Attendance Reports',
        href: '/admin/reports/attendance',
        icon: <FileBarChart className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'AI Analytics',
    href: '/admin/analytics',
    icon: <Sparkles className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
  },
  {
    name: 'Graduated Students',
    href: '/admin/graduated',
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
    children: [
      {
        name: 'All Graduated',
        href: '/admin/graduated',
        icon: <List className="w-4 h-4" />,
      },
      {
        name: 'BECE Results',
        href: '/admin/graduated/bece',
        icon: <FileBarChart className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin'] as UserRole[],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const userRole = user?.role || 'admin';

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Desktop Sidebar */}
        <DashboardNav navItems={adminNavItems} userRole={userRole} />
        
        {/* Mobile Drawer */}
        <DrawerNav navItems={adminNavItems} userRole={userRole} />
        
        <div className="lg:ml-64 ">
          {/* Header - Universal to all admin routes */}
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
