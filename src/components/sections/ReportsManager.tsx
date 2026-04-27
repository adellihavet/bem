import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Printer, FileText, Download, Users, Target, ClipboardList, BarChart as ChartIcon } from 'lucide-react';
import { Group, Student, SUBJECTS, PrintData, AppConfig } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip
} from 'recharts';

interface Props {
  groups: Group[];
  students: Student[];
  config: AppConfig;
  onPrint: (data: PrintData) => void;
}

export function ReportsManager({ groups, students, config, onPrint }: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [customSubjectId, setCustomSubjectId] = useState<string | null>(null);
  const [customGroupId, setCustomGroupId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(20);

  const getCoeff = (subjectId: string) => {
    return config.subjectCoefficients[subjectId] !== undefined ? config.subjectCoefficients[subjectId] : (SUBJECTS.find(s => s.id === subjectId)?.coefficient || 1);
  };

  const getScoreDistribution = (scores: number[]) => {
    const bins = [
      { name: '0-5', value: 0 },
      { name: '5-10', value: 0 },
      { name: '10-15', value: 0 },
      { name: '15-20', value: 0 },
    ];
    scores.forEach(s => {
      if (s >= 0 && s < 5) bins[0].value++;
      else if (s >= 5 && s < 10) bins[1].value++;
      else if (s >= 10 && s < 15) bins[2].value++;
      else if (s >= 15 && s <= 20) bins[3].value++;
    });
    return bins;
  };

  const calculateAvg = (s: Student) => {
    let totalPoints = 0;
    let totalCoeff = 0;
    s.scores.forEach(sc => {
      const coeff = getCoeff(sc.subjectId);
      totalPoints += sc.value * coeff;
      totalCoeff += coeff;
    });
    return totalCoeff > 0 ? totalPoints / totalCoeff : 0;
  };

  const scopeLabel = config.analysisScope === 'BEM' ? 'شهادة التعليم المتوسط' : `الفصل ${config.analysisScope.charAt(1)}`;
  const subtitlePrefix = `${scopeLabel} - دورة ${config.academicYear}`;

  const getDetailedGroupAnalysis = (gStudents: Student[], avgList: number[], gAvg: number) => {
    const analysis = [`سجل الفوج معدلاً عاماً متوسطاً قدره ${gAvg.toFixed(2)}.`];
    
    const failCount = gStudents.filter(s => calculateAvg(s) < 10).length;
    const criticalCount = gStudents.filter(s => {
      const avg = calculateAvg(s);
      return avg >= 9 && avg < 10;
    }).length;

    if (criticalCount > 0) {
      analysis.push(`تنبيه: يوجد ${criticalCount} تلاميذ في منطقة "العتبة" (معدل بين 9 و 10). التدخل البيداغوجي السريع معهم قد يرفع نسبة النجاح بشكل ملحوظ.`);
    }

    if (failCount > gStudents.length * 0.4) {
      analysis.push('هذا الفوج يعاني من تأخر دراسي جماعي ملموس. يوصى بمراجعة شاملة لبرامج الدعم.');
    } else if (gAvg >= 12) {
      analysis.push('يظهر الفوج استقراراً بيداغوجياً ممتازاً مع وجود فئة معتبرة من التلاميذ المتفوقين.');
    }

    // Identify subject bottleneck
    const subjectRates = SUBJECTS.map(sub => {
      const scores = gStudents.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
      const rate = scores.length > 0 ? (scores.filter(v => v >= 10).length / scores.length) * 100 : 0;
      return { name: sub.name, rate };
    }).sort((a, b) => a.rate - b.rate);

    if (subjectRates[0].rate < 50) {
      analysis.push(`تم تحديد مادة ${subjectRates[0].name} كأكبر عائق لهذا الفوج بنسبة نجاح ${subjectRates[0].rate.toFixed(1)}% فقط.`);
    }

    return analysis;
  };

  const getDetailedTeacherAnalysis = (teacherName: string, subjectName: string, scores: number[], avg: number) => {
    const rate = scores.length > 0 ? (scores.filter(v => v >= 10).length / scores.length) * 100 : 0;
    const analysis = [
      `حقق الأستاذ ${teacherName} في مادة ${subjectName} نسبة تحصيل بلغت ${rate.toFixed(1)}%.`,
      `متوسط العلامة المحصل عليها هو ${avg.toFixed(2)}.`
    ];

    const excellentCount = scores.filter(v => v >= 16).length;
    if (excellentCount > 0) {
      analysis.push(`تم تسجيل ${excellentCount} علامات ممتازة (أعلى من 16)، مما يعكس قدرة الأستاذ على استهداف النخبة.`);
    }

    if (rate < 60) {
      analysis.push('الملاحظة: نسبة النجاح في المادة تعتبر حرجة. يوصى بتشخيص أسباب التعثر الدراسي بالتنسيق مع المستشار التربوي.');
    } else if (rate > 85) {
      analysis.push('الملاحظة: أداء استثنائي يظهر تمكناً عالياً في إيصال المفاهيم وضبط الفوارق الفردية.');
    }

    return analysis;
  };

  const getInstitutionalAnalysis = (students: Student[], globalAvg: number, overallSuccess: number) => {
    const analysis = [
      `حققت المؤسسة نسبة نجاح تقدر بـ ${overallSuccess.toFixed(1)}% بمعدل عام قدره ${globalAvg.toFixed(2)}.`
    ];

    const subjectStats = SUBJECTS.map(sub => {
      const subScores = students.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
      const avg = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
      const rate = subScores.length > 0 ? (subScores.filter(v => v >= 10).length / subScores.length) * 100 : 0;
      return { name: sub.name, avg, rate };
    });

    const topSub = [...subjectStats].sort((a, b) => b.rate - a.rate)[0];
    const bottomSub = [...subjectStats].sort((a, b) => a.rate - b.rate)[0];

    analysis.push(`المادة الأكثر تفوقاً على مستوى المؤسسة هي ${topSub.name} بنسبة نجاح ${topSub.rate.toFixed(1)}%.`);
    analysis.push(`المادة التي تتطلب تدخلاً عاجلاً هي ${bottomSub.name} بنسبة نجاح ${bottomSub.rate.toFixed(1)}%.`);

    if (overallSuccess < 50) {
      analysis.push('الحالة العامة للمؤسسة تستدعي خطة طوارئ بيداغوجية بالتنسيق مع مديرية التربية.');
    }

    return analysis;
  };

  const getSubjectAuditAnalysis = (students: Student[]) => {
    const analysis = ["التحليل البيداغوجي الشامل للمواد الدراسية:"];
    
    const subjectStats = SUBJECTS.map(sub => {
      const subScores = students.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
      const avg = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
      const rate = subScores.length > 0 ? (subScores.filter(v => v >= 10).length / subScores.length) * 100 : 0;
      return { name: sub.name, avg, rate };
    });

    const failingSubjects = subjectStats.filter(s => s.avg < 10);
    const excellentSubjects = subjectStats.filter(s => s.avg >= 12);

    if (failingSubjects.length > 0) {
      analysis.push(`تنبيه بيداغوجي: يوجد تعثر جماعي في مواد (${failingSubjects.map(s => s.name).join('، ')}) حيث سجلت معدلات دون العتبة (10/20).`);
    }

    if (excellentSubjects.length > 0) {
      analysis.push(`نقاط القوة: تظهر النتائج تحكماً جيداً في مواد (${excellentSubjects.map(s => s.name).join('، ')}) مما يعكس فعالية استراتيجيات التدريس فيها.`);
    }

    const scientificSubjects = ['Math', 'Physics', 'Science'];
    const sciAvg = subjectStats.filter(s => scientificSubjects.includes(s.name)).reduce((acc, curr) => acc + curr.avg, 0) / 3;
    const litAvg = subjectStats.filter(s => !scientificSubjects.includes(s.name)).reduce((acc, curr) => acc + curr.avg, 0) / (SUBJECTS.length - 3);

    if (Math.abs(sciAvg - litAvg) > 2) {
      analysis.push(`ملاحظة التوازن: يوجد تباين ملحوظ بين المواد العلمية (${sciAvg.toFixed(1)}) والمواد الأدبية (${litAvg.toFixed(1)}). يوصى بالتنسيق بين المجالس التعليمية.`);
    }

    analysis.push('التوصية: يجب تفعيل حصص المعالجة البيداغوجية فوراً للمواد التي سجلت نسبة نجاح أقل من 40%.');

    return analysis;
  };

  const teachers = Array.from(new Set(groups.flatMap(g => Object.values(g.teachers || {}))));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="border-b border-[#1A1A1A] pb-10">
        <h2 className="text-5xl font-serif font-medium text-white italic tracking-tight">محرك التقارير (Reports Engine)</h2>
        <p className="text-[#888] mt-2 font-sans text-sm tracking-wide">استخراج الوثائق الرسمية والتقارير التحليلية المنهجية</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Group Report */}
        <div className="bg-[#111] border border-[#222] p-8 space-y-6">
          <div className="flex items-center gap-4 text-[#D4AF37] mb-4">
            <Users size={24} />
            <h3 className="text-xl font-serif italic">تقرير الأفواج</h3>
          </div>
          <div className="space-y-4">
            <select value={selectedGroupId || ''} onChange={(e) => setSelectedGroupId(e.target.value)} className="w-full bg-black border border-[#222] p-3 text-xs text-[#888] outline-none">
              <option value="">اختر الفوج...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            
            {selectedGroupId && (
              <div className="p-4 bg-black/40 border border-[#222] space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[#444]">
                  <span>معاينة التوزيع</span>
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                </div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getScoreDistribution(students.filter(s => s.groupId === selectedGroupId).map(s => calculateAvg(s)))}>
                      <Bar dataKey="value" fill="#D4AF37" opacity={0.5} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-[#666] leading-relaxed">توزيع معدلات الفوج المختار. انقر أدناه للحصول على التقرير الكامل مع التحليل البيداغوجي.</p>
              </div>
            )}

            <button onClick={() => {
              const g = groups.find(gp => gp.id === selectedGroupId);
              if (g) {
                const gStudents = students.filter(s => s.groupId === g.id);
                const avgList = gStudents.map(s => calculateAvg(s));
                const gAvg = avgList.length > 0 ? avgList.reduce((a, b) => a + b, 0) / avgList.length : 0;
                const topStudent = gStudents.length > 0 ? gStudents[avgList.indexOf(Math.max(...avgList))] : null;
                
                onPrint({
                  title: `تقرير النتائج التفصيلي: ${g.name}`,
                  subtitle: subtitlePrefix,
                  type: 'GROUP',
                  headers: ['التلميذ', 'المعدل العام', 'النتيجة', 'الملاحظة'],
                  rows: gStudents.map(s => {
                    const avg = calculateAvg(s);
                    return [`${s.lastName} ${s.firstName}`, avg.toFixed(2), avg >= 10 ? 'ناجح' : 'راسب', ''];
                  }),
                  stats: [
                    { label: 'عدد التلاميذ', value: gStudents.length.toString() },
                    { label: 'نسبة النجاح', value: `${gStudents.length > 0 ? ((gStudents.filter(s => calculateAvg(s) >= 10).length / gStudents.length) * 100).toFixed(1) : 0}%` },
                    { label: 'معدل الفوج', value: gAvg.toFixed(2) }
                  ],
                  charts: [
                    { label: 'توزيع المعدلات العامة في الفوج', data: getScoreDistribution(avgList), type: 'BAR' }
                  ],
                  analysis: getDetailedGroupAnalysis(gStudents, avgList, gAvg)
                });
              }
            }} className="w-full py-3 bg-[#D4AF37] text-black font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#B48F27] transition-all disabled:opacity-50" disabled={!selectedGroupId}><Printer size={14} /> طباعة التقرير</button>
          </div>
        </div>

        {/* Teacher Report */}
        <div className="bg-[#111] border border-[#222] p-8 space-y-6">
          <div className="flex items-center gap-4 text-[#D4AF37] mb-4">
            <ClipboardList size={24} />
            <h3 className="text-xl font-serif italic">تقرير أداء الأستاذ</h3>
          </div>
          <div className="space-y-4">
            <select value={selectedTeacher || ''} onChange={(e) => {
              setSelectedTeacher(e.target.value);
              setSelectedSubjectId(null); // Reset subject when teacher changes
            }} className="w-full bg-black border border-[#222] p-3 text-xs text-[#888] outline-none">
              <option value="">اختر الأستاذ...</option>
              {Array.from(new Set(groups.flatMap(g => 
                selectedSubjectId 
                  ? Object.entries(g.teachers || {}).filter(([subId]) => subId === selectedSubjectId).map(([, t]) => t)
                  : Object.values(g.teachers || {})
              ))).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={selectedSubjectId || ''} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-black border border-[#222] p-3 text-xs text-[#888] outline-none">
              <option value="">اختر المادة...</option>
              {SUBJECTS.filter(s => {
                if (!selectedTeacher) return true;
                return groups.some(g => g.teachers?.[s.id] === selectedTeacher);
              }).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {selectedTeacher && selectedSubjectId && (
              <div className="p-4 bg-black/40 border border-[#222] space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[#444]">
                  <span>أداء الأستاذ</span>
                  <ChartIcon size={12} className="text-[#D4AF37]" />
                </div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getScoreDistribution(students.filter(s => {
                      const group = groups.find(g => g.id === s.groupId);
                      return group?.teachers?.[selectedSubjectId] === selectedTeacher;
                    }).map(s => s.scores.find(sc => sc.subjectId === selectedSubjectId)?.value || 0))}>
                      <Bar dataKey="value" fill="#D4AF37" opacity={0.5} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-[#666]">معاينة سريعة لتوزع علامات التلاميذ تحت إشراف الأستاذ المختار كعينة أولية.</p>
              </div>
            )}
            <button onClick={() => {
              if (!selectedTeacher || !selectedSubjectId) return;
              const teacherStudents = students.filter(s => {
                const group = groups.find(g => g.id === s.groupId);
                return group?.teachers?.[selectedSubjectId] === selectedTeacher;
              });
              const subject = SUBJECTS.find(sub => sub.id === selectedSubjectId);
              const teacherScores = teacherStudents.map(s => s.scores.find(sc => sc.subjectId === selectedSubjectId)?.value || 0);
              const teacherAvg = teacherScores.length > 0 ? teacherScores.reduce((a, b) => a + b, 0) / teacherStudents.length : 0;

              onPrint({
                title: `تقرير أداء الأستاذ: ${selectedTeacher}`,
                subtitle: `المادة: ${subject?.name || ''} - ${config.academicYear}`,
                type: 'TEACHER',
                headers: ['التلميذ', 'الفوج', 'العلامة', 'المستوى'],
                rows: teacherStudents.map(s => {
                  const score = s.scores.find(sc => sc.subjectId === selectedSubjectId)?.value || 0;
                  return [
                    `${s.lastName} ${s.firstName}`,
                    groups.find(g => g.id === s.groupId)?.name || '',
                    score.toFixed(2),
                    score >= 10 ? 'متحكم' : 'غير متحكم'
                  ];
                }),
                stats: [
                  { label: 'عدد التلاميذ', value: teacherStudents.length.toString() },
                  { label: 'متوسط العلامة', value: teacherAvg.toFixed(2) },
                  { label: 'نسبة النجاح في المادة', value: `${teacherScores.length > 0 ? ((teacherScores.filter(v => v >= 10).length / teacherScores.length) * 100).toFixed(1) : 0}%` }
                ],
                charts: [
                  { label: `توزيع علامات مادة ${subject?.name}`, data: getScoreDistribution(teacherScores), type: 'BAR' }
                ],
                analysis: getDetailedTeacherAnalysis(selectedTeacher, subject?.name || '', teacherScores, teacherAvg)
              });
            }} className="w-full py-3 bg-[#D4AF37] text-black font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#B48F27] transition-all disabled:opacity-50" disabled={!selectedTeacher || !selectedSubjectId}><Printer size={14} /> طباعة التقرير</button>
          </div>
        </div>

        {/* Custom Range Report */}
        <div className="bg-[#111] border border-[#222] p-8 space-y-6">
          <div className="flex items-center gap-4 text-[#D4AF37] mb-4">
            <Target size={24} />
            <h3 className="text-xl font-serif italic">تقرير المعايير المخصصة</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] text-[#444] uppercase font-bold">من (العلامة)</label>
                <input type="number" min="0" max="20" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-full bg-black border border-[#222] p-2 text-xs text-[#D4AF37] outline-none" />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] text-[#444] uppercase font-bold">إلى (العلامة)</label>
                <input type="number" min="0" max="20" value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} className="w-full bg-black border border-[#222] p-2 text-xs text-[#D4AF37] outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#444] uppercase font-bold">المعيار الإحصائي</label>
              <select 
                value={customSubjectId || ''} 
                onChange={(e) => setCustomSubjectId(e.target.value || null)}
                className="w-full bg-black border border-[#222] p-2 text-xs text-[#888] outline-none"
              >
                <option value="">كل المواد (المعدل العام)</option>
                {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#444] uppercase font-bold">الفوج التربوي</label>
              <select 
                value={customGroupId || ''} 
                onChange={(e) => setCustomGroupId(e.target.value || null)}
                className="w-full bg-black border border-[#222] p-2 text-xs text-[#888] outline-none"
              >
                <option value="">جميع الأفواج</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[#444] uppercase font-bold">حالة النجاح</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-black border border-[#222] p-2 text-xs text-[#888] outline-none"
              >
                <option value="ALL">الكل</option>
                <option value="PASS">الناجحون فقط (&gt;= 10)</option>
                <option value="FAIL">الراسبون فقط (&lt; 10)</option>
              </select>
            </div>
            <button onClick={() => {
              const rangeStudents = students.filter(s => {
                if (customGroupId && s.groupId !== customGroupId) return false;
                const gpa = calculateAvg(s);
                if (statusFilter === 'PASS' && gpa < 10) return false;
                if (statusFilter === 'FAIL' && gpa >= 10) return false;
                const val = customSubjectId 
                  ? (s.scores.find(sc => sc.subjectId === customSubjectId)?.value || 0)
                  : gpa;
                return val >= minScore && val <= maxScore;
              });
              
              const subjectName = customSubjectId ? SUBJECTS.find(s => s.id === customSubjectId)?.name : 'المعدل العام';
              const groupName = customGroupId ? groups.find(g => g.id === customGroupId)?.name : 'جميع الأفواج';
              const statusLabel = statusFilter === 'PASS' ? ' (الناجحون)' : statusFilter === 'FAIL' ? ' (الراسبون)' : '';

              onPrint({
                title: `قائمة التلاميذ المخصصة: ${groupName}${statusLabel}`,
                subtitle: `${subjectName} [${minScore} - ${maxScore}] - ${subtitlePrefix}`,
                type: 'INSTITUTIONAL',
                headers: ['التلميذ', 'الفوج', subjectName || 'المعدل'],
                rows: rangeStudents.map(s => [
                  `${s.lastName} ${s.firstName}`,
                  groups.find(g => g.id === s.groupId)?.name || '',
                  customSubjectId 
                    ? (s.scores.find(sc => sc.subjectId === customSubjectId)?.value || 0).toFixed(2)
                    : calculateAvg(s).toFixed(2)
                ]),
                stats: [
                  { label: 'عدد التلاميذ المستهدفين', value: rangeStudents.length.toString() },
                  { label: 'النسبة من الإجمالي', value: `${((rangeStudents.length / (students.length || 1)) * 100).toFixed(1)}%` }
                ],
                analysis: [
                  `عينة الفرز تشمل ${rangeStudents.length} تلميذاً من ${groupName}${statusLabel}.`,
                  `المعيار المستخدم: ${subjectName} في نطاق [${minScore} - ${maxScore}].`,
                  'يُنصح بمقارنة هذه القائمة بتقارير المواد الفردية للوقوف على أسباب التباين.'
                ]
              });
            }} className="lg:col-span-2 py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all text-xs">
              <Printer size={14} /> طباعة الفرز المتقدم
            </button>
          </div>
        </div>
        </div>

        {/* New Consolidated Institutional & Audit Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:col-span-3">
          {/* Institutional Report - Spans 2 columns */}
          <div className="lg:col-span-2 bg-[#111] border border-[#D4AF37]/20 p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#D4AF37]/10 transition-all duration-700" />
            <div className="space-y-4 text-center md:text-right relative z-10 flex-1">
               <h3 className="text-3xl font-serif italic text-white">التقرير الختامي للمؤسسة</h3>
               <p className="text-sm text-[#888] font-sans leading-relaxed italic max-w-2xl">كشف إحصائي شامل لنتائج المؤسسة حسب المواد، الأفواج، والنسب العامة للنجاح. وثيقة مرجعية لمجلس التوجيه والتسيبر.</p>
            </div>
            <button onClick={() => {
              const studentsWithAvg = students.map(s => ({
                ...s,
                avg: calculateAvg(s)
              }));
              const successful = studentsWithAvg.filter(s => s.avg >= 10);
              const overallSuccess = (successful.length / (students.length || 1)) * 100;
              const globalAvg = studentsWithAvg.length > 0 ? studentsWithAvg.reduce((acc, s) => acc + s.avg, 0) / students.length : 0;

              onPrint({
                title: `التقرير الختامي: ${scopeLabel}`,
                subtitle: subtitlePrefix,
                type: 'INSTITUTIONAL',
                headers: ['المادة', 'المعدل العام', 'نسبة التحصيل', 'الملاحظة'],
                rows: SUBJECTS.map(sub => {
                  const subScores = students.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
                  const avg = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
                  const rate = subScores.length > 0 ? (subScores.filter(v => v >= 10).length / subScores.length) * 100 : 0;
                  return [sub.name, avg.toFixed(2), `${rate.toFixed(1)}%`, avg >= 10 ? 'أداء مرضي' : 'نتائج دون المستوى المأمول'];
                }),
                stats: [
                  { label: 'تعداد التلاميذ', value: students.length.toString() },
                  { label: 'نسبة النجاح العامة', value: `${overallSuccess.toFixed(1)}%` },
                  { label: 'المعدل العام للمؤسسة', value: globalAvg.toFixed(2) }
                ],
                charts: [
                  { 
                    label: 'نسبة النجاح العامة', 
                    data: [
                      { name: 'ناجح', value: successful.length },
                      { name: 'راسب', value: students.length - successful.length }
                    ], 
                    type: 'PIE' 
                  },
                  {
                    label: 'متوسط العلامات حسب المادة',
                    data: SUBJECTS.map(sub => {
                       const subScores = students.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
                       const avg = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
                       return { name: sub.name, value: Number(avg.toFixed(2)) };
                    }),
                    type: 'BAR'
                  }
                ],
                analysis: getInstitutionalAnalysis(students, globalAvg, overallSuccess)
              });
            }} className="w-full md:w-auto px-10 py-5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white transition-all shadow-2xl relative z-10"><FileText size={20} /> استخراج التقرير الشامل</button>
          </div>

          {/* Subject Performance Audit - 1 column */}
          <div className="bg-black/40 border border-[#222] p-10 flex flex-col justify-between group hover:border-[#D4AF37]/40 transition-all gap-8">
            <div>
              <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center rounded-sm mb-6 group-hover:bg-[#D4AF37]/20 transition-all">
                <ChartIcon className="text-[#D4AF37]" size={24} />
              </div>
              <h3 className="text-xl font-black mb-3">تدقيق أداء المواد</h3>
              <p className="text-xs text-[#555] leading-relaxed">تقرير موحد يجمع بيانات كافة التلاميذ موزعة حسب المواد، مع تحليل الفجوات والتمكن البيداغوجي العام.</p>
            </div>
            <button onClick={() => {
                const successful = students.filter(s => calculateAvg(s) >= 10);
                const overallSuccess = (successful.length / (students.length || 1)) * 100;

                onPrint({
                  title: 'تدقيق النتائج حسب المواد الدراسية',
                  subtitle: `جداول التجميع العام - ${subtitlePrefix}`,
                  type: 'INSTITUTIONAL',
                  headers: ['المادة', 'المختبرون', 'أعلى علامة', 'أدنى علامة', 'المعدل', 'النجاح'],
                  rows: SUBJECTS.map(sub => {
                    const subScores = students.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
                    const avg = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
                    const rate = subScores.length > 0 ? (subScores.filter(v => v >= 10).length / subScores.length) * 100 : 0;
                    const max = subScores.length > 0 ? Math.max(...subScores) : 0;
                    const min = subScores.length > 0 ? Math.min(...subScores) : 0;
                    return [sub.name, subScores.length.toString(), max.toFixed(2), min.toFixed(2), avg.toFixed(2), `${rate.toFixed(1)}%`];
                  }),
                  stats: [
                    { label: 'إجمالي المواد', value: SUBJECTS.length.toString() },
                    { label: 'نسبة التمكن العام', value: `${overallSuccess.toFixed(1)}%` }
                  ],
                  charts: [
                    {
                      label: 'نسب النجاح حسب المواد',
                      data: SUBJECTS.map(sub => {
                         const subScores = students.flatMap(s => s.scores.filter(sc => sc.subjectId === sub.id).map(sc => sc.value));
                         const rate = subScores.length > 0 ? (subScores.filter(v => v >= 10).length / subScores.length) * 100 : 0;
                         return { name: sub.name, value: Number(rate.toFixed(1)) };
                      }),
                      type: 'BAR'
                    }
                  ],
                  analysis: getSubjectAuditAnalysis(students)
                });
            }} className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] transition-all">استخراج التدقيق الموحد</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
