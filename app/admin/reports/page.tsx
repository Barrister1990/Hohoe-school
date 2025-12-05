'use client';

import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Users, 
  School, 
  BookOpen, 
  FileBarChart,
  TrendingUp,
  Download,
  Calendar
} from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();

  const reportCategories = [
    {
      title: 'Student Reports',
      description: 'Generate comprehensive reports on student performance, enrollment, and demographics',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      href: '/admin/reports/students',
      color: 'blue',
      features: [
        'Student Performance Reports',
        'Enrollment Statistics',
        'Demographic Analysis',
        'Individual Student Reports'
      ]
    },
    {
      title: 'Class Reports',
      description: 'View class-level analytics, performance metrics, and student distribution',
      icon: <School className="h-8 w-8 text-green-600" />,
      href: '/admin/reports/classes',
      color: 'green',
      features: [
        'Class Performance Overview',
        'Student Distribution',
        'Class Comparison Reports',
        'Promotion Statistics'
      ]
    },
    {
      title: 'Academic Reports',
      description: 'Generate academic performance reports by subject, term, and academic year',
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      href: '/admin/reports/academic',
      color: 'purple',
      features: [
        'Subject Performance Analysis',
        'Term-wise Reports',
        'Grade Distribution',
        'Academic Year Summary'
      ]
    },
    {
      title: 'Attendance Reports',
      description: 'Track and analyze student attendance patterns and statistics',
      icon: <FileBarChart className="h-8 w-8 text-orange-600" />,
      href: '/admin/reports/attendance',
      color: 'orange',
      features: [
        'Attendance Statistics',
        'Term-wise Attendance',
        'Absenteeism Analysis',
        'Attendance Trends'
      ]
    }
  ];

  const quickActions = [
    {
      label: 'Generate Student Report',
      href: '/admin/reports/students',
      icon: <Users className="h-4 w-4" />
    },
    {
      label: 'Class Performance',
      href: '/admin/reports/classes',
      icon: <School className="h-4 w-4" />
    },
    {
      label: 'Academic Summary',
      href: '/admin/reports/academic',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      label: 'Attendance Summary',
      href: '/admin/reports/attendance',
      icon: <FileBarChart className="h-4 w-4" />
    }
  ];

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Reports</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Generate and export comprehensive reports for your school
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Filter by Date</span>
          </button>
          <button className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export All</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className="p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors text-left"
            >
              <div className="text-blue-600 mb-2">{action.icon}</div>
              <p className="text-xs md:text-sm font-medium text-gray-900">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {reportCategories.map((category) => (
          <div
            key={category.title}
            className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(category.href)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                category.color === 'blue' ? 'bg-blue-50' :
                category.color === 'green' ? 'bg-green-50' :
                category.color === 'purple' ? 'bg-purple-50' :
                'bg-orange-50'
              }`}>
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                  {category.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                  {category.description}
                </p>
                <ul className="space-y-1.5 mb-4">
                  {category.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        category.color === 'blue' ? 'bg-blue-500' :
                        category.color === 'green' ? 'bg-green-500' :
                        category.color === 'purple' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(category.href);
                  }}
                  className={`text-xs md:text-sm font-medium flex items-center gap-1 ${
                    category.color === 'blue' ? 'text-blue-600 hover:text-blue-700' :
                    category.color === 'green' ? 'text-green-600 hover:text-green-700' :
                    category.color === 'purple' ? 'text-purple-600 hover:text-purple-700' :
                    'text-orange-600 hover:text-orange-700'
                  }`}
                >
                  View Reports
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports (Placeholder) */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Recent Reports</h2>
        <div className="text-center py-8 text-gray-500 text-sm">
          <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No recent reports generated</p>
          <p className="text-xs mt-1">Generate your first report to see it here</p>
        </div>
      </div>
    </div>
  );
}

