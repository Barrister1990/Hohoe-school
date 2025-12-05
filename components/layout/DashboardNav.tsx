'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  UserCheck,
  School,
  Settings,
  FileText,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  LogOut,
} from 'lucide-react';
import { UserRole } from '@/types';
import { useAuthStore } from '@/lib/stores/auth-store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  children?: NavItem[];
}

interface DashboardNavProps {
  navItems: NavItem[];
  userRole: UserRole;
}

export default function DashboardNav({ navItems, userRole }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      // Force a hard redirect to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      window.location.href = '/';
    }
  };

  // Check if user has access to a role
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    if (role === 'admin') return user.role === 'admin';
    if (role === 'class_teacher') return user.isClassTeacher === true;
    if (role === 'subject_teacher') return user.isSubjectTeacher === true;
    return false;
  };

  // Filter nav items based on role - check if user has any of the required roles
  const filteredItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((role) => hasRole(role));
  });

  const isActive = (href: string) => {
    if (href === pathname) return true;
    return pathname?.startsWith(href + '/');
  };

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      toggleExpand(item.name);
    } else {
      router.push(item.href);
    }
  };

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-gray-900 text-gray-300 overflow-x-hidden border-r border-gray-800 z-30 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Main</h2>
      </div>

      <nav className="py-2 flex-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.name);

          return (
            <div key={item.name}>
              <button
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                  active
                    ? 'bg-gray-800 text-white border-r-2 border-blue-500'
                    : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex-shrink-0 ${active ? 'text-blue-400' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium truncate">{item.name}</span>
                </div>
                {hasChildren && (
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                )}
              </button>

              {/* Children items */}
              {hasChildren && isExpanded && (
                <div className="bg-gray-800/30">
                  {item.children?.map((child) => {
                    const childActive = isActive(child.href);

                    return (
                      <button
                        key={child.name}
                        onClick={() => router.push(child.href)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 pl-12 text-left text-sm transition-colors ${
                          childActive
                            ? 'bg-gray-800 text-white border-r-2 border-blue-500'
                            : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className={`flex-shrink-0 ${childActive ? 'text-blue-400' : 'text-gray-500'}`}>
                          {child.icon}
                        </div>
                        <span className="truncate">{child.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800 bg-gray-900 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors rounded-lg"
        >
          <LogOut className="h-5 w-5 text-gray-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

