'use client';

import { getLevelName } from '@/lib/utils/class-levels';
import { Class, Student } from '@/types';
import React from 'react';
import { useAlert } from '@/components/shared/AlertProvider';

interface GradeData {
  subject: string;
  classScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  position: number;
  remark?: string;
}

interface StudentGradeData {
  student: Student;
  subjectGrades: Array<{
    subjectId: string;
    subjectName: string;
    classScore: number;
    examScore: number;
    total: number;
    grade: string;
    position: number;
  }>;
  attendance?: { presentDays: number; totalDays: number };
  evaluation?: { conduct?: string; interest?: string; remarks?: string };
  classPosition?: number; // Overall position in class ranking
  rollNumber?: number; // Position in class enrollment
  overallTotal?: number; // Sum of all subject totals
}

interface ClassReportCardProps {
  classInfo: Class;
  year: string;
  term: string;
  studentGradesData: StudentGradeData[];
}

const getGradeColor = (grade: string): number => {
  switch (grade) {
    case 'HP':
      return 1; // green
    case 'P':
      return 2; // lightgreen
    case 'AP':
      return 3; // yellow
    case 'D':
      return 4; // orange
    case 'E':
      return 5; // red
    default:
      return 0; // grey
  }
};

const getGradeInterpretation = (grade: string): string => {
  switch (grade) {
    case 'HP':
      return 'High Proficient';
    case 'P':
      return 'Proficient';
    case 'AP':
      return 'Approaching Proficiency';
    case 'D':
      return 'Developing';
    case 'E':
      return 'Emerging';
    default:
      return '';
  }
};

const generateReportCardHTML = (
  student: Student,
  classInfo: Class,
  year: string,
  term: string,
  filteredGrades: GradeData[],
  attendance?: { presentDays: number; totalDays: number },
  conduct?: string,
  interest?: string,
  classTeacherRemarks?: string,
  classPosition?: number,
  rollNumber?: number,
  totalStudents?: number
): string => {
  const classLevel = getLevelName(classInfo.level);
  const studentName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
  const logoPath = window.location.origin + '/logo.png';
  
  // Get attendance data
  const presentDays = attendance?.presentDays || 0;
  const totalDays = attendance?.totalDays || 0;
  const attendanceDisplay = totalDays > 0 ? `${presentDays} out of ${totalDays}` : '.................';

  // Determine template based on class level
  if (classLevel === 'KG 1' || classLevel === 'KG 2') {
    return `
      <div class="report-card" style="page-break-after: always; margin-bottom: 20px;">
        <h4 class="title">HOHOE E.P BASIC 'A' SCHOOL</h4>
        <p class="title">P.O.BOX 2, HOHOE MUNICIPAL</p>
        <h5 class="title">TERMINAL REPORT</h5>
        <h5 class="title">KINDERGARTEN</h5>
        <img src="${logoPath}" alt="logo" />
        <div class="student-info">
          <div class="student-box">
            <p><strong>NAME:</strong> ${studentName}</p>
            <p><strong>CLASS/STAGE:</strong> ${classLevel}</p>
          </div>
          <div class="student-box">
            <p><strong>TERM:</strong> ${term}</p>
            <p><strong>ACADEMIC YEAR:</strong> ${year}</p>
            <p><strong>NO. ON ROLL:</strong> ${rollNumber ? `${rollNumber} of ${totalStudents || ''}` : '...................'}</p>
          </div>
          <div class="student-box">
            <p><strong>POSITION:</strong> ${classPosition ? classPosition : '...............'}</p>
            <p><strong>CLOSING DATE:</strong>...............</p>
            <p><strong>NEXT TERM BEGINS:</strong>..............</p>
          </div>
        </div>
        <table class="table-container">
          <thead>
            <tr>
              <th>SUBJECTS</th>
              <th>CLASS SCORE 50%</th>
              <th>EXAMS SCORE 50%</th>
              <th>TOTAL SCORE 100%</th>
              <th>GRADE</th>
              <th>POSITION</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            ${filteredGrades
              .map(
                (grade) => `
              <tr>
                <td>${grade.subject}</td>
                <td>${grade.classScore.toFixed(1)}</td>
                <td>${grade.examScore.toFixed(1)}</td>
                <td>${grade.totalScore.toFixed(1)}</td>
                <td class="grade-${getGradeColor(grade.grade)}">${grade.grade}</td>
                <td>${grade.position}</td>
                <td>${getGradeInterpretation(grade.grade)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="remarks">
          <div class="student-box">
            <p><strong>ATTENDANCE:</strong> ${attendanceDisplay}</p>
            <p><strong>OUT OF:</strong> ${totalDays > 0 ? totalDays : '...............'}</p>
            <p><strong>PROMOTED TO:</strong>...............</p>
          </div>
          <p><strong>CONDUCT:</strong> ${conduct || '..........................'}</p>
          <p><strong>INTEREST:</strong> ${interest || '...............................................'}</p>
          <p><strong>CLASS TEACHER'S REMARKS:</strong> ${classTeacherRemarks || '............'}</p>
        </div>
        <div class="signatures">
          <p><strong>HEADMASTER'S SIGNATURE:</strong>...........................................</p>
        </div>
      </div>
    `;
  } else if (classLevel === 'Basic 1' || classLevel === 'Basic 2' || classLevel === 'Basic 3') {
    return `
      <div class="report-card" style="page-break-after: always; margin-bottom: 20px;">
        <h4 class="title">HOHOE E.P BASIC 'A' SCHOOL</h4>
        <p class="title">P.O.BOX 2, HOHOE MUNICIPAL</p>
        <h5 class="title">TERMINAL REPORT</h5>
        <h5 class="title">LOWER PRIMARY</h5>
        <img src="${logoPath}" alt="logo" />
        <div class="student-info">
          <div class="student-box">
            <p><strong>NAME:</strong> ${studentName}</p>
            <p><strong>CLASS/STAGE:</strong> ${classLevel}</p>
          </div>
          <div class="student-box">
            <p><strong>TERM:</strong> ${term}</p>
            <p><strong>ACADEMIC YEAR:</strong> ${year}</p>
            <p><strong>NO. ON ROLL:</strong> ${rollNumber ? `${rollNumber} of ${totalStudents || ''}` : '...................'}</p>
          </div>
          <div class="student-box">
            <p><strong>POSITION:</strong> ${classPosition ? classPosition : '...............'}</p>
            <p><strong>CLOSING DATE:</strong>...............</p>
            <p><strong>NEXT TERM BEGINS:</strong>..............</p>
          </div>
        </div>
        <table class="table-container">
          <thead>
            <tr>
              <th>SUBJECTS</th>
              <th>CLASS SCORE 50%</th>
              <th>EXAMS SCORE 50%</th>
              <th>TOTAL SCORE 100%</th>
              <th>GRADE</th>
              <th>POSITION</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            ${filteredGrades
              .map(
                (grade) => `
              <tr>
                <td>${grade.subject}</td>
                <td>${grade.classScore.toFixed(1)}</td>
                <td>${grade.examScore.toFixed(1)}</td>
                <td>${grade.totalScore.toFixed(1)}</td>
                <td class="grade-${getGradeColor(grade.grade)}">${grade.grade}</td>
                <td>${grade.position}</td>
                <td>${getGradeInterpretation(grade.grade)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="remarks">
          <div class="student-box">
            <p><strong>ATTENDANCE:</strong> ${attendanceDisplay}</p>
            <p><strong>OUT OF:</strong> ${totalDays > 0 ? totalDays : '...............'}</p>
            <p><strong>PROMOTED TO:</strong>...............</p>
          </div>
          <p><strong>CONDUCT:</strong> ${conduct || '...........'}</p>
          <p><strong>INTEREST:</strong> ${interest || '...............................................'}</p>
          <p><strong>CLASS TEACHER'S REMARKS:</strong> ${classTeacherRemarks || '............'}</p>
        </div>
        <div class="signatures">
          <p><strong>HEADMASTER'S SIGNATURE:</strong>...........................................</p>
        </div>
        
      </div>
    `;
  } else if (classLevel === 'Basic 4' || classLevel === 'Basic 5' || classLevel === 'Basic 6') {
    return `
      <div class="report-card" style="page-break-after: always; margin-bottom: 20px;">
        <h4 class="title">HOHOE E.P BASIC 'A' SCHOOL</h4>
        <p class="title">P.O.BOX 2, HOHOE MUNICIPAL</p>
        <h5 class="title">TERMINAL REPORT</h5>
        <h5 class="title">UPPER PRIMARY</h5>
        <img src="${logoPath}" alt="logo" />
        <div class="student-info">
          <div class="student-box">
            <p><strong>NAME:</strong> ${studentName}</p>
            <p><strong>CLASS/STAGE:</strong> ${classLevel}</p>
          </div>
          <div class="student-box">
            <p><strong>TERM:</strong> ${term}</p>
            <p><strong>ACADEMIC YEAR:</strong> ${year}</p>
            <p><strong>NO. ON ROLL:</strong> ${rollNumber ? `${rollNumber} of ${totalStudents || ''}` : '...................'}</p>
          </div>
          <div class="student-box">
            <p><strong>POSITION:</strong> ${classPosition ? classPosition : '...............'}</p>
            <p><strong>CLOSING DATE:</strong>...............</p>
            <p><strong>NEXT TERM BEGINS:</strong>..............</p>
          </div>
        </div>
        <table class="table-container">
          <thead>
            <tr>
              <th>SUBJECTS</th>
              <th>CLASS SCORE 50%</th>
              <th>EXAMS SCORE 50%</th>
              <th>TOTAL SCORE 100%</th>
              <th>GRADE</th>
              <th>POSITION</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            ${filteredGrades
              .map(
                (grade) => `
              <tr>
                <td>${grade.subject}</td>
                <td>${grade.classScore.toFixed(1)}</td>
                <td>${grade.examScore.toFixed(1)}</td>
                <td>${grade.totalScore.toFixed(1)}</td>
                <td class="grade-${getGradeColor(grade.grade)}">${grade.grade}</td>
                <td>${grade.position}</td>
                <td>${getGradeInterpretation(grade.grade)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="remarks">
          <div class="student-box">
            <p><strong>ATTENDANCE:</strong> ${attendanceDisplay}</p>
            <p><strong>OUT OF:</strong> ${totalDays > 0 ? totalDays : '...............'}</p>
            <p><strong>PROMOTED TO:</strong>...............</p>
          </div>
          <p><strong>CONDUCT:</strong> ${conduct || '...........'}</p>
          <p><strong>INTEREST:</strong> ${interest || '...............................................'}</p>
          <p><strong>CLASS TEACHER'S REMARKS:</strong> ${classTeacherRemarks || '............'}</p>
        </div>
        <div class="signatures">
          <p><strong>HEADMASTER'S SIGNATURE:</strong>...........................................</p>
        </div>
        
      </div>
    `;
  } else if (classLevel === 'Basic 7' || classLevel === 'Basic 8' || classLevel === 'Basic 9') {
    return `
      <div class="report-card" style="page-break-after: always; margin-bottom: 20px;">
        <h5 class="title">HOHOE E.P BASIC 'A' SCHOOL</h5>
        <p class="title">P.O.BOX 2, HOHOE MUNICIPAL</p>
        <h6 class="title">TERMINAL REPORT</h6>
        <h6 class="title">JUNIOR HIGH SCHOOL</h6>
        <img src="${logoPath}" alt="logo" />
        <div class="student-info">
          <div class="student-box">
            <p><strong>NAME:</strong> ${studentName}</p>
            <p><strong>FORM:</strong> ${classLevel}</p>
          </div>
          <div class="student-box">
            <p><strong>TERM:</strong> ${term}</p>
            <p><strong>ACADEMIC YEAR:</strong> ${year}</p>
            <p><strong>NO. ON ROLL:</strong> .....................</p>
          </div>
          <div class="student-box">
            <p><strong>AGGREGATE:</strong>.............</p>
            <p><strong>CLOSING DATE:</strong> ...........................</p>
            <p><strong>NEXT TERM BEGINS:</strong>....................</p>
          </div>
        </div>
        <table class="table-container">
          <thead>
            <tr>
              <th>SUBJECTS</th>
              <th>CLASS SCORE 50%</th>
              <th>EXAMS SCORE 50%</th>
              <th>TOTAL SCORE 100%</th>
              <th>GRADE</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            ${filteredGrades
              .map(
                (grade) => `
              <tr>
                <td>${grade.subject}</td>
                <td>${grade.classScore.toFixed(1)}</td>
                <td>${grade.examScore.toFixed(1)}</td>
                <td>${grade.totalScore.toFixed(1)}</td>
                <td class="grade-${getGradeColor(grade.grade)}">${grade.grade}</td>
                <td>${getGradeInterpretation(grade.grade)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="remarks">
          <div class="student-box">
            <p><strong>ATTENDANCE:</strong> ${attendanceDisplay}</p>
            <p><strong>OUT OF:</strong> ${totalDays > 0 ? totalDays : '...............'}</p>
            <p><strong>PROMOTED TO:</strong>...............</p>
          </div>
          <p><strong>CONDUCT:</strong> ${conduct || '...........'}</p>
          <p><strong>INTEREST:</strong> ${interest || '...............................................'}</p>
          <p><strong>CLASS TEACHER'S REMARKS:</strong> ${classTeacherRemarks || '............'}</p>
        </div>
        <div class="signatures">
          <p><strong>HEADMASTER'S SIGNATURE:</strong>...........................................</p>
        </div>
        
      </div>
    `;
  }
  return '';
};

const ClassReportCard: React.FC<ClassReportCardProps> = ({
  classInfo,
  year,
  term,
  studentGradesData,
}) => {
  const { showWarning } = useAlert();
  
  const handlePrint = () => {
    // Legal page size: 8.5" x 14" (216mm x 356mm)
    const printWindow = window.open('', '', 'height=1000,width=800');

    if (!printWindow) {
      showWarning('Please allow pop-ups to generate the class report cards.');
      return;
    }

    const logoPath = window.location.origin + '/logo.png';
    const classLevel = getLevelName(classInfo.level);

    // Generate all report cards
    const allReportCards = studentGradesData.map((data) => {
      const filteredGrades = data.subjectGrades.map((sg) => ({
        subject: sg.subjectName,
        classScore: sg.classScore,
        examScore: sg.examScore,
        totalScore: sg.total,
        grade: sg.grade,
        position: sg.position,
      }));

      return generateReportCardHTML(
        data.student,
        classInfo,
        year,
        term,
        filteredGrades,
        data.attendance,
        data.evaluation?.conduct,
        data.evaluation?.interest,
        data.evaluation?.remarks,
        data.classPosition,
        data.rollNumber,
        studentGradesData.length
      );
    }).join('');

    const content = `
      <html>
      <head>
        <title>Class Report Cards</title>
        <style>
          @page { size: legal; margin: 0.5in; }
          body { font-family: Arial, sans-serif; margin: 15px; font-size: 12pt; }
          .container { max-width: 100%; margin: 0 auto; }
          .title { text-align: center; margin: 1px auto; font-size: 12pt; }
          .student-info { width: 100%; font-size: 12pt; }
          .student-box { display: inline-flex; justify-content: space-between; width: 100%; margin: 0 auto; }
          .table-container { border-collapse: collapse; width: 100%; font-size: 12pt; }
          .table-container th, .table-container td { border: 1px solid black; padding: 8px; font-size: 12pt; }
          .table-container th { background-color: #f4f4f4; font-size: 12pt; }
          .grade-1 { color: green; }
          .grade-2 { color: lightgreen; }
          .grade-3 { color: yellow; }
          .grade-4 { color: orange; }
          .grade-5 { color: red; }
          table { width: 100%; border-collapse: collapse; font-size: 12pt; }
          .header-row th { border: 1px solid black; padding: 8px; background-color: #f2f2f2; font-weight: bold; font-size: 12pt; }
          .data-row td { border: 1px solid black; padding: 8px; text-align: center; font-size: 12pt; }
          .header-grade { border-top: none; border-bottom: 2px solid black; text-align: center; font-size: 12pt; }
          .header-interp { border-top: none; border-bottom: 2px solid black; text-align: center; font-size: 12pt; }
          img { height: 100px; width: 100px; margin-left: 43%; }
          .report-card { page-break-after: always; margin-bottom: 20px; }
          .report-card:last-child { page-break-after: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          ${allReportCards}
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Print All Report Cards
    </button>
  );
};

export default ClassReportCard;

