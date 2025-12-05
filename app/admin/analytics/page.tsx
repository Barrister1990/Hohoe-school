'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Users, School, BookOpen, GraduationCap, TrendingUp, Loader2 } from 'lucide-react';
import { useAlert } from '@/components/shared/AlertProvider';

type AnalyticsType = 'student' | 'class' | 'subject' | 'bece' | null;

interface AnalyticsOption {
  type: AnalyticsType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function AIAnalyticsPage() {
  const router = useRouter();
  const { showWarning, showSuccess } = useAlert();
  const [selectedType, setSelectedType] = useState<AnalyticsType>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  // Load entities when type is selected
  useEffect(() => {
    const loadEntities = async () => {
      if (!selectedType) {
        setStudents([]);
        setClasses([]);
        setSubjects([]);
        return;
      }

      setLoadingEntities(true);
      try {
        if (selectedType === 'student') {
          const res = await fetch('/api/students', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setStudents(data.map((s: any) => ({
              id: s.id,
              name: `${s.studentId} - ${s.firstName} ${s.lastName}`,
            })));
          }
        } else if (selectedType === 'class') {
          const res = await fetch('/api/classes', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setClasses(data.map((c: any) => ({
              id: c.id,
              name: c.name,
            })));
          }
        } else if (selectedType === 'subject') {
          const res = await fetch('/api/subjects', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setSubjects(data.map((s: any) => ({
              id: s.id,
              name: s.name,
            })));
          }
        }
      } catch (error) {
        console.error('Failed to load entities:', error);
      } finally {
        setLoadingEntities(false);
      }
    };

    loadEntities();
  }, [selectedType]);

  const analyticsOptions: AnalyticsOption[] = [
    {
      type: 'student',
      label: 'Student Analytics',
      description: 'Detailed performance analysis for individual students with personalized feedback',
      icon: <Users className="h-6 w-6" />,
      color: 'blue',
    },
    {
      type: 'class',
      label: 'Class Analytics',
      description: 'Comprehensive class performance analysis with improvement recommendations',
      icon: <School className="h-6 w-6" />,
      color: 'green',
    },
    {
      type: 'subject',
      label: 'Subject Analytics',
      description: 'Subject-wise performance analysis across classes and students',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'purple',
    },
    {
      type: 'bece',
      label: 'BECE Results Analytics',
      description: 'Analysis of Basic Education Certificate Examination results and trends',
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'orange',
    },
  ];

  const handleGenerateAnalysis = async () => {
    if (!selectedType || !selectedEntity) {
      showWarning('Please select an analytics type and entity');
      return;
    }

    setLoading(true);
    setAnalysisResult('');

    try {
      // Generate real analysis based on actual data
      const analysis = await generateRealAnalysis(selectedType, selectedEntity);
      setAnalysisResult(analysis);
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      setAnalysisResult(`Error generating analysis: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateRealAnalysis = async (type: AnalyticsType, entity: string): Promise<string> => {
    try {
      const supabase = await import('@/lib/supabase/client').then(m => m.supabase);
      
      switch (type) {
        case 'student': {
          // Extract student ID from entity string (format: "STU001 - Name")
          const studentIdMatch = entity.match(/^([A-Z0-9]+)/);
          if (!studentIdMatch) {
            throw new Error('Invalid student format');
          }
          
          // Find student by ID
          const { data: students } = await supabase
            .from('students')
            .select('id, first_name, last_name, student_id')
            .ilike('student_id', `%${studentIdMatch[1]}%`)
            .limit(1);
          
          if (!students || students.length === 0) {
            throw new Error('Student not found');
          }
          
          const student = students[0];
          
          // Get student performance
          const perfRes = await fetch(`/api/analytics/students?studentId=${student.id}`, {
            credentials: 'include',
          });
          
          if (!perfRes.ok) {
            throw new Error('Failed to fetch student performance');
          }
          
          const performance = await perfRes.json();
          const perf = performance[0];
          
          if (!perf) {
            return `## Student Performance Analysis: ${entity}\n\nNo performance data available for this student yet.`;
          }
          
          return generateStudentAnalysis(entity, perf);
        }
        
        case 'class': {
          // Find class by name
          const { data: classes } = await supabase
            .from('classes')
            .select('id, name')
            .ilike('name', `%${entity}%`)
            .limit(1);
          
          if (!classes || classes.length === 0) {
            throw new Error('Class not found');
          }
          
          const classData = classes[0];
          
          // Get class performance
          const perfRes = await fetch(`/api/analytics/classes/${classData.id}`, {
            credentials: 'include',
          });
          
          if (!perfRes.ok) {
            throw new Error('Failed to fetch class performance');
          }
          
          const perf = await perfRes.json();
          
          return generateClassAnalysis(entity, perf);
        }
        
        case 'subject': {
          // Find subject by name
          const { data: subjects } = await supabase
            .from('subjects')
            .select('id, name')
            .ilike('name', `%${entity}%`)
            .limit(1);
          
          if (!subjects || subjects.length === 0) {
            throw new Error('Subject not found');
          }
          
          const subject = subjects[0];
          
          // Get subject performance
          const perfRes = await fetch(`/api/analytics/subjects?subjectId=${subject.id}`, {
            credentials: 'include',
          });
          
          if (!perfRes.ok) {
            throw new Error('Failed to fetch subject performance');
          }
          
          const performance = await perfRes.json();
          const perf = performance[0];
          
          if (!perf) {
            return `## Subject Performance Analysis: ${entity}\n\nNo performance data available for this subject yet.`;
          }
          
          return generateSubjectAnalysis(entity, perf);
        }
        
        case 'bece': {
          // Get BECE analytics
          const perfRes = await fetch(`/api/analytics/bece?academicYear=${entity}`, {
            credentials: 'include',
          });
          
          if (!perfRes.ok) {
            throw new Error('Failed to fetch BECE analytics');
          }
          
          const perf = await perfRes.json();
          
          return generateBECEAnalysis(entity, perf);
        }
        
        default:
          return 'Analysis not available';
      }
    } catch (error: any) {
      throw error;
    }
  };

  const generateStudentAnalysis = (entity: string, perf: any): string => {
    const trendText = perf.trend === 'improving' ? 'improving' : perf.trend === 'declining' ? 'declining' : 'stable';
    const trendDesc = perf.trend === 'improving' ? '**improving**' : perf.trend === 'declining' ? '**declining**' : '**stable**';
    
    return `## Student Performance Analysis: ${entity}

### Overall Performance Summary
The student shows **${perf.averageScore >= 70 ? 'good' : perf.averageScore >= 60 ? 'moderate' : 'needs improvement'} performance** with an average score of ${perf.averageScore.toFixed(1)}%. ${perf.subjectsCompleted} out of ${perf.totalSubjects} subjects have been graded.

### Performance Metrics
- **Average Score**: ${perf.averageScore.toFixed(1)}%
- **Grade**: ${perf.grade}
- **Attendance Rate**: ${perf.attendanceRate.toFixed(1)}%
- **Subjects Completed**: ${perf.subjectsCompleted}/${perf.totalSubjects}

### Performance Trend
The student's performance is ${trendDesc} over the past terms. ${perf.trend === 'improving' ? 'This is a positive sign. Continue current support strategies.' : perf.trend === 'declining' ? 'Immediate intervention is recommended.' : 'Consider additional challenges or support to help the student improve further.'}

### Recommendations
1. **Immediate Actions**:
   ${perf.averageScore < 60 ? '- Schedule extra tutoring sessions\n   - Provide additional learning materials\n   - Increase parent-teacher communication' : perf.averageScore < 70 ? '- Continue current support strategies\n   - Provide additional challenges\n   - Monitor progress closely' : '- Maintain current performance level\n   - Provide enrichment activities\n   - Encourage peer mentoring'}

2. **Study Plan**:
   - Allocate focused study time for weaker subjects
   - Review past assessments regularly
   - Set achievable improvement targets

3. **Support Systems**:
   - Regular progress monitoring
   - Parental involvement in homework
   - Encourage participation in group activities

### Predicted Outcomes
Based on current performance trends:
- **Current Grade**: ${perf.grade} (${perf.averageScore.toFixed(1)}%)
- **Recommendation**: ${perf.averageScore >= 70 ? 'Continue current study habits with added focus on maintaining performance' : 'Focus on improvement strategies with targeted support'}${perf.trend === 'improving' ? '. With continued improvement, expect better results next term.' : ''}`;
  };

  const generateClassAnalysis = (entity: string, perf: any): string => {
    return `## Class Performance Analysis: ${entity}

### Class Overview
The class demonstrates **${perf.averageScore >= 70 ? 'above-average' : perf.averageScore >= 60 ? 'average' : 'below-average'} performance** with an overall average of ${perf.averageScore.toFixed(1)}%. The class has ${perf.totalStudents} active students.

### Performance Breakdown
- **Top Performers**: ${perf.topPerformers} students (${((perf.topPerformers / perf.totalStudents) * 100).toFixed(1)}%) scoring above 80%
- **Average Performers**: ${perf.averagePerformers} students (${((perf.averagePerformers / perf.totalStudents) * 100).toFixed(1)}%) scoring 60-80%
- **Needs Support**: ${perf.needsSupport} students (${((perf.needsSupport / perf.totalStudents) * 100).toFixed(1)}%) scoring below 60%

### Subject Performance
${perf.subjectBreakdown.map((subj: any) => `- **${subj.subjectName}**: ${subj.average.toFixed(1)}% average`).join('\n')}

### Key Insights
- **Average Score**: ${perf.averageScore.toFixed(1)}%
- **Pass Rate**: ${perf.passRate}%
- **Attendance**: ${perf.attendanceRate.toFixed(1)}% average attendance

### Recommendations for Class Improvement
1. **Teaching Strategies**:
   - Implement differentiated instruction for varying ability levels
   - Use peer-to-peer learning groups
   - Increase hands-on activities

2. **Support Programs**:
   - After-school tutoring for struggling students
   - Enrichment programs for top performers
   - Regular parent-teacher meetings

3. **Resource Allocation**:
   - Additional learning materials
   - Technology integration in lessons
   - Regular progress monitoring

### Expected Outcomes
With implementation of these recommendations:
- **Target**: Achieve ${(perf.averageScore + 5).toFixed(1)}% class average by end of academic year
- **Focus**: Support ${perf.needsSupport} students who need additional help
- **Timeline**: 3-6 months for visible improvements`;
  };

  const generateSubjectAnalysis = (entity: string, perf: any): string => {
    const trendText = perf.trend === 'improving' ? 'improving' : perf.trend === 'declining' ? 'declining' : 'stable';
    
    return `## Subject Performance Analysis: ${entity}

### Subject Overview
${entity} shows **${perf.averageScore >= 70 ? 'good' : perf.averageScore >= 60 ? 'moderate' : 'needs improvement'} performance** across all classes with an average score of ${perf.averageScore.toFixed(1)}%.

### Performance Metrics
- **Average Score**: ${perf.averageScore.toFixed(1)}%
- **Pass Rate**: ${perf.passRate}%
- **Total Students**: ${perf.totalStudents}
- **Grades Completed**: ${perf.studentsCompleted} students

### Grade Distribution
- **HP (High Proficient)**: ${perf.gradeDistribution.HP} students
- **P (Proficient)**: ${perf.gradeDistribution.P} students
- **AP (Approaching Proficiency)**: ${perf.gradeDistribution.AP} students
- **D (Developing)**: ${perf.gradeDistribution.D} students
- **E (Emerging)**: ${perf.gradeDistribution.E} students

### Performance by Class
${perf.classPerformance.map((cp: any) => `- **${cp.className}**: ${cp.average.toFixed(1)}% average`).join('\n')}

### Key Findings
1. **Strengths**:
   ${perf.averageScore >= 70 ? '- Strong overall performance\n   - Good teacher-student engagement\n   - Effective use of teaching materials' : '- Consistent performance across classes\n   - Room for improvement'}

2. **Challenges**:
   ${perf.averageScore < 70 ? '- Performance below target\n   - Some students struggle with concepts\n   - Need for differentiated instruction' : '- Maintain current performance level\n   - Focus on struggling students'}

### Recommendations
1. **Curriculum Adjustments**:
   - Review curriculum for complexity
   - Add more practical examples
   - Increase formative assessments

2. **Teaching Methods**:
   - Use more interactive teaching methods
   - Implement project-based learning
   - Provide additional support materials

3. **Student Support**:
   - Remedial classes for struggling students
   - Advanced challenges for top performers
   - Regular progress monitoring

### Expected Impact
- **Target**: ${perf.averageScore < 70 ? `Increase subject average to ${(perf.averageScore + 5).toFixed(1)}% within 6 months` : 'Maintain current performance level'}
- **Focus Areas**: ${perf.gradeDistribution.D + perf.gradeDistribution.E > 0 ? `Support ${perf.gradeDistribution.D + perf.gradeDistribution.E} students in D and E categories` : 'Maintain high performance standards'}
- **Success Metrics**: Reduce below-average students to less than 10%`;
  };

  const generateBECEAnalysis = (entity: string, perf: any): string => {
    return `## BECE Results Analytics: ${entity}

### Overall BECE Performance
The ${entity} BECE cohort shows **${perf.averageAggregate <= 12 ? 'excellent' : perf.averageAggregate <= 18 ? 'very good' : perf.averageAggregate <= 24 ? 'good' : 'fair'} performance** with an average aggregate of ${perf.averageAggregate.toFixed(1)} (out of 36, lower is better).

### Results Breakdown
- **Excellent (Aggregate 6-12)**: ${perf.gradeDistribution.excellent} students (${((perf.gradeDistribution.excellent / perf.totalStudents) * 100).toFixed(1)}%)
- **Very Good (Aggregate 13-18)**: ${perf.gradeDistribution.veryGood} students (${((perf.gradeDistribution.veryGood / perf.totalStudents) * 100).toFixed(1)}%)
- **Good (Aggregate 19-24)**: ${perf.gradeDistribution.good} students (${((perf.gradeDistribution.good / perf.totalStudents) * 100).toFixed(1)}%)
- **Fair (Aggregate 25-30)**: ${perf.gradeDistribution.fair} students (${((perf.gradeDistribution.fair / perf.totalStudents) * 100).toFixed(1)}%)

### Subject Performance
${perf.subjectPerformance.map((sp: any) => `- **${sp.subject}**: Average Grade ${sp.averageGrade}`).join('\n')}

### Top Performers
${perf.topPerformers.slice(0, 10).map((tp: any, idx: number) => `${idx + 1}. ${tp.studentName} - Aggregate ${tp.aggregate}`).join('\n')}

### Key Insights
1. **Strengths**:
   ${perf.averageAggregate <= 18 ? '- Strong foundation in core subjects\n   - Good preparation and exam readiness\n   - Consistent performance across subjects' : '- Room for improvement in core subjects\n   - Need for better exam preparation'}

2. **Areas for Future Improvement**:
   - Focus on subjects with lower average grades
   - Enhanced exam preparation strategies
   - Time management during exams

### Recommendations for Future Cohorts
1. **Preparation Strategies**:
   - Start BECE preparation earlier (Basic 8)
   - Increase mock exam frequency
   - Focus on time management skills

2. **Curriculum Focus**:
   - Strengthen foundation in core subjects
   - More practical sessions
   - Enhanced writing skills

3. **Support Systems**:
   - Mentorship programs with past graduates
   - Parental involvement in preparation
   - Regular progress tracking

### Success Metrics
- **Current Performance**: Average aggregate ${perf.averageAggregate.toFixed(1)}
- **Target**: Achieve 50% excellent results (aggregate 6-12) in next cohort
- **Timeline**: 2-year improvement plan
- **Focus**: ${perf.subjectPerformance.filter((sp: any) => ['D7', 'E8', 'F9'].includes(sp.averageGrade)).length > 0 ? 'Subjects with lower grades' : 'Maintain current performance level'}`;
  };


  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            AI-Powered Analytics
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Get detailed performance analysis with actionable insights and recommendations
          </p>
        </div>
      </div>

      {/* Analytics Type Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Select Analytics Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => {
                setSelectedType(option.type);
                setSelectedEntity('');
                setAnalysisResult('');
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedType === option.type
                  ? option.color === 'blue'
                    ? 'border-blue-500 bg-blue-50'
                    : option.color === 'green'
                    ? 'border-green-500 bg-green-50'
                    : option.color === 'purple'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`mb-2 ${
                  option.color === 'blue'
                    ? 'text-blue-600'
                    : option.color === 'green'
                    ? 'text-green-600'
                    : option.color === 'purple'
                    ? 'text-purple-600'
                    : 'text-orange-600'
                }`}
              >
                {option.icon}
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                {option.label}
              </h3>
              <p className="text-xs md:text-sm text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Entity Selection */}
      {selectedType && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            Select {selectedType === 'student' ? 'Student' : selectedType === 'class' ? 'Class' : selectedType === 'subject' ? 'Subject' : 'Graduation Year'}
          </h2>
          <div className="mb-4">
            <select
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value);
                setAnalysisResult('');
              }}
              disabled={loadingEntities}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-wait"
            >
              <option value="">{loadingEntities ? 'Loading...' : 'Select...'}</option>
              {selectedType === 'student' && students.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
              {selectedType === 'class' && classes.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              {selectedType === 'subject' && subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
              {selectedType === 'bece' && (
                <>
                  <option value="2024/2025">2024/2025 Academic Year</option>
                  <option value="2023/2024">2023/2024 Academic Year</option>
                  <option value="2022/2023">2022/2023 Academic Year</option>
                </>
              )}
            </select>
          </div>
          {selectedEntity && (
            <button
              onClick={handleGenerateAnalysis}
              disabled={loading}
              className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI Analysis
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Analysis Results
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysisResult);
                showSuccess('Analysis copied to clipboard!');
              }}
              className="px-3 py-1 text-xs md:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Copy Analysis
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm md:text-base text-gray-700 leading-relaxed">
              {analysisResult}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

