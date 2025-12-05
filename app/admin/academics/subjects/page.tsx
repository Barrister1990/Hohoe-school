'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, MoreVertical, BookOpen, Edit } from 'lucide-react';
import { Subject } from '@/types';
import { useAlert } from '@/components/shared/AlertProvider';

export default function SubjectsPage() {
  const router = useRouter();
  const { showError } = useAlert();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await fetch('/api/subjects', { credentials: 'include' });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to load subjects');
        }
        const data = await res.json();
        // Handle empty array gracefully
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('Failed to load subjects:', error);
        // Only show alert for actual errors, not empty results
        if (error.message && !error.message.includes('empty')) {
          showError(error.message || 'Failed to load subjects. Please try again.');
        }
        setSubjects([]); // Set empty array on error to prevent UI issues
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const filteredSubjects = subjects.filter((subject) => {
    return (
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">All Subjects</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Manage subjects in the curriculum
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/admin/academics/subjects/new')}
            className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Subject</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading subjects...</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No subjects found</p>
            <button
              onClick={() => router.push('/admin/academics/subjects/new')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add First Subject
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Code
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Level Category
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                    Description
                  </th>
                  <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.map((subject) => (
                  <tr 
                    key={subject.id} 
                    onClick={() => router.push(`/admin/academics/subjects/${subject.id}/edit`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm md:text-base font-medium text-gray-900 truncate">
                            {subject.name}
                          </div>
                          <div className="text-xs text-gray-500 md:hidden">
                            {subject.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                      {subject.code}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        subject.category === 'core' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {subject.category.charAt(0).toUpperCase() + subject.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {subject.levelCategories && subject.levelCategories.length > 0 ? (
                          subject.levelCategories.map((level) => (
                            <span
                              key={level}
                              className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded"
                            >
                              {level}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No categories</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      {subject.description || 'No description'}
                    </td>
                    <td 
                      className="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === subject.id ? null : subject.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                        {openMenu === subject.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => {
                                  router.push(`/admin/academics/subjects/${subject.id}/edit`);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                              >
                                <Edit className="h-4 w-4" />
                                Edit Subject
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && filteredSubjects.length > 0 && (
        <div className="text-xs md:text-sm text-gray-600 text-center">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </div>
      )}
    </div>
  );
}

