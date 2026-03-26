'use client';

import { useAlert } from '@/components/shared/AlertProvider';
import { formatError } from '@/lib/utils/error-formatter';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Plus, Save, Trash2, UserCheck } from 'lucide-react';
import { Class, Subject } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  temporaryPassword: z.string().min(8, 'Temporary password must be at least 8 characters'),
  phone: z.string().optional(),
  isClassTeacher: z.boolean(),
  isSubjectTeacher: z.boolean(),
  classId: z.string().optional(),
}).refine((data) => data.isClassTeacher || data.isSubjectTeacher, {
  message: 'Teacher must have at least one role (Class Teacher or Subject Teacher)',
  path: ['isClassTeacher'],
}).refine((data) => !data.isClassTeacher || !!data.classId, {
  message: 'Please select a class for Class Teacher role',
  path: ['classId'],
});

type TeacherFormData = z.infer<typeof teacherSchema>;
type SubjectAssignmentInput = { classId: string; subjectId: string };

export default function AddTeacherPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignmentInput[]>([]);
  const [assignmentClassId, setAssignmentClassId] = useState('');
  const [assignmentSubjectId, setAssignmentSubjectId] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      isClassTeacher: false,
      isSubjectTeacher: false,
      temporaryPassword: '',
      classId: '',
    },
  });

  const isClassTeacher = watch('isClassTeacher');
  const isSubjectTeacher = watch('isSubjectTeacher');

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [classesRes, subjectsRes] = await Promise.all([
          fetch('/api/classes', { credentials: 'include' }),
          fetch('/api/subjects', { credentials: 'include' }),
        ]);

        if (!classesRes.ok || !subjectsRes.ok) {
          throw new Error('Failed to load classes and subjects');
        }

        const [classesData, subjectsData] = await Promise.all([
          classesRes.json(),
          subjectsRes.json(),
        ]);

        setClasses(Array.isArray(classesData) ? classesData : []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (error: any) {
        showError(error.message || 'Failed to load classes and subjects');
      } finally {
        setMetaLoading(false);
      }
    };

    loadMetadata();
  }, [showError]);

  const addSubjectAssignment = () => {
    if (!assignmentClassId || !assignmentSubjectId) {
      showError('Select both class and subject before adding assignment');
      return;
    }

    const exists = subjectAssignments.some(
      (item) => item.classId === assignmentClassId && item.subjectId === assignmentSubjectId
    );
    if (exists) {
      showError('This subject assignment already exists');
      return;
    }

    setSubjectAssignments((prev) => [
      ...prev,
      { classId: assignmentClassId, subjectId: assignmentSubjectId },
    ]);
    setAssignmentClassId('');
    setAssignmentSubjectId('');
  };

  const removeSubjectAssignment = (index: number) => {
    setSubjectAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TeacherFormData) => {
    if (data.isSubjectTeacher && subjectAssignments.length === 0) {
      showError('Please add at least one subject assignment for Subject Teacher role');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/teachers/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          isClassTeacher: data.isClassTeacher,
          isSubjectTeacher: data.isSubjectTeacher,
          classId: data.isClassTeacher ? data.classId : null,
          subjectAssignments: data.isSubjectTeacher ? subjectAssignments : [],
          password: data.temporaryPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create teacher');
      }

      showSuccess(
        `Teacher account created successfully!\n\n` +
        `Email: ${result.user.email}\n` +
        `Email is already confirmed. No invite link was sent.\n` +
        `The teacher will need this temporary password on first login:\n\n` +
        `Temporary password: ${data.temporaryPassword}\n` +
        `(Please share this securely with the teacher)`
      );
      router.push('/admin/teachers');
    } catch (error: any) {
      console.error('Failed to create teacher:', error);
      const friendlyError = formatError(error);
      showError(friendlyError);
    } finally {
      setLoading(false);
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
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Add New Teacher</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Create a new teacher account
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-blue-800">
            <strong>Note:</strong> This creates the teacher account directly. Email is marked as verified automatically, no invite link is sent, and you can assign class/subjects immediately.
          </p>
        </div>

        {/* Basic Information */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="temporaryPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <input
                {...register('temporaryPassword')}
                type="password"
                id="temporaryPassword"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Enter temporary password"
              />
              {errors.temporaryPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.temporaryPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="+233XXXXXXXXX"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    {...register('isClassTeacher')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Class Teacher</span>
                    <p className="text-xs text-gray-600">Manage a class, add students, record attendance</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    {...register('isSubjectTeacher')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Subject Teacher</span>
                    <p className="text-xs text-gray-600">Grade students in assigned subjects</p>
                  </div>
                </label>
              </div>
              {errors.isClassTeacher && (
                <p className="mt-1 text-xs text-red-600">{errors.isClassTeacher.message}</p>
              )}
            </div>
          </div>
        </div>

        {isClassTeacher && (
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Class Teacher Assignment</h2>
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Class <span className="text-red-500">*</span>
              </label>
              <select
                {...register('classId')}
                id="classId"
                disabled={metaLoading}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:bg-gray-100"
              >
                <option value="">{metaLoading ? 'Loading classes...' : 'Select Class'}</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <p className="mt-1 text-xs text-red-600">{errors.classId.message}</p>
              )}
            </div>
          </div>
        )}

        {isSubjectTeacher && (
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Subject Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={assignmentClassId}
                onChange={(e) => setAssignmentClassId(e.target.value)}
                disabled={metaLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm disabled:bg-gray-100"
              >
                <option value="">{metaLoading ? 'Loading classes...' : 'Select Class'}</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <select
                value={assignmentSubjectId}
                onChange={(e) => setAssignmentSubjectId(e.target.value)}
                disabled={metaLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm disabled:bg-gray-100"
              >
                <option value="">{metaLoading ? 'Loading subjects...' : 'Select Subject'}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSubjectAssignment}
                className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Assignment
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {subjectAssignments.length === 0 ? (
                <p className="text-xs text-gray-500">No subject assignments added yet.</p>
              ) : (
                subjectAssignments.map((assignment, index) => {
                  const className = classes.find((cls) => cls.id === assignment.classId)?.name || 'Unknown Class';
                  const subjectName = subjects.find((subject) => subject.id === assignment.subjectId)?.name || 'Unknown Subject';
                  return (
                    <div
                      key={`${assignment.classId}-${assignment.subjectId}-${index}`}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="text-sm text-gray-800">
                        {subjectName} <span className="text-gray-500">({className})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubjectAssignment(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Role Information */}
        {(isClassTeacher || isSubjectTeacher) && (
          <div className={`border rounded-lg p-4 ${
            isClassTeacher && isSubjectTeacher
              ? 'bg-purple-50 border-purple-200'
              : isClassTeacher
              ? 'bg-blue-50 border-blue-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start gap-3">
              <UserCheck className={`h-5 w-5 mt-0.5 ${
                isClassTeacher && isSubjectTeacher
                  ? 'text-purple-600'
                  : isClassTeacher
                  ? 'text-blue-600'
                  : 'text-green-600'
              }`} />
              <div>
                <h3 className={`text-sm font-semibold mb-1 ${
                  isClassTeacher && isSubjectTeacher
                    ? 'text-purple-900'
                    : isClassTeacher
                    ? 'text-blue-900'
                    : 'text-green-900'
                }`}>
                  {isClassTeacher && isSubjectTeacher
                    ? 'Class Teacher & Subject Teacher'
                    : isClassTeacher
                    ? 'Class Teacher'
                    : 'Subject Teacher'}
                </h3>
                <p className={`text-xs ${
                  isClassTeacher && isSubjectTeacher
                    ? 'text-purple-800'
                    : isClassTeacher
                    ? 'text-blue-800'
                    : 'text-green-800'
                }`}>
                  {isClassTeacher && isSubjectTeacher
                    ? 'This teacher can manage a class AND teach subjects. They will have full access to both class management and subject grading features.'
                    : isClassTeacher
                    ? 'Class teachers can manage their assigned class, add students, record attendance, and conduct evaluations.'
                    : 'Subject teachers can grade students in their assigned subjects and create assessments.'}
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={loading || metaLoading}
            className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Teacher
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

