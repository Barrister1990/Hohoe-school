'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, School } from 'lucide-react';
import { User } from '@/types';
import { getLevelNumber } from '@/lib/utils/class-levels';
import { useAlert } from '@/components/shared/AlertProvider';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  level: z.string().min(1, 'Level is required'),
  stream: z.string().optional(),
  classTeacherId: z.string().min(1, 'Class teacher is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function AddClassPage() {
  const router = useRouter();
  const { showError, showSuccess } = useAlert();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      level: 'KG 1',
      capacity: 30,
    },
  });

  const selectedLevel = watch('level');
  const selectedStream = watch('stream');

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const res = await fetch('/api/teachers', { credentials: 'include' });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to load teachers');
        }
        const data = await res.json();
        // Handle empty array gracefully
        const teachersList = Array.isArray(data) ? data : [];
        // Filter for class teachers (teachers who can be class teachers)
        const classTeachers = teachersList.filter((t: User) => 
          t.role === 'class_teacher' || (t as any).isClassTeacher
        );
        setTeachers(classTeachers);
      } catch (error: any) {
        console.error('Failed to load teachers:', error);
        // Only show alert for actual errors, not empty results
        if (error.message && !error.message.includes('empty')) {
          showError(error.message || 'Failed to load teachers. Please try again.');
        }
      }
    };

    loadTeachers();
  }, []);

  // Auto-generate class name when level or stream changes
  useEffect(() => {
    if (selectedLevel) {
      const stream = selectedStream || 'A';
      const className = `${selectedLevel}${stream}`;
      setValue('name', className);
    }
  }, [selectedLevel, selectedStream, setValue]);

  const onSubmit = async (data: ClassFormData) => {
    setSaving(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          level: getLevelNumber(data.level),
          stream: data.stream,
          classTeacherId: data.classTeacherId,
          capacity: data.capacity,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create class');
      }

      showSuccess('Class created successfully!');
      router.push('/admin/classes');
    } catch (error: any) {
      console.error('Failed to create class:', error);
      showError(error.message || 'Failed to create class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Create New Class</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Add a new class to the system
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Basic Information */}
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4">
            <p className="text-xs md:text-sm text-blue-800">
              <strong>Note:</strong> Classes are permanent and will be reused across all terms and academic years. 
              Students are enrolled into classes for specific terms, but the class itself remains the same.
            </p>
          </div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                {...register('level')}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              >
                <option value="KG 1">KG 1</option>
                <option value="KG 2">KG 2</option>
                <option value="Basic 1">Basic 1</option>
                <option value="Basic 2">Basic 2</option>
                <option value="Basic 3">Basic 3</option>
                <option value="Basic 4">Basic 4</option>
                <option value="Basic 5">Basic 5</option>
                <option value="Basic 6">Basic 6</option>
                <option value="Basic 7">Basic 7</option>
                <option value="Basic 8">Basic 8</option>
                <option value="Basic 9">Basic 9</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-xs text-red-600">{errors.level.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stream
              </label>
              <input
                type="text"
                {...register('stream')}
                placeholder="A, B, C, etc."
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
              {errors.stream && (
                <p className="mt-1 text-xs text-red-600">{errors.stream.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Teacher <span className="text-red-500">*</span>
              </label>
              <select
                {...register('classTeacherId')}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              >
                <option value="">Select Class Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Note: A teacher can be assigned to multiple classes and levels.
              </p>
              {errors.classTeacherId && (
                <p className="mt-1 text-xs text-red-600">{errors.classTeacherId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                min="1"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
              {errors.capacity && (
                <p className="mt-1 text-xs text-red-600">{errors.capacity.message}</p>
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
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Class
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

