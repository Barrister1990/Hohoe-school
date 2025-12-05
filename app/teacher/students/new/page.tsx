'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Class } from '@/types';
import { useAlert } from '@/components/shared/AlertProvider';

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female'], { message: 'Gender is required' }),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  address: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function AddStudentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { showError, showSuccess, showWarning } = useAlert();
  const [loading, setLoading] = useState(false);
  const [myClass, setMyClass] = useState<Class | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    const loadMyClass = async () => {
      if (!user?.id) return;
      
      try {
        const classesRes = await fetch(`/api/classes/teacher/${user.id}`, { credentials: 'include' });
        if (classesRes.ok) {
          const teacherClasses = await classesRes.json();
          const teacherClass = Array.isArray(teacherClasses) && teacherClasses.length > 0 ? teacherClasses[0] : null;
          setMyClass(teacherClass);
        }
      } catch (error: any) {
        console.error('Failed to load class:', error);
        showError(error.message || 'Failed to load class. Please try again.');
      }
    };

    loadMyClass();
  }, [user?.id]);

  const onSubmit = async (data: StudentFormData) => {
    if (!myClass || !user?.id) {
      showWarning('You do not have a class assigned. Please contact your administrator.');
      return;
    }

    setLoading(true);
    try {
      // Generate student ID
      const idRes = await fetch('/api/students/generate-id', { credentials: 'include' });
      if (!idRes.ok) {
        throw new Error('Failed to generate student ID');
      }
      const { studentId } = await idRes.json();

      // Create student
      const createRes = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: studentId,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName || undefined,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          classId: myClass.id,
          classTeacherId: user.id,
          parentName: data.parentName || undefined,
          parentPhone: data.parentPhone || undefined,
          address: data.address || undefined,
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'active',
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create student');
      }

      showSuccess('Student added successfully!');
      router.push('/teacher/students');
    } catch (error: any) {
      console.error('Failed to add student:', error);
      showError(error.message || 'Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!myClass) {
    return (
      <div className="w-full min-w-0 space-y-4 md:space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 text-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            No Class Assigned
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            You don't have a class assigned yet. Please contact your administrator to assign you a class.
          </p>
          <button
            onClick={() => router.push('/teacher/students')}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.push('/teacher/students')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Add New Student</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Add a student to {myClass.name}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
        <p className="text-xs md:text-sm text-blue-800">
          <strong>Note:</strong> This student will be added to <strong>{myClass.name}</strong>. The student ID will be automatically generated.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('firstName')}
                type="text"
                id="firstName"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                {...register('middleName')}
                type="text"
                id="middleName"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('lastName')}
                type="text"
                id="lastName"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                {...register('dateOfBirth')}
                type="date"
                id="dateOfBirth"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                {...register('gender')}
                id="gender"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                {...register('address')}
                type="text"
                id="address"
                placeholder="Hohoe, Volta Region"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        {/* Class Information (Read-only) */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Class Assignment</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
            <p className="text-sm text-gray-600 mb-1">Class</p>
            <p className="text-base font-medium text-gray-900">{myClass.name}</p>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
                Parent/Guardian Name
              </label>
              <input
                {...register('parentName')}
                type="text"
                id="parentName"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
            </div>

            <div>
              <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Parent/Guardian Phone
              </label>
              <input
                {...register('parentPhone')}
                type="tel"
                id="parentPhone"
                placeholder="+233XXXXXXXXX"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/teacher/students')}
            className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Add Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

