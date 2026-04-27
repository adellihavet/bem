import { useMemo } from 'react';
import { Student, Group, Subject, AnalyticsStats, Prediction, SUBJECTS, AppConfig } from '../types';

export function useAnalytics(students: Student[], groups: Group[], config?: AppConfig) {
  const stats = useMemo<AnalyticsStats>(() => {
    // Helper to get coefficient
    const getCoeff = (subjectId: string) => {
      if (config?.subjectCoefficients && config.subjectCoefficients[subjectId] !== undefined) {
        return config.subjectCoefficients[subjectId];
      }
      return SUBJECTS.find(s => s.id === subjectId)?.coefficient || 1;
    };

    if (students.length === 0) {
      return {
        totalStudents: 0,
        overallAverage: 0,
        successRate: 0,
        subjectStats: [],
        groupStats: [],
        teacherStats: [],
        predictions: [],
        subjectPredictions: [],
        correlations: { mathPhys: [], arHis: [], frEn: [] },
        segments: []
      };
    }

    const totalStudents = students.length;
    
    const studentAverages = students.map(s => {
      let totalPoints = 0;
      let totalCoeff = 0;
      s.scores.forEach(sc => {
        const coeff = getCoeff(sc.subjectId);
        totalPoints += sc.value * coeff;
        totalCoeff += coeff;
      });
      return totalCoeff > 0 ? totalPoints / totalCoeff : 0;
    });

    const overallAverage = studentAverages.reduce((a, b) => a + b, 0) / totalStudents;
    const successRate = (studentAverages.filter(a => a >= 10).length / totalStudents) * 100;

    const segments = [
      { name: 'ممتاز (>=16)', value: studentAverages.filter(a => a >= 16).length },
      { name: 'جيد جدًا (14-15.99)', value: studentAverages.filter(a => a >= 14 && a < 16).length },
      { name: 'جيد (12-13.99)', value: studentAverages.filter(a => a >= 12 && a < 14).length },
      { name: 'قريب من المتوسط (10-11.99)', value: studentAverages.filter(a => a >= 10 && a < 12).length },
      { name: 'دون المتوسط (<10)', value: studentAverages.filter(a => a < 10).length },
    ];

    const subjectStats = SUBJECTS.map(sub => {
      const subScores = students.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
      const subAverage = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
      const subSuccessRate = subScores.length > 0 ? (subScores.filter(v => v >= 10).length / subScores.length) * 100 : 0;
      
      const mean = subAverage;
      const stdDev = subScores.length > 0 ? Math.sqrt(subScores.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / subScores.length) : 0;

      return {
        ...sub,
        coefficient: getCoeff(sub.id),
        average: subAverage,
        successRate: subSuccessRate,
        homogeneity: (1 - (stdDev / 10)) * 100,
        distribution: [
          { name: '0-5', count: subScores.filter(v => v < 5).length },
          { name: '5-10', count: subScores.filter(v => v >= 5 && v < 10).length },
          { name: '10-15', count: subScores.filter(v => v >= 10 && v < 15).length },
          { name: '15-20', count: subScores.filter(v => v >= 15).length },
        ]
      };
    });

    const groupStats = groups.map(g => {
      const gStudents = students.filter(s => s.groupId === g.id);
      const gAverages = gStudents.map(s => {
        let totalPoints = 0;
        let totalCoeff = 0;
        s.scores.forEach(sc => {
          const coeff = getCoeff(sc.subjectId);
          totalPoints += sc.value * coeff;
          totalCoeff += coeff;
        });
        return totalCoeff > 0 ? totalPoints / totalCoeff : 0;
      });

      const gMean = gAverages.length > 0 ? gAverages.reduce((a, b) => a + b, 0) / gAverages.length : 0;
      const gStdDev = gAverages.length > 0 ? Math.sqrt(gAverages.map(x => Math.pow(x - gMean, 2)).reduce((a, b) => a + b, 0) / gAverages.length) : 0;

      const subjectAverages = SUBJECTS.map(sub => {
        const scores = gStudents.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
        return {
          subject: sub.name,
          id: sub.id,
          average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        };
      });

      return {
        ...g,
        count: gStudents.length,
        average: gMean,
        successRate: gAverages.length > 0 ? (gAverages.filter(a => a >= 10).length / gAverages.length) * 100 : 0,
        stability: (1 - (gStdDev / 5)) * 100, // Normalized stability
        subjectAverages
      };
    });

    const teachers = Array.from(new Set(groups.flatMap(g => Object.values(g.teachers || {}))));
    const teacherStats = teachers.map(teacher => {
      const teacherStudents = students.filter(s => {
        const group = groups.find(gp => gp.id === s.groupId);
        return Object.values(group?.teachers || {}).includes(teacher);
      });

      const tAverages = teacherStudents.map(s => {
        let totalPoints = 0;
        let totalCoeff = 0;
        s.scores.forEach(sc => {
          const coeff = getCoeff(sc.subjectId);
          totalPoints += sc.value * coeff;
          totalCoeff += coeff;
        });
        return totalCoeff > 0 ? totalPoints / totalCoeff : 0;
      });

      const tMean = tAverages.length > 0 ? tAverages.reduce((a, b) => a + b, 0) / tAverages.length : 0;
      const tStdDev = tAverages.length > 0 ? Math.sqrt(tAverages.map(x => Math.pow(x - tMean, 2)).reduce((a, b) => a + b, 0) / tAverages.length) : 0;

      return {
        name: teacher,
        count: teacherStudents.length,
        average: tMean,
        successRate: tAverages.length > 0 ? (tAverages.filter(a => a >= 10).length / tAverages.length) * 100 : 0,
        stability: (1 - (tStdDev / 5)) * 100
      };
    });

    const predictions: Prediction[] = students.map(s => {
      let totalPoints = 0;
      let totalCoeff = 0;
      const riskFactors: string[] = [];
      const gp = groups.find(g => g.id === s.groupId);

      s.scores.forEach(sc => {
        const coeff = getCoeff(sc.subjectId);
        const subName = SUBJECTS.find(sub => sub.id === sc.subjectId)?.name || sc.subjectId;
        totalPoints += sc.value * coeff;
        totalCoeff += coeff;
        if (sc.value < 10 && coeff >= 3) {
          riskFactors.push(`ضعف في ${subName} (معامل ${coeff})`);
        }
      });

      const avg = totalCoeff > 0 ? totalPoints / totalCoeff : 0;
      let status: Prediction['status'] = 'SUCCESS';
      if (avg < 9) status = 'CRITICAL';
      else if (avg < 10 || riskFactors.length >= 2) status = 'RISK';

      return {
        studentId: s.id,
        name: `${s.lastName} ${s.firstName}`,
        groupName: gp?.name || 'غير معروف',
        predictedAverage: avg,
        status,
        riskFactors
      };
    });

    const subjectPredictions = SUBJECTS.map(sub => {
      const allScores = students.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
      const successRate = allScores.length > 0 ? (allScores.filter(v => v >= 10).length / allScores.length) * 100 : 0;
      return { id: sub.id, name: sub.name, predictedSuccessRate: successRate };
    });

    const correlate = (subId1: string, subId2: string) => {
      return groups.map(g => {
        const gStudents = students.filter(s => s.groupId === g.id);
        const avg1 = gStudents.length > 0 ? gStudents.reduce((acc, s) => acc + (s.scores.find(sc => sc.subjectId === subId1)?.value || 0), 0) / gStudents.length : 0;
        const avg2 = gStudents.length > 0 ? gStudents.reduce((acc, s) => acc + (s.scores.find(sc => sc.subjectId === subId2)?.value || 0), 0) / gStudents.length : 0;
        return { groupName: g.name, sub1: avg1, sub2: avg2 };
      });
    };

    return {
      totalStudents,
      overallAverage,
      successRate,
      subjectStats,
      groupStats,
      teacherStats,
      predictions,
      subjectPredictions,
      correlations: {
        mathPhys: correlate('math', 'phys'),
        arHis: correlate('ar', 'his_geo'),
        frEn: correlate('fr', 'en')
      },
      segments
    };
  }, [students, groups, config]);

  return stats;
}
