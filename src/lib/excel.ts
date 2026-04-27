import * as XLSX from 'xlsx';
import { SUBJECTS, type Student, type Subject, type Group } from '../types';

export const exportSubjectTemplate = (subjectId: string, subjectName: string, groupName: string) => {
  const subject = SUBJECTS.find(s => s.id === subjectId) || { id: subjectId, name: subjectName };
  const commonHeaders = ['اللقب', 'الاسم', 'تاريخ الميلاد'];
  let specificHeaders: string[] = [];

  if (subject.id === 'math') {
    specificHeaders = [
      'علامة التمرين 01',
      'علامة التمرين 02',
      'علامة التمرين 03',
      'علامة التمرين 04',
      'علامة التمرين05',
      'علامة الوضعية الادماجية'
    ];
  } else if (subject.id === 'ar') {
    specificHeaders = [
      'علامة الوضعية 01',
      'علامة الوضعية 02',
      'علامة الوضعية الادماجية'
    ];
  }

  const headers = [...commonHeaders, ...specificHeaders, 'علامة الامتحان'];
  
  // Create sample row
  const data = [headers];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'قائمة التلاميذ');

  XLSX.writeFile(wb, `${subject.name}_${groupName}_قالب.xlsx`);
};

export const exportGroupReport = (group: Group, students: Student[]) => {
  const headers = ['اللقب', 'الاسم', 'تاريخ الميلاد', ...SUBJECTS.map(s => s.name), 'المعدل'];
  const data: any[][] = [headers];

  students.filter(s => s.groupId === group.id).forEach(student => {
    let totalPoints = 0;
    let totalCoeff = 0;
    const scores = SUBJECTS.map(sub => {
      const score = student.scores.find(sc => sc.subjectId === sub.id)?.value || 0;
      totalPoints += score * sub.coefficient;
      totalCoeff += sub.coefficient;
      return score;
    });
    const avg = totalCoeff > 0 ? (totalPoints / totalCoeff).toFixed(2) : '0.00';
    data.push([student.lastName, student.firstName, student.birthDate || '', ...scores, avg]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير الفوج');
  XLSX.writeFile(wb, `تقرير_الفوج_${group.name}.xlsx`);
};

export const exportTeacherReport = (subjectId: string, teacherName: string, groups: Group[], students: Student[]) => {
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const headers = ['الفوج', 'اللقب', 'الاسم', 'العلامة'];
  const data: any[][] = [[`المادة: ${subject?.name}`, `الأستاذ: ${teacherName}`], headers];

  groups.forEach(group => {
    if (group.teachers?.[subjectId] === teacherName) {
      students.filter(s => s.groupId === group.id).forEach(student => {
        const score = student.scores.find(sc => sc.subjectId === subjectId)?.value || 0;
        data.push([group.name, student.lastName, student.firstName, score]);
      });
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير الأستاذ');
  XLSX.writeFile(wb, `تقرير_الأستاذ_${teacherName}_${subject?.name}.xlsx`);
};

export const exportFullTeacherReport = (teacherName: string, groups: Group[], students: Student[]) => {
  const headers = ['المادة', 'الفوج', 'اللقب', 'الاسم', 'العلامة'];
  const data: any[][] = [[`تقرير شامل للأستاذ: ${teacherName}`], headers];

  groups.forEach(group => {
    if (group.teachers) {
      Object.entries(group.teachers).forEach(([subjectId, name]) => {
        if (name === teacherName) {
          const subject = SUBJECTS.find(s => s.id === subjectId);
          students.filter(s => s.groupId === group.id).forEach(student => {
            const score = student.scores.find(sc => sc.subjectId === subjectId)?.value || 0;
            data.push([subject?.name || subjectId, group.name, student.lastName, student.firstName, score]);
          });
        }
      });
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير الأستاذ الشامل');
  XLSX.writeFile(wb, `تقرير_شامل_للأستاذ_${teacherName}.xlsx`);
};

export const parseSubjectExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return reject('No data found');
      
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (json.length < 2) {
        return reject('الملف فارغ أو غير صحيح');
      }

      const headers = json[0];
      const rows = json.slice(1);
      
      const examScoreIndex = headers.indexOf('علامة الامتحان');
      const firstNameIndex = headers.indexOf('الاسم');
      const lastNameIndex = headers.indexOf('اللقب');
      const birthDateIndex = headers.indexOf('تاريخ الميلاد');

      if (examScoreIndex === -1) {
        return reject('لا يمكن العثور على عمود "علامة الامتحان"');
      }

      // Find indices for sub-scores
      const subScoreHeaders = [
        'علامة التمرين 01', 'علامة التمرين 02', 'علامة التمرين 03', 
        'علامة التمرين 04', 'علامة التمرين05', 'علامة الوضعية الادماجية',
        'علامة الوضعية 01', 'علامة الوضعية 02'
      ];
      
      const subScoreIndices = subScoreHeaders.map(h => ({ header: h, index: headers.indexOf(h) }))
        .filter(item => item.index !== -1);

      const validRows = rows.filter(row => {
        const score = row[examScoreIndex];
        return score !== undefined && score !== null && score !== '';
      }).map(row => {
        const subScores: Record<string, number> = {};
        subScoreIndices.forEach(item => {
          const val = parseFloat(row[item.index]);
          if (!isNaN(val)) {
            subScores[item.header] = val;
          }
        });

        return {
          firstName: row[firstNameIndex] || '',
          lastName: row[lastNameIndex] || '',
          birthDate: row[birthDateIndex] || '',
          examScore: parseFloat(row[examScoreIndex]),
          subScores
        };
      });

      if (validRows.length === 0) {
        return reject('لا توجد علامات صالحة في ملف الامتحان');
      }

      resolve(validRows);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
