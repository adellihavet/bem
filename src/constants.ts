/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Subject {
  id: string;
  name: string;
  coefficient: number;
  category: 'STEM' | 'LANG' | 'SOC' | 'OTHER';
}

export interface Score {
  subjectId: string;
  value: number;
  subScores?: Record<string, number>; // e.g., { 'Exercise 1': 3.5 }
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  groupId: string;
  scores: Score[];
}

export interface Group {
  id: string;
  name: string;
  teachers?: Record<string, string>; // subjectId -> teacherName
}

export const SUBJECTS: Subject[] = [
  { id: 'ar', name: 'اللغة العربية', coefficient: 5, category: 'LANG' },
  { id: 'fr', name: 'اللغة الفرنسية', coefficient: 3, category: 'LANG' },
  { id: 'en', name: 'اللغة الانجليزية', coefficient: 2, category: 'LANG' },
  { id: 'math', name: 'الرياضيات', coefficient: 4, category: 'STEM' },
  { id: 'sci', name: 'العلوم الطبيعية', coefficient: 2, category: 'STEM' },
  { id: 'phys', name: 'العلوم الفيزيائية', coefficient: 2, category: 'STEM' },
  { id: 'isl', name: 'التربية الإسلامية', coefficient: 2, category: 'SOC' },
  { id: 'his_geo', name: 'التاريخ و الجغرافيا', coefficient: 3, category: 'SOC' },
  { id: 'civ', name: 'التربية المدنية', coefficient: 1, category: 'SOC' },
  { id: 'art', name: 'التربية الفنية', coefficient: 1, category: 'OTHER' },
  { id: 'mus', name: 'التربية الموسيقية', coefficient: 1, category: 'OTHER' },
  { id: 'sport', name: 'التربية البدنية', coefficient: 1, category: 'OTHER' },
  { id: 'amazigh', name: 'اللغة الأمازيغية', coefficient: 2, category: 'LANG' },
];
