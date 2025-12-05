# Architecture & Implementation Plan

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Next.js PWA)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   UI Layer   │  │  State Mgmt  │  │  Data Layer  │  │
│  │ (Shadcn UI)  │  │  (Zustand)   │  │ (Mock/Sync)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │  Service Worker │                    │
│                    │  (Offline Sync) │                    │
│                    └───────┬────────┘                    │
└────────────────────────────┼─────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Supabase      │
                    │  (PostgreSQL)   │
                    └─────────────────┘
```

## Project Structure

```
hohoe-lms/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, etc.)
│   ├── (admin)/                  # Admin routes
│   │   ├── dashboard/
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── subjects/
│   │   └── analytics/
│   ├── (teacher)/                # Teacher routes
│   │   ├── dashboard/
│   │   ├── my-class/             # Class teacher
│   │   ├── grades/
│   │   └── analytics/
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/redirect
│
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── layout/                   # Layout components
│   │   ├── MobileNav.tsx         # Bottom nav (mobile)
│   │   ├── Sidebar.tsx           # Sidebar (desktop)
│   │   └── Header.tsx
│   ├── features/                 # Feature components
│   │   ├── dashboard/
│   │   ├── classes/
│   │   ├── grades/
│   │   └── analytics/
│   └── shared/                   # Shared components
│
├── lib/
│   ├── utils.ts                  # Utility functions
│   ├── mock-data/                # Mock data generators
│   │   ├── students.ts
│   │   ├── teachers.ts
│   │   ├── classes.ts
│   │   └── grades.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── class-store.ts
│   │   ├── grade-store.ts
│   │   └── sync-store.ts
│   ├── services/                 # Data services
│   │   ├── mock-service.ts       # Mock data service
│   │   ├── supabase-service.ts   # Supabase service
│   │   └── sync-service.ts      # Sync service
│   └── hooks/                    # Custom hooks
│       ├── use-offline.ts
│       ├── use-sync.ts
│       └── use-auth.ts
│
├── types/                        # TypeScript types
│   ├── user.ts
│   ├── student.ts
│   ├── class.ts
│   ├── subject.ts
│   └── grade.ts
│
├── public/                       # Static assets
│   ├── icons/                    # PWA icons
│   └── manifest.json
│
└── docs/                         # Documentation
```

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'class_teacher' | 'subject_teacher';
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Teacher extends User {
  role: 'class_teacher' | 'subject_teacher';
  assignedClassId?: string;      // If class teacher
  assignedSubjects?: string[];    // Subject IDs
  isClassTeacher: boolean;
  isSubjectTeacher: boolean;
}
```

### Student Model

```typescript
interface Student {
  id: string;
  studentId: string;              // Unique school ID
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  classId: string;
  classTeacherId: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  enrollmentDate: Date;
  status: 'active' | 'transferred' | 'graduated';
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Class Model

```typescript
interface Class {
  id: string;
  name: string;                   // e.g., "Primary 1A"
  level: number;                  // 1-6 (P1-P6)
  stream?: string;                // A, B, C, etc.
  classTeacherId: string;
  academicYear: string;           // e.g., "2024/2025"
  term: 1 | 2 | 3;
  studentCount: number;
  capacity: number;
  subjects: string[];             // Subject IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### Subject Model

```typescript
interface Subject {
  id: string;
  name: string;                   // e.g., "Mathematics"
  code: string;                   // e.g., "MATH"
  category: 'core' | 'elective';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SubjectAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classId: string;
  academicYear: string;
  term: 1 | 2 | 3;
  createdAt: Date;
}
```

### Grade Model

```typescript
interface Assessment {
  id: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  name: string;                   // e.g., "Mid-term Test"
  type: 'project' | 'test1' | 'test2' | 'group_work' | 'exam' | 'exercise' | 'test' | 'mid_term';
  maxScore: number;
  weight: number;                 // Percentage of total grade
  date: Date;
  term: 1 | 2 | 3;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Grade {
  id: string;
  studentId: string;
  assessmentId: string;
  subjectId: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  remarks?: string;
  teacherId: string;
  date: Date;
  synced: boolean;                // For offline sync
  createdAt: Date;
  updatedAt: Date;
}

interface GradeSummary {
  studentId: string;
  subjectId: string;
  term: 1 | 2 | 3;
  academicYear: string;
  totalScore: number;
  maxTotalScore: number;
  average: number;
  finalGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  assessments: string[];           // Assessment IDs
}
```

### Attendance Model

**Note**: Daily attendance marking is not used. Attendance is entered manually as a summary in `ClassTeacherEvaluation`. This model is kept for potential future use.

```typescript
interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;               // Teacher ID
  remarks?: string;
  synced: boolean;
  createdAt: Date;
}
```

### Class Teacher Evaluation Model

```typescript
interface ClassTeacherReward {
  id: string;
  studentId: string;
  classId: string;
  term: 1 | 2 | 3;
  academicYear: string;
  rewardType: 'merit' | 'achievement' | 'participation' | 'leadership' | 'improvement' | 'other';
  description: string;
  date: Date;
  awardedBy: string;              // Class teacher ID
  synced: boolean;
  createdAt: Date;
}

interface ClassTeacherEvaluation {
  id: string;
  studentId: string;
  classId: string;
  classTeacherId: string;
  term: 1 | 2 | 3;
  academicYear: string;
  
  // Attendance summary for the term
  attendanceSummary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendancePercentage: number;
  };
  
  // Conduct rating
  conduct: 'excellent' | 'very_good' | 'good' | 'satisfactory' | 'needs_improvement';
  conductRemarks?: string;
  
  // Interest level
  interest: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
  interestRemarks?: string;
  
  // Rewards earned in this term
  rewards: string[];               // Reward IDs
  
  // General remarks
  remarks?: string;
  
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Standard Assessment Structure

**Used by both Class Teachers and Subject Teachers** for grading:
- **Project**: 40 marks
- **Test 1**: 20 marks
- **Test 2**: 20 marks
- **Group Work**: 20 marks
- **Exam**: 100 marks
- **Total**: 200 marks

See `types/assessment-structure.ts` for the shared structure definition.

## State Management (Zustand)

### Auth Store

```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}
```

### Class Store

```typescript
interface ClassStore {
  classes: Class[];
  currentClass: Class | null;
  students: Student[];
  isLoading: boolean;
  fetchClasses: () => Promise<void>;
  fetchClass: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  promoteStudents: (studentIds: string[], newClassId: string) => Promise<void>;
}
```

### Class Teacher Evaluation Store

```typescript
interface ClassTeacherEvaluationStore {
  evaluations: ClassTeacherEvaluation[];
  rewards: ClassTeacherReward[];
  isLoading: boolean;
  fetchEvaluations: (classId: string, term: number, academicYear: string) => Promise<void>;
  createEvaluation: (evaluation: Omit<ClassTeacherEvaluation, 'id'>) => Promise<void>;
  updateEvaluation: (id: string, data: Partial<ClassTeacherEvaluation>) => Promise<void>;
  addReward: (reward: Omit<ClassTeacherReward, 'id'>) => Promise<void>;
  markAttendance: (studentId: string, date: Date, status: AttendanceStatus) => Promise<void>;
  getAttendanceSummary: (studentId: string, term: number) => Promise<AttendanceSummary>;
}
```

### Grade Store

```typescript
interface GradeStore {
  grades: Grade[];
  assessments: Assessment[];
  isLoading: boolean;
  fetchGrades: (filters: GradeFilters) => Promise<void>;
  submitGrade: (grade: Omit<Grade, 'id'>) => Promise<void>;
  createAssessment: (assessment: Omit<Assessment, 'id'>) => Promise<void>;
}
```

### Sync Store

```typescript
interface SyncStore {
  isOnline: boolean;
  pendingSync: SyncItem[];
  isSyncing: boolean;
  lastSyncTime: Date | null;
  checkOnlineStatus: () => void;
  queueSync: (item: SyncItem) => void;
  syncAll: () => Promise<void>;
  getSyncStatus: () => SyncStatus;
}
```

## Offline Strategy

### Storage Strategy

1. **IndexedDB** (via Dexie.js or idb)
   - Store all data locally
   - Queue pending operations
   - Track sync status

2. **Service Worker**
   - Cache static assets
   - Intercept API calls
   - Queue failed requests

### Sync Mechanism

```typescript
interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'student' | 'grade' | 'attendance' | ...;
  data: any;
  timestamp: Date;
  retries: number;
}

// Sync Flow:
1. User action → Store in IndexedDB (marked as unsynced)
2. If online → Immediately sync to Supabase
3. If offline → Queue for later sync
4. On reconnect → Process queue in order
5. Handle conflicts (last write wins with timestamp)
```

## API Design

### Mock Service (Phase 1)

```typescript
class MockService {
  // Auth
  login(email: string, password: string): Promise<User>
  logout(): Promise<void>
  
  // Classes
  getClasses(): Promise<Class[]>
  getClass(id: string): Promise<Class>
  getStudents(classId: string): Promise<Student[]>
  addStudent(student: Student): Promise<Student>
  
  // Grades
  getGrades(filters: GradeFilters): Promise<Grade[]>
  submitGrade(grade: Grade): Promise<Grade>
  createAssessment(assessment: Assessment): Promise<Assessment>
  
  // Subjects
  getSubjects(): Promise<Subject[]>
  assignSubject(assignment: SubjectAssignment): Promise<void>
}
```

### Supabase Service (Phase 2)

```typescript
class SupabaseService {
  private client: SupabaseClient;
  
  // Similar interface to MockService
  // But uses Supabase client
  // Includes real-time subscriptions
  // Handles authentication
}
```

## Routing Structure

### Route Groups

```
/(auth)/
  /login
  /forgot-password

/(admin)/
  /dashboard
  /teachers
  /classes
  /subjects
  /analytics
  /settings

/(teacher)/
  /dashboard
  /my-class          # If class teacher
  /grades
  /assessments
  /analytics
  /profile
```

### Route Protection

- Middleware for authentication
- Role-based route access
- Redirect based on user role

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project structure setup
- [ ] Design system implementation
- [ ] Mock data generation
- [ ] Basic routing
- [ ] Authentication flow (mock)
- [ ] Layout components (mobile + desktop)

### Phase 2: Core Features - Mock (Week 3-5)
- [ ] Dashboard (all roles)
- [ ] Class management
- [ ] Student management
- [ ] Subject assignment
- [ ] Grade entry
- [ ] Assessment creation
- [ ] Basic analytics

### Phase 3: Offline & Sync (Week 6-7)
- [ ] IndexedDB setup
- [ ] Service worker
- [ ] Offline detection
- [ ] Sync queue
- [ ] Conflict resolution
- [ ] PWA manifest

### Phase 4: Supabase Integration (Week 8-10)
- [ ] Database schema
- [ ] Supabase client setup
- [ ] Authentication integration
- [ ] Replace mock service
- [ ] Real-time subscriptions
- [ ] File storage

### Phase 5: Polish & Testing (Week 11-12)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] User testing
- [ ] Bug fixes
- [ ] Documentation

## Security Considerations

1. **Authentication**: Supabase Auth (JWT)
2. **Authorization**: Row-level security (RLS) in Supabase
3. **Data Validation**: Zod schemas
4. **Input Sanitization**: Server-side validation
5. **HTTPS**: Required for PWA
6. **CSP**: Content Security Policy headers

## Performance Optimization

1. **Code Splitting**: Route-based
2. **Image Optimization**: Next.js Image component
3. **Lazy Loading**: Components and routes
4. **Caching**: Service worker + IndexedDB
5. **Bundle Size**: Tree shaking, minimal dependencies
6. **Database**: Indexed queries, pagination

## Extensibility & Adding New Features

The architecture is designed to be **modular and extensible**. Here's how to add new features:

### Step-by-Step Guide for New Features

#### 1. Planning
- Define the feature requirements
- Identify affected modules
- Determine data model changes
- Plan UI/UX changes

#### 2. Data Model
```typescript
// Add to types/ folder
// Example: types/attendance.ts
export interface Attendance {
  id: string;
  // ... fields
}
```

#### 3. Service Layer
```typescript
// Add to lib/services/
// Example: lib/services/attendance-service.ts
class AttendanceService {
  // Implement CRUD operations
  // Support both mock and Supabase
}
```

#### 4. State Management
```typescript
// Add to lib/stores/
// Example: lib/stores/attendance-store.ts
interface AttendanceStore {
  attendances: Attendance[];
  // ... actions
}
```

#### 5. Components
```typescript
// Add to components/features/
// Example: components/features/attendance/
//   - AttendanceList.tsx
//   - AttendanceForm.tsx
//   - AttendanceCard.tsx
```

#### 6. Routes
```typescript
// Add to app/(admin)/ or app/(teacher)/
// Example: app/(teacher)/attendance/
//   - page.tsx
//   - [id]/page.tsx
```

#### 7. Navigation
- Add to mobile bottom nav (if primary feature)
- Add to desktop sidebar
- Update route protection if needed

#### 8. Database (if needed)
- Add tables/columns to schema
- Update RLS policies
- Add indexes
- Create migrations

#### 9. Offline Support
- Add to sync queue types
- Implement offline storage
- Add sync logic
- Test offline functionality

### Architecture Patterns for Extensibility

#### Feature Module Pattern
```
components/features/
  attendance/
    ├── AttendanceList.tsx
    ├── AttendanceForm.tsx
    ├── AttendanceCard.tsx
    └── index.ts
```

#### Service Abstraction
```typescript
// Abstract service interface
interface IDataService<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implement for both mock and Supabase
class MockAttendanceService implements IDataService<Attendance> { }
class SupabaseAttendanceService implements IDataService<Attendance> { }
```

#### Store Composition
```typescript
// Combine related stores
const useAppStore = () => ({
  ...useAttendanceStore(),
  ...useGradeStore(),
  // ... other stores
});
```

### Best Practices

1. **Keep Features Isolated**: Each feature should be self-contained
2. **Reuse Components**: Use shared components from `components/shared/`
3. **Follow Naming Conventions**: Consistent naming across features
4. **Type Safety**: Always define TypeScript types
5. **Error Handling**: Implement proper error handling
6. **Loading States**: Add loading states for async operations
7. **Offline First**: Ensure features work offline
8. **Documentation**: Update docs when adding features

### Testing New Features

1. **Unit Tests**: Test service methods and utilities
2. **Component Tests**: Test UI components
3. **Integration Tests**: Test feature workflows
4. **E2E Tests**: Test complete user flows
5. **Offline Tests**: Verify offline functionality
6. **Sync Tests**: Test data synchronization

### Migration Path

When adding features that require database changes:

1. **Create Migration Script**: Document schema changes
2. **Update Types**: Update TypeScript interfaces
3. **Update Services**: Add new service methods
4. **Update UI**: Build feature components
5. **Test Thoroughly**: Test all scenarios
6. **Deploy**: Deploy with migration script

