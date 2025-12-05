# Mock Data to Supabase Integration Plan

## Overview
This document lists all pages currently using mock data and organizes them into phases for systematic Supabase integration.

## Pages Using Mock Data

### Phase 1: Admin Dashboard ⚠️ HIGH PRIORITY
**File:** `app/admin/dashboard/page.tsx`
- **Current Usage:**
  - `mockDataService.getStatistics()` - Total students, teachers, classes, pending tasks
  - `mockDataService.getAssessmentTrends()` - Assessment trends chart data
  - `mockDataService.getClassDistribution()` - Class distribution chart data
  - `mockDataService.getGenderDistribution()` - Gender distribution pie chart data
- **Integration Required:**
  - Fetch real statistics from Supabase (counts from students, teachers, classes tables)
  - Calculate assessment trends from grades table (group by month)
  - Calculate class distribution from students grouped by class
  - Calculate gender distribution from students table

---

### Phase 2: Student Reports Pages
**Files:**
1. `app/admin/reports/students/page.tsx`
2. `app/admin/students/reports/page.tsx`
3. `app/admin/students/[id]/reports/page.tsx`

**Current Usage:**
- `mockDataService.getStudents()` - All students list
- `mockDataService.getClasses()` - All classes list
- `mockDataService.getStudent(studentId)` - Individual student data

**Integration Required:**
- Replace with `/api/students` and `/api/classes` API calls
- Add real-time filtering and report generation

---

### Phase 3: Attendance Reports Pages
**Files:**
1. `app/admin/reports/attendance/page.tsx`
2. `app/admin/students/[id]/attendance/page.tsx`

**Current Usage:**
- `mockDataService.getClasses()` - Classes list
- `mockDataService.getStudents()` - Students list
- `mockDataService.getStudent(studentId)` - Individual student
- Mock attendance statistics (hardcoded calculations)

**Integration Required:**
- Replace with `/api/classes` and `/api/students` API calls
- Fetch real attendance data from `/api/attendance` endpoint
- Calculate real attendance statistics from attendance records
- Display real attendance history for individual students

---

### Phase 4: Academic Reports
**File:** `app/admin/reports/academic/page.tsx`

**Current Usage:**
- `mockDataService.getSubjects()` - Subjects list
- `mockDataService.getClasses()` - Classes list
- Mock grade distribution (hardcoded percentages)

**Integration Required:**
- Replace with `/api/subjects` and `/api/classes` API calls
- Calculate real grade distribution from grades table
- Calculate subject performance metrics from grades
- Add real average scores per subject

---

### Phase 5: Class Reports
**File:** `app/admin/reports/classes/page.tsx`

**Current Usage:**
- `mockDataService.getClasses()` - Classes list
- `mockDataService.getStudents()` - Students list
- Mock calculations for class statistics

**Integration Required:**
- Replace with `/api/classes` and `/api/students` API calls
- Calculate real class statistics (student counts, capacity usage)
- Add real class teacher information
- Calculate real performance metrics per class

---

### Phase 6: Promotion Pages
**Files:**
1. `app/admin/classes/promotions/page.tsx`
2. `app/admin/classes/[id]/promote/page.tsx`

**Current Usage:**
- `mockDataService.getClasses()` - All classes
- `mockDataService.getStudents(classId)` - Students in class
- `mockDataService.getClass(classId)` - Class information
- Mock promotion eligibility checks

**Integration Required:**
- Replace with `/api/classes` and `/api/students` API calls
- Implement real promotion logic (update student classId)
- Check real graduation status for higher levels
- Create API endpoint for bulk student promotion

---

### Phase 7: Class Assignments
**File:** `app/admin/classes/assignments/page.tsx`

**Current Usage:**
- `mockDataService.getClasses()` - Classes list
- `mockDataService.getTeachers()` - Teachers list

**Integration Required:**
- Replace with `/api/classes` and `/api/teachers` API calls
- Display real class teacher assignments
- Note: This page is mostly read-only, just needs data fetching

---

### Phase 8: Add New Teacher (Cleanup)
**File:** `app/admin/teachers/new/page.tsx`

**Current Usage:**
- `mockDataService` import (unused - already integrated with Supabase API)

**Integration Required:**
- Remove unused `mockDataService` import
- Already fully integrated with `/api/teachers/create`

---

## Implementation Order

### Phase 1: Admin Dashboard (Priority 1)
**Why First:** Dashboard is the main entry point and shows overall system health.

**Tasks:**
1. Create statistics calculation service
2. Fetch real counts from Supabase
3. Calculate assessment trends from grades
4. Calculate class and gender distributions
5. Update charts with real data

---

### Phase 2-5: Reports Pages (Priority 2)
**Why Second:** Reports are important but less critical than dashboard.

**Order:**
1. Student Reports (most used)
2. Attendance Reports (important for tracking)
3. Academic Reports (performance analysis)
4. Class Reports (overview)

---

### Phase 6: Promotion Pages (Priority 3)
**Why Third:** Used periodically, but critical when needed.

**Tasks:**
1. Implement promotion API endpoint
2. Update student classId in bulk
3. Check graduation status logic
4. Handle edge cases (multiple classes to one)

---

### Phase 7-8: Cleanup (Priority 4)
**Why Last:** Minor fixes and cleanup.

**Tasks:**
1. Integrate class assignments page
2. Remove unused imports

---

## Notes

- All pages should use `credentials: 'include'` in fetch calls
- Handle empty arrays gracefully (no errors for empty results)
- Use proper error formatting with `formatError` utility
- Ensure all data fetching is authenticated
- Add loading states for better UX
- Test with real Supabase data after each phase

