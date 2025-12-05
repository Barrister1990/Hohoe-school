/**
 * Mock Data Service
 * Provides mock data for development before Supabase integration
 */

import { Student, Class, User, Subject, UserRole } from '@/types';
import { mockAuthService } from './mock-auth-service';

// Mock Students Data
const mockStudents: Student[] = [
  {
    id: '1',
    studentId: 'STU001',
    firstName: 'Kwame',
    lastName: 'Asante',
    middleName: 'Kofi',
    dateOfBirth: new Date('2010-05-15'),
    gender: 'male',
    classId: '1',
    classTeacherId: '2',
    parentName: 'Yaw Asante',
    parentPhone: '+233241234567',
    address: 'Hohoe, Volta Region',
    enrollmentDate: new Date('2024-01-10'),
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    studentId: 'STU002',
    firstName: 'Ama',
    lastName: 'Mensah',
    middleName: 'Serwaa',
    dateOfBirth: new Date('2010-08-20'),
    gender: 'female',
    classId: '1',
    classTeacherId: '2',
    parentName: 'Kofi Mensah',
    parentPhone: '+233241234568',
    address: 'Hohoe, Volta Region',
    enrollmentDate: new Date('2024-01-10'),
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    studentId: 'STU003',
    firstName: 'Kojo',
    lastName: 'Osei',
    dateOfBirth: new Date('2011-03-12'),
    gender: 'male',
    classId: '1',
    classTeacherId: '2',
    parentName: 'Ama Osei',
    parentPhone: '+233241234569',
    address: 'Hohoe, Volta Region',
    enrollmentDate: new Date('2024-01-10'),
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    studentId: 'STU004',
    firstName: 'Akosua',
    lastName: 'Boateng',
    middleName: 'Adwoa',
    dateOfBirth: new Date('2010-11-08'),
    gender: 'female',
    classId: '1',
    classTeacherId: '2',
    parentName: 'Kwame Boateng',
    parentPhone: '+233241234570',
    address: 'Hohoe, Volta Region',
    enrollmentDate: new Date('2024-01-10'),
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '5',
    studentId: 'STU005',
    firstName: 'Yaw',
    lastName: 'Adjei',
    dateOfBirth: new Date('2010-02-14'),
    gender: 'male',
    classId: '1',
    classTeacherId: '2',
    parentName: 'Ama Adjei',
    parentPhone: '+233241234571',
    address: 'Hohoe, Volta Region',
    enrollmentDate: new Date('2024-01-10'),
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '6',
    studentId: 'STU006',
    firstName: 'Efua',
    lastName: 'Darko',
    middleName: 'Ama',
    dateOfBirth: new Date('2011-07-22'),
    gender: 'female',
    classId: '2',
    classTeacherId: '2',
    parentName: 'Kofi Darko',
    parentPhone: '+233241234572',
    address: 'Hohoe, Volta Region',
    enrollmentDate: new Date('2024-01-10'),
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '7',
    studentId: 'STU007',
    firstName: 'Kofi',
    lastName: 'Appiah',
    dateOfBirth: new Date('2011-04-30'),
    gender: 'male',
    classId: '2',
    classTeacherId: '2',
    parentName: 'Yaa Appiah',
    parentPhone: '+233241234573',
    address: 'Hohoe, Volta Region',
    enrollmentDate: new Date('2024-01-10'),
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

// Mock Classes Data
const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Basic 1A',
    level: 2, // Basic 1 = level 2
    stream: 'A',
    classTeacherId: '2',
    academicYear: '2024/2025',
    term: 1,
    studentCount: 5,
    capacity: 30,
    subjects: ['1', '2', '3'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Basic 2A',
    level: 3, // Basic 2 = level 3
    stream: 'A',
    classTeacherId: '2',
    academicYear: '2024/2025',
    term: 1,
    studentCount: 2,
    capacity: 30,
    subjects: ['1', '2', '3'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Basic 3A',
    level: 4, // Basic 3 = level 4
    stream: 'A',
    classTeacherId: '2',
    academicYear: '2024/2025',
    term: 1,
    studentCount: 0,
    capacity: 30,
    subjects: ['1', '2', '3'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Teachers Data (Users with teacher role)
const mockTeachers: User[] = [
  {
    id: '2',
    email: 'teacher@hohoe.edu.gh',
    name: 'Test Teacher',
    role: 'class_teacher',
    phone: '+233123456790',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    email: 'subjectteacher@hohoe.edu.gh',
    name: 'Subject Teacher',
    role: 'subject_teacher',
    phone: '+233123456791',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Subjects Data
const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH',
    category: 'core',
    levelCategories: ['Lower Primary', 'Upper Primary', 'JHS'],
    description: 'Basic Mathematics',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'English Language',
    code: 'ENG',
    category: 'core',
    levelCategories: ['Lower Primary', 'Upper Primary', 'JHS'],
    description: 'English Language and Literature',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Science',
    code: 'SCI',
    category: 'core',
    levelCategories: ['Lower Primary', 'Upper Primary'],
    description: 'Basic Science',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

class MockDataService {
  // Students
  async getStudents(classId?: string): Promise<Student[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (classId) {
      return mockStudents.filter((s) => s.classId === classId);
    }
    return [...mockStudents];
  }

  async getStudent(id: string): Promise<Student | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockStudents.find((s) => s.id === id) || null;
  }

  async addStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // If classTeacherId is not set, get it from the class
    let classTeacherId = student.classTeacherId;
    if (!classTeacherId && student.classId) {
      const classData = mockClasses.find((c) => c.id === student.classId);
      if (classData) {
        classTeacherId = classData.classTeacherId;
      }
    }
    
    const newStudent: Student = {
      ...student,
      classTeacherId: classTeacherId || '',
      id: String(mockStudents.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStudents.push(newStudent);
    
    // Update class student count
    const classData = mockClasses.find((c) => c.id === student.classId);
    if (classData) {
      classData.studentCount = mockStudents.filter((s) => s.classId === student.classId).length;
    }
    
    return newStudent;
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockClasses];
  }

  async getClass(id: string): Promise<Class | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockClasses.find((c) => c.id === id) || null;
  }

  async addClass(classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newClass: Class = {
      ...classData,
      id: String(mockClasses.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockClasses.push(newClass);
    return newClass;
  }

  // Teachers
  async getTeachers(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockTeachers];
  }

  async getTeacher(id: string): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockTeachers.find((t) => t.id === id) || null;
  }

  async addTeacher(teacherData: {
    name: string;
    email: string;
    phone?: string;
    isClassTeacher: boolean;
    isSubjectTeacher: boolean;
  }): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Determine role based on teacher type
    // Note: If a teacher is both class and subject teacher, we use 'class_teacher' as the primary role
    // The system will handle dual roles through assignments
    let role: UserRole;
    if (teacherData.isClassTeacher && teacherData.isSubjectTeacher) {
      // If both, we'll use 'class_teacher' as primary role
      // In real app, you might want to handle this differently or have a combined role
      role = 'class_teacher';
    } else if (teacherData.isClassTeacher) {
      role = 'class_teacher';
    } else {
      role = 'subject_teacher';
    }

    // Create user account via auth service
    // This creates the user account with email verification pending and password change required
    const { user } = await mockAuthService.createUser({
      email: teacherData.email,
      name: teacherData.name,
      role,
      phone: teacherData.phone,
    });

    // Add to teachers list
    mockTeachers.push(user);

    return user;
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockSubjects];
  }

  async getSubject(id: string): Promise<Subject | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockSubjects.find((s) => s.id === id) || null;
  }

  async addSubject(subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subject> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newSubject: Subject = {
      ...subject,
      id: String(mockSubjects.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockSubjects.push(newSubject);
    return newSubject;
  }

  // Statistics
  async getStatistics() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      totalStudents: mockStudents.length,
      totalTeachers: mockTeachers.length,
      totalClasses: mockClasses.length,
      activeClasses: mockClasses.length, // All classes are active by default
      pendingTasks: 5, // Mock value
    };
  }

  // Teacher Statistics
  async getTeacherStatistics(teacherId: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const teacher = mockTeachers.find((t) => t.id === teacherId);
    if (!teacher) {
      return {
        myStudents: 0,
        myClasses: 0,
        assignedSubjects: 0,
        pendingGrades: 0,
        completedAssessments: 0,
      };
    }

    // Get students in teacher's class(es)
    const myStudents = mockStudents.filter(
      (s) => s.classTeacherId === teacherId
    ).length;

    // Get classes assigned to teacher
    const myClasses = mockClasses.filter(
      (c) => c.classTeacherId === teacherId
    ).length;

    // Get assigned subjects (would need subject assignments table in real app)
    const assignedSubjects = 3; // Mock value

    // Mock pending grades
    const pendingGrades = 15; // Mock value

    // Mock completed assessments
    const completedAssessments = 8; // Mock value

    return {
      myStudents,
      myClasses,
      assignedSubjects,
      pendingGrades,
    };
  }

  // Teacher Chart Data
  async getTeacherAssessmentTrends(teacherId: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Mock assessment trends for teacher
    return [
      { month: 'Jan', assessments: 12 },
      { month: 'Feb', assessments: 15 },
      { month: 'Mar', assessments: 18 },
      { month: 'Apr', assessments: 14 },
      { month: 'May', assessments: 20 },
      { month: 'Jun', assessments: 16 },
    ];
  }

  async getTeacherClassPerformance(teacherId: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Mock class performance data
    const teacherClasses = mockClasses.filter((c) => c.classTeacherId === teacherId);
    return teacherClasses.map((cls) => ({
      name: cls.name,
      averageScore: Math.floor(Math.random() * 30) + 70, // Mock average score
      students: cls.studentCount,
    }));
  }

  // Chart Data
  async getAssessmentTrends() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Mock assessment data for last 6 months
    return [
      { month: 'Jan', assessments: 8 },
      { month: 'Feb', assessments: 12 },
      { month: 'Mar', assessments: 15 },
      { month: 'Apr', assessments: 18 },
      { month: 'May', assessments: 20 },
      { month: 'Jun', assessments: 22 },
    ];
  }

  async getClassDistribution() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockClasses.map((cls) => ({
      name: cls.name,
      students: cls.studentCount,
    }));
  }

  async getGenderDistribution() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const male = mockStudents.filter((s) => s.gender === 'male').length;
    const female = mockStudents.filter((s) => s.gender === 'female').length;
    return [
      { name: 'Male', value: male },
      { name: 'Female', value: female },
    ];
  }

  // Teacher Performance Tracking
  async getTeacherPerformance(teacherId: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const teacher = mockTeachers.find((t) => t.id === teacherId);
    if (!teacher) return null;

    const isClassTeacher = teacher.role === 'class_teacher';
    const isSubjectTeacher = teacher.role === 'subject_teacher';

    // Mock performance data - in real app, this would query actual data
    if (isClassTeacher) {
      const assignedClass = mockClasses.find((c) => c.classTeacherId === teacherId);
      const studentsInClass = assignedClass 
        ? mockStudents.filter((s) => s.classId === assignedClass.id)
        : [];

      // Mock: Check if evaluations and attendance are done
      // In real app, check if ClassTeacherEvaluation exists for current term/year
      const currentTerm = 1; // This would come from system settings
      const currentAcademicYear = '2024/2025'; // This would come from system settings
      
      // Mock: Assume some evaluations are done
      const evaluationsDone = studentsInClass.length > 0 ? Math.floor(studentsInClass.length * 0.7) : 0;
      const attendanceEntered = studentsInClass.length > 0 ? Math.floor(studentsInClass.length * 0.8) : 0;

      return {
        teacherId,
        isClassTeacher: true,
        isSubjectTeacher: false,
        assignedClass: assignedClass?.name || null,
        totalStudents: studentsInClass.length,
        evaluationsDone,
        evaluationsTotal: studentsInClass.length,
        attendanceEntered,
        attendanceTotal: studentsInClass.length,
        performanceScore: studentsInClass.length > 0 
          ? Math.round(((evaluationsDone + attendanceEntered) / (studentsInClass.length * 2)) * 100)
          : 0,
      };
    }

    if (isSubjectTeacher) {
      // Mock: Get assigned subjects (in real app, query subject_assignments)
      const assignedSubjects = [
        { subjectId: '1', subjectName: 'Mathematics', classId: '1', className: 'Primary 1A' },
        { subjectId: '2', subjectName: 'English Language', classId: '1', className: 'Primary 1A' },
      ];

      // Mock: Check how many subjects have been graded
      // In real app, check if Grade records exist for current term/year
      const subjectsGraded = Math.floor(assignedSubjects.length * 0.6); // Mock: 60% graded

      return {
        teacherId,
        isClassTeacher: false,
        isSubjectTeacher: true,
        assignedSubjects: assignedSubjects.length,
        subjectsGraded,
        subjectsTotal: assignedSubjects.length,
        performanceScore: assignedSubjects.length > 0
          ? Math.round((subjectsGraded / assignedSubjects.length) * 100)
          : 0,
      };
    }

    // Teacher with both roles
    if (isClassTeacher && isSubjectTeacher) {
      const assignedClass = mockClasses.find((c) => c.classTeacherId === teacherId);
      const studentsInClass = assignedClass 
        ? mockStudents.filter((s) => s.classId === assignedClass.id)
        : [];
      
      const assignedSubjects = [
        { subjectId: '1', subjectName: 'Mathematics', classId: '1', className: 'Primary 1A' },
        { subjectId: '2', subjectName: 'English Language', classId: '1', className: 'Primary 1A' },
      ];

      const evaluationsDone = studentsInClass.length > 0 ? Math.floor(studentsInClass.length * 0.7) : 0;
      const attendanceEntered = studentsInClass.length > 0 ? Math.floor(studentsInClass.length * 0.8) : 0;
      const subjectsGraded = Math.floor(assignedSubjects.length * 0.6);

      const classTasksScore = studentsInClass.length > 0
        ? ((evaluationsDone + attendanceEntered) / (studentsInClass.length * 2)) * 50
        : 0;
      const subjectTasksScore = assignedSubjects.length > 0
        ? (subjectsGraded / assignedSubjects.length) * 50
        : 0;

      return {
        teacherId,
        isClassTeacher: true,
        isSubjectTeacher: true,
        assignedClass: assignedClass?.name || null,
        totalStudents: studentsInClass.length,
        evaluationsDone,
        evaluationsTotal: studentsInClass.length,
        attendanceEntered,
        attendanceTotal: studentsInClass.length,
        assignedSubjects: assignedSubjects.length,
        subjectsGraded,
        subjectsTotal: assignedSubjects.length,
        performanceScore: Math.round(classTasksScore + subjectTasksScore),
      };
    }

    return null;
  }

  // Get classes assigned to a teacher (as class teacher)
  async getTeacherClasses(teacherId: string): Promise<Class[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockClasses.filter((c) => c.classTeacherId === teacherId);
  }

  // Get subject assignments for a teacher
  async getTeacherSubjectAssignments(teacherId: string): Promise<Array<{ subjectId: string; classId: string; subjectName: string; className: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    // Mock subject assignments - in real app, this would query subject_assignments table
    // For now, return mock assignments based on teacher role
    // Find teacher in mock users - in real app, this would query the database
    // Access private mockUsers through a workaround (in production, use proper API)
    const mockUsers = (mockAuthService as any).mockUsers || [];
    const teacher = mockUsers.find((u: any) => u.id === teacherId);
    if (!teacher) return [];

    const assignments: Array<{ subjectId: string; classId: string; subjectName: string; className: string }> = [];

    if (teacher.role === 'subject_teacher' || teacher.role === 'class_teacher') {
      // Mock: Assign Mathematics and English Language to Basic 1A and Basic 2A
      if (teacher.id === '2' || teacher.id === '3') {
        assignments.push(
          { subjectId: '1', classId: '1', subjectName: 'Mathematics', className: 'Basic 1A' },
          { subjectId: '2', classId: '1', subjectName: 'English Language', className: 'Basic 1A' },
          { subjectId: '1', classId: '2', subjectName: 'Mathematics', className: 'Basic 2A' },
          { subjectId: '2', classId: '2', subjectName: 'English Language', className: 'Basic 2A' },
        );
      }
    }

    return assignments;
  }

  // Get students that a teacher can grade (based on subject assignments)
  async getTeacherGradableStudents(teacherId: string): Promise<Student[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const assignments = await this.getTeacherSubjectAssignments(teacherId);
    const classIds = [...new Set(assignments.map((a) => a.classId))];
    
    if (classIds.length === 0) return [];
    
    return mockStudents.filter((s) => classIds.includes(s.classId));
  }

  // Get subjects that a teacher can grade
  async getTeacherGradableSubjects(teacherId: string): Promise<Subject[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const assignments = await this.getTeacherSubjectAssignments(teacherId);
    const subjectIds = [...new Set(assignments.map((a) => a.subjectId))];
    
    if (subjectIds.length === 0) return [];
    
    return mockSubjects.filter((s) => subjectIds.includes(s.id));
  }
}

export const mockDataService = new MockDataService();

