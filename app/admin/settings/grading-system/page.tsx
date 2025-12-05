'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import { GradingSystem, GradeLevel, DEFAULT_GRADING_SYSTEM } from '@/types/grading-system';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAlert } from '@/components/shared/AlertProvider';

const gradingSystemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  gradeLevels: z
    .array(
      z.object({
        id: z.string(),
        code: z.string().min(1, 'Code is required'),
        name: z.string().min(1, 'Name is required'),
        minPercentage: z.number().min(0).max(100),
        maxPercentage: z.number().min(0).max(100),
        order: z.number(),
      })
    )
    .min(1, 'At least one grade level is required'),
}).refine(
  (data) => {
    // Check for overlapping ranges
    const sorted = [...data.gradeLevels].sort((a, b) => a.minPercentage - b.minPercentage);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].maxPercentage >= sorted[i + 1].minPercentage) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'Grade level ranges cannot overlap',
    path: ['gradeLevels'],
  }
).refine(
  (data) => {
    // Check that ranges cover 0-100%
    const sorted = [...data.gradeLevels].sort((a, b) => a.minPercentage - b.minPercentage);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return first.minPercentage === 0 && last.maxPercentage === 100;
  },
  {
    message: 'Grade levels must cover 0-100%',
    path: ['gradeLevels'],
  }
);

type GradingSystemFormData = z.infer<typeof gradingSystemSchema>;

export default function GradingSystemPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gradingSystem, setGradingSystem] = useState<GradingSystem>(DEFAULT_GRADING_SYSTEM);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<GradingSystemFormData>({
    resolver: zodResolver(gradingSystemSchema),
    defaultValues: {
      name: DEFAULT_GRADING_SYSTEM.name,
      description: DEFAULT_GRADING_SYSTEM.description,
      gradeLevels: DEFAULT_GRADING_SYSTEM.gradeLevels.map((level) => ({
        ...level,
      })),
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'gradeLevels',
  });

  useEffect(() => {
    const loadGradingSystem = async () => {
      try {
        const res = await fetch('/api/settings/grading-system', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setGradingSystem(data);
            reset({
              name: data.name,
              description: data.description || '',
              gradeLevels: data.gradeLevels.map((level: any) => ({
                id: level.id,
                code: level.code,
                name: level.name,
                minPercentage: level.minPercentage,
                maxPercentage: level.maxPercentage,
                order: level.order,
              })),
            });
          } else {
            // Use default if no system found
            setGradingSystem(DEFAULT_GRADING_SYSTEM);
            reset({
              name: DEFAULT_GRADING_SYSTEM.name,
              description: DEFAULT_GRADING_SYSTEM.description,
              gradeLevels: DEFAULT_GRADING_SYSTEM.gradeLevels.map((level) => ({
                ...level,
              })),
            });
          }
        } else {
          // Use default on error
          setGradingSystem(DEFAULT_GRADING_SYSTEM);
          reset({
            name: DEFAULT_GRADING_SYSTEM.name,
            description: DEFAULT_GRADING_SYSTEM.description,
            gradeLevels: DEFAULT_GRADING_SYSTEM.gradeLevels.map((level) => ({
              ...level,
            })),
          });
        }
      } catch (error) {
        console.error('Failed to load grading system:', error);
        // Use default on error
        setGradingSystem(DEFAULT_GRADING_SYSTEM);
        reset({
          name: DEFAULT_GRADING_SYSTEM.name,
          description: DEFAULT_GRADING_SYSTEM.description,
          gradeLevels: DEFAULT_GRADING_SYSTEM.gradeLevels.map((level) => ({
            ...level,
          })),
        });
      } finally {
        setLoading(false);
      }
    };

    loadGradingSystem();
  }, [reset]);

  const onSubmit = async (data: GradingSystemFormData) => {
    setSaving(true);
    try {
      // Sort grade levels by order
      const sortedGradeLevels = [...data.gradeLevels].sort((a, b) => b.order - a.order);

      const updatedSystem: GradingSystem = {
        ...gradingSystem,
        name: data.name,
        description: data.description || '',
        gradeLevels: sortedGradeLevels,
        updatedAt: new Date(),
      };

      const res = await fetch('/api/settings/grading-system', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: gradingSystem.id,
          name: updatedSystem.name,
          description: updatedSystem.description,
          gradeLevels: updatedSystem.gradeLevels,
          isActive: updatedSystem.isActive,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save grading system');
      }

      const savedSystem = await res.json();
      setGradingSystem(savedSystem);
      showSuccess('Grading system updated successfully!');
    } catch (error: any) {
      console.error('Failed to save grading system:', error);
      showError(error.message || 'Failed to save grading system. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addGradeLevel = () => {
    const newOrder = Math.max(...fields.map((f) => f.order || 0), 0) + 1;
    append({
      id: `new_${Date.now()}`,
      code: '',
      name: '',
      minPercentage: 0,
      maxPercentage: 0,
      order: newOrder,
    });
  };

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
      <div>
        <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Grading System</h1>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          Configure the universal grading system used throughout the system
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs md:text-sm text-blue-800">
            <p className="font-semibold mb-1">Universal Grading System</p>
            <p>Changes to this grading system will affect all grade calculations throughout the system. Grade levels must cover 0-100% without overlapping ranges.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                System Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                {...register('description')}
                type="text"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
          </div>
        </div>

        {/* Grade Levels */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Grade Levels</h2>
            <button
              type="button"
              onClick={addGradeLevel}
              className="px-3 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Grade Level
            </button>
          </div>

          {errors.gradeLevels && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs md:text-sm text-red-800">{errors.gradeLevels.message}</p>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`gradeLevels.${index}.code`)}
                      type="text"
                      placeholder="HP"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {errors.gradeLevels?.[index]?.code && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.gradeLevels[index]?.code?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`gradeLevels.${index}.name`)}
                      type="text"
                      placeholder="High Proficient"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {errors.gradeLevels?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.gradeLevels[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Min % <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`gradeLevels.${index}.minPercentage`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {errors.gradeLevels?.[index]?.minPercentage && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.gradeLevels[index]?.minPercentage?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Max % <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`gradeLevels.${index}.maxPercentage`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {errors.gradeLevels?.[index]?.maxPercentage && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.gradeLevels[index]?.maxPercentage?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
                <input
                  type="hidden"
                  {...register(`gradeLevels.${index}.id`)}
                />
                <input
                  type="hidden"
                  {...register(`gradeLevels.${index}.order`, { valueAsNumber: true })}
                  value={index}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Grading System'}
          </button>
        </div>
      </form>
    </div>
  );
}

