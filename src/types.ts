import { ReactNode } from 'react';

export type View = 'OVERVIEW' | 'GROUPS' | 'SUBJECTS' | 'AI_REPORT' | 'REPORTS' | 'ADVANCED' | 'PREDICTIONS' | 'CORRELATION' | 'SETTINGS';

export interface Subject {
  id: string;
  name: string;
  coefficient: number;
}

export interface TeacherScores {
  [subjectId: string]: number;
}

export interface SubScores {
  [taskName: string]: number;
}

export interface StudentScore {
  subjectId: string;
  value: number;
  subScores?: SubScores;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  groupId: string;
  scores: StudentScore[];
}

export interface Group {
  id: string;
  name: string;
  teachers?: Record<string, string>;
}

export interface Prediction {
  studentId: string;
  name: string;
  groupName: string;
  predictedAverage: number;
  status: 'SUCCESS' | 'RISK' | 'CRITICAL';
  riskFactors: string[];
}

export interface PrintData {
  title: string;
  subtitle: string;
  type: 'STUDENT' | 'GROUP' | 'TEACHER' | 'INSTITUTIONAL';
  headers: string[];
  rows: any[];
  stats?: { label: string; value: string }[];
  analysis?: string[];
  charts?: {
    label: string;
    data: { name: string; value: number }[];
    type: 'BAR' | 'PIE';
  }[];
}

export interface AnalyticsStats {
  totalStudents: number;
  overallAverage: number;
  successRate: number;
  subjectStats: {
    id: string;
    name: string;
    coefficient: number;
    average: number;
    successRate: number;
    homogeneity: number;
    distribution: { name: string; count: number }[];
  }[];
  groupStats: {
    id: string;
    name: string;
    count: number;
    average: number;
    successRate: number;
    stability: number;
    teachers?: Record<string, string>;
    subjectAverages: { subject: string; id: string; average: number }[];
  }[];
  teacherStats: {
    name: string;
    count: number;
    average: number;
    successRate: number;
    stability: number;
  }[];
  predictions: Prediction[];
  subjectPredictions: { id: string; name: string; predictedSuccessRate: number }[];
  correlations: {
    mathPhys: any[];
    arHis: any[];
    frEn: any[];
  };
  segments: { name: string; value: number }[];
}

export interface AppConfig {
  institutionName: string;
  academicYear: string;
  gradeLevel: '1AM' | '2AM' | '3AM' | '4AM';
  analysisScope: 'S1' | 'S2' | 'S3' | 'BEM';
  subjectCoefficients: Record<string, number>;
}

export const SUBJECTS: Subject[] = [
  { id: 'ar', name: 'اللغة العربية', coefficient: 5 },
  { id: 'math', name: 'الرياضيات', coefficient: 4 },
  { id: 'fr', name: 'اللغة الفرنسية', coefficient: 3 },
  { id: 'en', name: 'اللغة الإنجليزية', coefficient: 2 },
  { id: 'phys', name: 'العلوم الفيزيائية', coefficient: 2 },
  { id: 'science', name: 'علوم الطبيعة والحياة', coefficient: 2 },
  { id: 'his_geo', name: 'التاريخ والجغرافيا', coefficient: 3 },
  { id: 'islamic', name: 'التربية الإسلامية', coefficient: 2 },
  { id: 'civic', name: 'التربية المدنية', coefficient: 1 },
];
