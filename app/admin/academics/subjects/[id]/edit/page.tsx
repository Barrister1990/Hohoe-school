'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Subject } from '@/types';
import { useAlert } from '@/components/shared/AlertProvider';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required').toUpperCase(),
  category: z.enum(['core', 'elective']),
  levelCategories: z.array(z.enum(['KG', 'Lower Primary', 'Upper Primary', 'JHS'])).min(1, 'Select at least one level category'),
  description: z.string().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function EditSubjectPage() {
  const router = useRouter();
  const { showError, showSuccess } = useAlert();
  const params = useParams();
  const subjectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      category: 'core',
      levelCategories: ['Lower Primary'],
    },
  });

  useEffect(() => {
    const loadSubject = async () => {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`, { credentials: 'include' });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to load subject');
        }
        const subject = await res.json();
        if (subject) {
          setValue('name', subject.name);
          setValue('code', subject.code);
          setValue('category', subject.category);
          setValue('levelCategories', subject.levelCategories || []);
          setValue('description', subject.description || '');
        }
      } catch (error: any) {
        console.error('Failed to load subject:', error);
        showError(error.message || 'Failed to load subject. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      loadSubject();
    }
  }, [subjectId, setValue]);

  const onSubmit = async (data: SubjectFormData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          code: data.code.toUpperCase(),
          category: data.category,
          levelCategories: data.levelCategories,
          description: data.description || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update subject');
      }

      showSuccess('Subject updated successfully!');
      router.push('/admin/academics/subjects');
    } catch (error: any) {
      console.error('Failed to update subject:', error);
      showError(error.message || 'Failed to update subject. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-w-0 space-y-4 md:space-y-6">
        <div className="p-8 text-center text-gray-500">Loading subject...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Edit Subject</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Update subject information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Subject Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g., Mathematics"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('code')}
                placeholder="e.g., MATH"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base uppercase"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && (
                <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category')}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="core">Core</option>
                <option value="elective">Elective</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level Categories <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select all level categories this subject belongs to (can select multiple)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['KG', 'Lower Primary', 'Upper Primary', 'JHS'] as const).map((level) => {
                  const levelCategories = watch('levelCategories') || [];
                  const isChecked = levelCategories.includes(level);
                  return (
                    <label
                      key={level}
                      className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current = levelCategories;
                          if (e.target.checked) {
                            setValue('levelCategories', [...current, level]);
                          } else {
                            setValue('levelCategories', current.filter((l) => l !== level));
                          }
                        }}
                        className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{level}</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {level === 'KG' && 'KG 1 - KG 2'}
                          {level === 'Lower Primary' && 'Basic 1 - Basic 3'}
                          {level === 'Upper Primary' && 'Basic 4 - Basic 6'}
                          {level === 'JHS' && 'Basic 7 - Basic 9'}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.levelCategories && (
                <p className="mt-2 text-xs text-red-600">{errors.levelCategories.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Optional description of the subject"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

