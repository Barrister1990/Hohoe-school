'use client';

import { useAlert } from '@/components/shared/AlertProvider';
import { ClassTeacherEvaluation, ClassTeacherReward, ConductRating, InterestLevel } from '@/lib/services/evaluation-service';
import { offlineTeacherService } from '@/lib/services/offline-teacher-service';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getAcademicYearOptions, getCurrentAcademicYear } from '@/lib/utils/academic-years';
import { Class, Student } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Award, Plus, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Helper functions to map between form values and database values
const mapConductToDb = (value: string): ConductRating | undefined => {
  const map: Record<string, ConductRating> = {
    'excellent': 'Excellent',
    'very_good': 'Very Good',
    'good': 'Good',
    'satisfactory': 'Satisfactory',
    'needs_improvement': 'Needs Improvement',
  };
  return map[value];
};

const mapConductFromDb = (value: ConductRating | undefined): string | undefined => {
  const map: Record<ConductRating, string> = {
    'Excellent': 'excellent',
    'Very Good': 'very_good',
    'Good': 'good',
    'Satisfactory': 'satisfactory',
    'Needs Improvement': 'needs_improvement',
  };
  return value ? map[value] : undefined;
};

const mapInterestToDb = (value: string): InterestLevel | undefined => {
  const map: Record<string, InterestLevel> = {
    'very_high': 'Very High',
    'high': 'High',
    'moderate': 'Moderate',
    'low': 'Low',
    'very_low': 'Very Low',
  };
  return map[value];
};

const mapInterestFromDb = (value: InterestLevel | undefined): string | undefined => {
  const map: Record<InterestLevel, string> = {
    'Very High': 'very_high',
    'High': 'high',
    'Moderate': 'moderate',
    'Low': 'low',
    'Very Low': 'very_low',
  };
  return value ? map[value] : undefined;
};

const conductSchema = z.object({
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.enum(['1', '2', '3'], { message: 'Term is required' }),
  conduct: z.enum(['excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement'], {
    message: 'Conduct rating is required',
  }),
  conductRemarks: z.string().optional(),
  interest: z.enum(['very_high', 'high', 'moderate', 'low', 'very_low'], {
    message: 'Interest level is required',
  }),
  interestRemarks: z.string().optional(),
  remarks: z.string().optional(),
  rewards: z.array(z.string()),
});

type ConductFormData = z.infer<typeof conductSchema>;

const conductOptions: { value: string; label: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'very_good', label: 'Very Good', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'good', label: 'Good', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'satisfactory', label: 'Satisfactory', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'needs_improvement', label: 'Needs Improvement', color: 'bg-red-100 text-red-800 border-red-300' },
];

const interestOptions: { value: string; label: string; color: string }[] = [
  { value: 'very_high', label: 'Very High', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'high', label: 'High', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'low', label: 'Low', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'very_low', label: 'Very Low', color: 'bg-red-100 text-red-800 border-red-300' },
];

const rewardTypes: { value: string; label: string; icon: string }[] = [
  { value: 'merit', label: 'Merit', icon: '⭐' },
  { value: 'achievement', label: 'Achievement', icon: '🏆' },
  { value: 'participation', label: 'Participation', icon: '👏' },
  { value: 'leadership', label: 'Leadership', icon: '👑' },
  { value: 'improvement', label: 'Improvement', icon: '📈' },
];

export default function ConductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { showError, showSuccess, showInfo } = useAlert();
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, ClassTeacherEvaluation>>({});
  const [rewards, setRewards] = useState<Record<string, ClassTeacherReward[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>('1');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(getCurrentAcademicYear());
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newReward, setNewReward] = useState({ type: '', description: '' });

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        // Get teacher's class
        const classesRes = await fetch(`/api/classes/teacher/${user.id}`, { credentials: 'include' });
        if (!classesRes.ok) {
          throw new Error('Failed to load classes');
        }
        const teacherClasses = await classesRes.json();
        const myClass = Array.isArray(teacherClasses) && teacherClasses.length > 0 ? teacherClasses[0] : null;

        if (myClass) {
          setClassInfo(myClass);
          
          // Load students
          const studentsRes = await fetch(`/api/students?classId=${myClass.id}`, { credentials: 'include' });
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            setStudents(Array.isArray(studentsData) ? studentsData : []);
            
            // Load evaluations for all students
            const evaluationsRes = await fetch(
              `/api/evaluations?classId=${myClass.id}&term=${selectedTerm}&academicYear=${selectedAcademicYear}`,
              { credentials: 'include' }
            );
            
            if (evaluationsRes.ok) {
              const evaluationsData = await evaluationsRes.json();
              const evals: Record<string, ClassTeacherEvaluation> = {};
              evaluationsData.forEach((evaluation: ClassTeacherEvaluation) => {
                evals[evaluation.studentId] = evaluation;
              });
              setEvaluations(evals);
            }
            
            // Load rewards for all students (async, don't block)
            const loadRewards = async () => {
              const rewardsMap: Record<string, ClassTeacherReward[]> = {};
              for (const student of studentsData) {
                try {
                  const rewardsRes = await fetch(`/api/rewards?studentId=${student.id}`, { credentials: 'include' });
                  if (rewardsRes.ok) {
                    const rewardsData = await rewardsRes.json();
                    rewardsMap[student.id] = Array.isArray(rewardsData) ? rewardsData : [];
                  } else {
                    rewardsMap[student.id] = [];
                  }
                } catch (error) {
                  rewardsMap[student.id] = [];
                }
              }
              setRewards(rewardsMap);
            };
            loadRewards();
          } else {
            setStudents([]);
          }
        }
      } catch (error: any) {
        console.error('Failed to load data:', error);
        showError(error.message || 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, selectedTerm, selectedAcademicYear]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ConductFormData>({
    resolver: zodResolver(conductSchema),
    defaultValues: {
      academicYear: selectedAcademicYear,
      term: selectedTerm as '1' | '2' | '3',
      conduct: undefined,
      interest: undefined,
      rewards: [],
    },
  });

  const watchedRewards = watch('rewards') || [];

  const handleStudentClick = (studentId: string) => {
    setSelectedStudent(studentId);
    const evaluation = evaluations[studentId];
    if (evaluation) {
      const mappedConduct = mapConductFromDb(evaluation.conductRating) as 'excellent' | 'very_good' | 'good' | 'satisfactory' | 'needs_improvement' | undefined;
      const mappedInterest = mapInterestFromDb(evaluation.interestLevel) as 'very_high' | 'high' | 'moderate' | 'low' | 'very_low' | undefined;
      
      reset({
        academicYear: evaluation.academicYear,
        term: evaluation.term.toString() as '1' | '2' | '3',
        conduct: mappedConduct,
        conductRemarks: evaluation.conductRemarks || '',
        interest: mappedInterest,
        interestRemarks: evaluation.interestRemarks || '',
        remarks: '', // Not stored in evaluation table
        rewards: rewards[studentId]?.map((r) => r.id) || [],
      });
    } else {
      reset({
        academicYear: selectedAcademicYear,
        term: selectedTerm as '1' | '2' | '3',
        conduct: undefined,
        interest: undefined,
        rewards: [],
      });
    }
  };

  const handleAddReward = async () => {
    if (!selectedStudent || !newReward.type || !newReward.description) return;
    
    try {
      // Map reward type to database format
      const rewardTypeMap: Record<string, 'Merit' | 'Achievement' | 'Participation' | 'Leadership' | 'Improvement' | 'Other'> = {
        'merit': 'Merit',
        'achievement': 'Achievement',
        'participation': 'Participation',
        'leadership': 'Leadership',
        'improvement': 'Improvement',
        'other': 'Other',
      };
      
      const rewardType = rewardTypeMap[newReward.type.toLowerCase()] || 'Other';
      
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: selectedStudent,
          rewardType: rewardType,
          description: newReward.description,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create reward');
      }

      const reward = await res.json();
      
      // Update local state
      setRewards({
        ...rewards,
        [selectedStudent]: [...(rewards[selectedStudent] || []), reward],
      });
      
      setValue('rewards', [...watchedRewards, reward.id]);
      setNewReward({ type: '', description: '' });
      setShowRewardModal(false);
    } catch (error: any) {
      console.error('Failed to add reward:', error);
      showError(error.message || 'Failed to add reward. Please try again.');
    }
  };

  const handleRemoveReward = async (rewardId: string) => {
    if (!selectedStudent) return;
    
    try {
      const res = await fetch(`/api/rewards/${rewardId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete reward');
      }

      // Update local state
      setRewards({
        ...rewards,
        [selectedStudent]: (rewards[selectedStudent] || []).filter((r) => r.id !== rewardId),
      });
      
      setValue('rewards', watchedRewards.filter((id) => id !== rewardId));
    } catch (error: any) {
      console.error('Failed to remove reward:', error);
      showError(error.message || 'Failed to remove reward. Please try again.');
    }
  };

  const onSubmit = async (data: ConductFormData) => {
    if (!selectedStudent || !user?.id || !classInfo) return;

    setSaving(true);
    try {
      const evaluationData = {
        studentId: selectedStudent,
        classId: classInfo.id,
        teacherId: user.id,
        term: parseInt(data.term),
        academicYear: data.academicYear,
        conductRating: data.conduct ? mapConductToDb(data.conduct) : undefined,
        conductRemarks: data.conductRemarks || undefined,
        interestLevel: data.interest ? mapInterestToDb(data.interest) : undefined,
        interestRemarks: data.interestRemarks || undefined,
      };

      // Use offline service - it handles online/offline automatically
      const result = await offlineTeacherService.saveEvaluation(evaluationData);

      // Update local state
      const evaluationRecord: ClassTeacherEvaluation = {
        ...evaluationData,
        id: result.id || `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setEvaluations({
        ...evaluations,
        [selectedStudent]: evaluationRecord,
      });

      if (result.queued) {
        showInfo('Evaluation saved locally. It will sync when you\'re back online.');
      } else {
        showSuccess('Evaluation saved successfully!');
      }
      
      setSelectedStudent(null);
    } catch (error: any) {
      console.error('Failed to save evaluation:', error);
      showError(error.message || 'Failed to save evaluation. Please try again.');
    } finally {
      setSaving(false);
    }
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

  if (!classInfo) {
    return (
      <div className="w-full min-w-0 space-y-4 md:space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 text-center">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            No Class Assigned
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            You don't have a class assigned yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.push('/teacher/my-class')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Conduct & Interest</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Evaluate student conduct, interest, and award rewards
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              {getAcademicYearOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Students List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm md:text-base font-semibold text-gray-900">
              Students ({students.length})
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {students.map((student) => {
              const evaluation = evaluations[student.id];
              const isSelected = selectedStudent === student.id;

              return (
                <button
                  key={student.id}
                  onClick={() => handleStudentClick(student.id)}
                  className={`w-full p-3 md:p-4 border-b border-gray-200 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs md:text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    {evaluation && (evaluation.conductRating || evaluation.interestLevel) && (
                      <Award className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-600">{student.studentId}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
          {selectedStudent ? (
            <>
              <div className="mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  {students.find((s) => s.id === selectedStudent)?.firstName}{' '}
                  {students.find((s) => s.id === selectedStudent)?.lastName}
                </h2>
                <p className="text-xs md:text-sm text-gray-600">
                  {students.find((s) => s.id === selectedStudent)?.studentId}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                {/* Conduct Rating */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Conduct Rating <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="conduct"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base bg-white"
                      >
                        <option value="">Select conduct rating</option>
                        {conductOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.conduct && (
                    <p className="mt-1 text-xs text-red-600">{errors.conduct.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Rate the student's behavior and adherence to school rules
                  </p>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Conduct Remarks
                  </label>
                  <textarea
                    {...register('conductRemarks')}
                    rows={2}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder="Add remarks about student conduct..."
                  />
                </div>

                {/* Interest Level */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Interest Level <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="interest"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base bg-white"
                      >
                        <option value="">Select interest level</option>
                        {interestOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.interest && (
                    <p className="mt-1 text-xs text-red-600">{errors.interest.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Assess the student's level of interest and engagement in learning
                  </p>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Interest Remarks
                  </label>
                  <textarea
                    {...register('interestRemarks')}
                    rows={2}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder="Add remarks about student interest..."
                  />
                </div>

                {/* Rewards */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs md:text-sm font-medium text-gray-700">
                      Rewards
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRewardModal(true)}
                      className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3 md:h-4 md:w-4" />
                      Add Reward
                    </button>
                  </div>
                  {selectedStudent && rewards[selectedStudent] && rewards[selectedStudent].length > 0 ? (
                    <div className="space-y-2">
                      {rewards[selectedStudent].map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <p className="text-xs md:text-sm font-medium text-gray-900">{reward.rewardType}</p>
                            {reward.description && (
                              <p className="text-[10px] md:text-xs text-gray-600 mt-1">{reward.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveReward(reward.id)}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm text-gray-500 italic">No rewards added yet</p>
                  )}
                </div>


                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Evaluation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <Award className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm md:text-base text-gray-600 mb-2">Select a student to evaluate</p>
              <p className="text-xs text-gray-500">Click on a student from the list to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Add Reward</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Reward Type
                </label>
                <select
                  value={newReward.type}
                  onChange={(e) => setNewReward({ ...newReward, type: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="">Select reward type</option>
                  {rewardTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Describe the reward..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRewardModal(false);
                  setNewReward({ type: '', description: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReward}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Add Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

