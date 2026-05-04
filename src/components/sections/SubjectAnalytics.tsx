import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalyticsStats, Student, Group, SUBJECTS } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, ZAxis, Cell,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { 
  Info, Brain, Activity, TrendingUp, Target, 
  ArrowRight, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Zap, X,
  FileText, Users
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SubjectAnalyticsProps {
  stats: AnalyticsStats;
  students: Student[];
  groups: Group[];
}

export function SubjectAnalytics({ stats, students, groups }: SubjectAnalyticsProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(SUBJECTS[0].id);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [simulationBonus, setSimulationBonus] = useState(0);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode; type: 'success' | 'warning' | 'info' } | null>(null);

  // Filter students based on selected group
  const filteredStudents = useMemo(() => {
    if (!selectedGroupId) return students;
    return students.filter(s => s.groupId === selectedGroupId);
  }, [selectedGroupId, students]);

  const calculateAvg = (s: Student) => {
    if (s.scores.length === 0) return 0;
    const totalPoints = s.scores.reduce((acc, score) => {
      const sub = SUBJECTS.find(sub => sub.id === score.subjectId);
      return acc + (score.value * (sub?.coefficient || 1));
    }, 0);
    const totalCoeffs = SUBJECTS.reduce((acc, sub) => acc + sub.coefficient, 0);
    return totalPoints / totalCoeffs;
  };

  // Recalculate Distribution for the filtered set
  const currentDistribution = useMemo(() => {
    if (!selectedSubjectId) return [];
    const subScores = filteredStudents
      .flatMap(s => s.scores.filter(sc => sc.subjectId === selectedSubjectId).map(sc => sc.value));
    
    return Array.from({ length: 10 }, (_, i) => {
      const start = i * 2;
      const end = (i + 1) * 2;
      return {
        range: `${start}-${end}`,
        count: subScores.filter(v => v >= start && (i === 9 ? v <= end : v < end)).length
      };
    });
  }, [selectedSubjectId, filteredStudents]);

  // 1. Cognitive Gap Analysis (Variance) - Humanized
  const gapAnalysis = useMemo(() => {
    if (!selectedSubjectId) return null;
    const scores = filteredStudents.flatMap(s => s.scores.filter(sc => sc.subjectId === selectedSubjectId).map(sc => sc.value));
    if (scores.length === 0) return null;
    
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, b) => acc + Math.pow(b - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Traffic Light & Human Logic
    let statusColor = "text-green-500";
    let statusBg = "bg-green-500/10 border-green-500/20";
    let issueType = "مستويات متقاربة (وضع آمن)";
    let humanExplanation = "التلاميذ في هذا القسم يستوعبون المادة بشكل متقارب جداً. لا توجد فوارق شاسعة، مما يسهل عليك مهمة تقديم الدروس للجميع بنفس الوتيرة.";
    let recommendation = "واصل تعزيز المكتسبات الجماعية، وقم برفع سقف التحدي قليلاً في الاختبارات القادمة.";

    if (stdDev > 3.5) {
      statusColor = "text-red-500";
      statusBg = "bg-red-500/10 border-red-500/20";
      issueType = "قسم منقسم (نخبة مقابل متعثرين)";
      humanExplanation = "هنا نحتاج حذراً! القسم منشطر لنصفين: واحد متمكن والآخر ضائع تماماً. التدريس الجماعي التقليدي سيؤدي لفقدان الفئة الضعيفة نهائياً.";
      recommendation = "لا تكتفِ بالشرح من السبورة؛ عليك تقسيم القسم لمجموعات عمل ثنائية (واحد نبه مع واحد ضعيف) لتفعيل 'التعلم بالقرين'.";
    } else if (avg < 10) {
      statusColor = "text-orange-500";
      statusBg = "bg-orange-500/10 border-orange-500/20";
      issueType = "تعثر جماعي (فجوة منهجية)";
      humanExplanation = "الأرقام تشير إلى أن أغلب التلاميذ يواجهون نفس الصعوبة. المشكلة ليست فيهم كأفراد، بل قد تكون في 'منهجية المادة' أو 'صعوبة التقويم'.";
      recommendation = "أعد النظر في آخر فرض أو اختبار؛ ربما كان الوقت غير كافٍ أو الأسئلة معقدة بيداغوجياً. ركز على المفاهيم القاعدية أولاً.";
    }

    return { stdDev, issueType, recommendation, avg, humanExplanation, statusColor, statusBg };
  }, [selectedSubjectId, filteredStudents]);

  // 2. Cross-Correlation (Causality)
  const correlations = useMemo(() => {
    if (!selectedSubjectId) return [];
    
    return SUBJECTS.filter(s => s.id !== selectedSubjectId).map(other => {
      const pairs = filteredStudents.map(st => ({
        x: st.scores.find(sc => sc.subjectId === selectedSubjectId)?.value || 0,
        y: st.scores.find(sc => sc.subjectId === other.id)?.value || 0
      }));

      const n = pairs.length;
      if (n === 0) return { id: other.id, name: other.name, correlation: 0 };
      
      const sumX = pairs.reduce((a, b) => a + b.x, 0);
      const sumY = pairs.reduce((a, b) => a + b.y, 0);
      const sumXY = pairs.reduce((a, b) => a + (b.x * b.y), 0);
      const sumX2 = pairs.reduce((a, b) => a + (b.x * b.x), 0);
      const sumY2 = pairs.reduce((a, b) => a + (b.y * b.y), 0);
      
      const num = (n * sumXY) - (sumX * sumY);
      const den = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
      
      return { 
        id: other.id,
        name: other.name, 
        correlation: den === 0 ? 0 : num / den 
      };
    }).sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)).slice(0, 3);
  }, [selectedSubjectId, filteredStudents]);

  // 3. Simulation Impact
  const simulationImpact = useMemo(() => {
    if (!selectedSubjectId) return null;
    
    const originalSuccessful = filteredStudents.filter(s => calculateAvg(s) >= 10).length;
    
    const simulatedStudents = filteredStudents.map(s => ({
      ...s,
      scores: s.scores.map(sc => 
        sc.subjectId === selectedSubjectId 
          ? { ...sc, value: Math.min(20, sc.value + simulationBonus) }
          : sc
      )
    }));
    
    const simulatedSuccessful = simulatedStudents.filter(s => calculateAvg(s) >= 10).length;
    const jump = ((simulatedSuccessful - originalSuccessful) / (filteredStudents.length || 1)) * 100;
    
    return {
      originalRate: (originalSuccessful / (filteredStudents.length || 1)) * 100,
      simulatedRate: (simulatedSuccessful / (filteredStudents.length || 1)) * 100,
      jump,
      newCount: simulatedSuccessful
    };
  }, [selectedSubjectId, simulationBonus, filteredStudents]);

  // --- Advanced Recommendation Engine ---
  
  const getPedagogicalExplanation = (sub1Id: string, sub2Id: string) => {
    const pairings: Record<string, string> = {
      'math-phys': "تكامل المهارات المنطقية. التفوق في الرياضيات يمنح التلميذ 'الأدوات' اللازمة لحل المسائل الفيزيائية المعقدة.",
      'ar-his_geo': "اللغة هي جسر الاستيعاب. التمكن من العربية يسهل تحليل النصوص التاريخية والتمكن من المصطلحات الجغرافية.",
      'fr-en': "ذكاء لغوي مشترك. آليات تعلم اللغات الأجنبية واحدة، والاستثمار في أحداهما يدعم الأخرى غالباً.",
      'science-phys': "اتصال العلوم التجريبية. المنهج العلمي في الملاحظة والاستنتاج مشترك بين المادتين.",
      'math-en': "ارتباط تقني. الكثير من المصطلحات العلمية والمنطقية تجد جذوراً مشتركة مما يسهل الاستيعاب.",
      'islamic-ar': "ارتباط لاهوتي ولغوي. النصوص الدينية تعزز الذوق الأدبي والقدرة التعبيرية في اللغة العربية.",
    };

    const key = [sub1Id, sub2Id].sort().join('-');
    return pairings[key] || "تداخل في المهارات الذهنية العامة كالحفظ، التحليل، أو القدرة على التركيز المستمر.";
  };

  const arabicDetailedAnalysis = useMemo(() => {
    if (selectedSubjectId !== 'ar') return null;

    const scoresWithSub = filteredStudents
      .map(s => s.scores.find(sc => sc.subjectId === 'ar'))
      .filter(sc => sc?.subScores);

    if (scoresWithSub.length === 0) return null;

    const data = {
      intellectual: { total: 0, count: 0 },
      linguistic: { total: 0, count: 0 },
      integrated: { total: 0, count: 0 }
    };

    scoresWithSub.forEach(sc => {
      const sub = sc?.subScores;
      if (sub?.intellectual !== undefined) {
        data.intellectual.total += sub.intellectual;
        data.intellectual.count++;
      }
      if (sub?.linguistic !== undefined) {
        data.linguistic.total += sub.linguistic;
        data.linguistic.count++;
      }
      if (sub?.integrated !== undefined) {
        data.integrated.total += sub.integrated;
        data.integrated.count++;
      }
    });

    return {
      intellectualAvg: data.intellectual.count > 0 ? (data.intellectual.total / data.intellectual.count) : null,
      linguisticAvg: data.linguistic.count > 0 ? (data.linguistic.total / data.linguistic.count) : null,
      integratedAvg: data.integrated.count > 0 ? (data.integrated.total / data.integrated.count) : null,
    };
  }, [selectedSubjectId, filteredStudents]);

  const mathDetailedAnalysis = useMemo(() => {
    if (selectedSubjectId !== 'math') return null;

    const scores = filteredStudents
      .map(s => s.scores.find(sc => sc.subjectId === 'math'))
      .filter(sc => sc?.subScores);

    if (scores.length === 0) return null;

    const data = {
      ex1: { total: 0, count: 0 },
      ex2: { total: 0, count: 0 },
      ex3: { total: 0, count: 0 },
      ex4: { total: 0, count: 0 },
      integrated: { total: 0, count: 0 }
    };

    scores.forEach(sc => {
      const sub = sc?.subScores;
      if (sub?.ex1 !== undefined) { data.ex1.total += sub.ex1; data.ex1.count++; }
      if (sub?.ex2 !== undefined) { data.ex2.total += sub.ex2; data.ex2.count++; }
      if (sub?.ex3 !== undefined) { data.ex3.total += sub.ex3; data.ex3.count++; }
      if (sub?.ex4 !== undefined) { data.ex4.total += sub.ex4; data.ex4.count++; }
      if (sub?.integrated !== undefined) { data.integrated.total += sub.integrated; data.integrated.count++; }
    });

    return {
      ex1Avg: data.ex1.count > 0 ? (data.ex1.total / data.ex1.count) : null,
      ex2Avg: data.ex2.count > 0 ? (data.ex2.total / data.ex2.count) : null,
      ex3Avg: data.ex3.count > 0 ? (data.ex3.total / data.ex3.count) : null,
      ex4Avg: data.ex4.count > 0 ? (data.ex4.total / data.ex4.count) : null,
      integratedAvg: data.integrated.count > 0 ? (data.integrated.total / data.integrated.count) : null,
    };
  }, [selectedSubjectId, filteredStudents]);

  const getDynamicGapRecommendation = () => {
    if (!gapAnalysis || !selectedSubjectId) return null;

    const lowAchievers = filteredStudents.filter(s => {
      const score = s.scores.find(sc => sc.subjectId === selectedSubjectId)?.value || 0;
      return score < 8; // عتبة التعثر الحاد
    }).sort((a, b) => {
      const sA = a.scores.find(sc => sc.subjectId === selectedSubjectId)?.value || 0;
      const sB = b.scores.find(sc => sc.subjectId === selectedSubjectId)?.value || 0;
      return sA - sB;
    });

    if (gapAnalysis.stdDev > 3.5) {
      return {
        title: "خطة معالجة التفاوت الحاد",
        type: 'warning' as const,
        content: (
          <div className="space-y-4">
            <p className="text-sm text-[#888]">القسم يعاني من "استقطاب حاد" (Std Dev: {gapAnalysis.stdDev.toFixed(2)}). لديك **{lowAchievers.length}** تلميذ في منطقة الخطر بسب الانفصال عن الركب.</p>
            <div className="p-4 bg-red-500/10 border-r-2 border-red-500">
               <p className="text-xs font-bold text-red-500 mb-2">قائمة الأولوية القصوى للمعالجة:</p>
               <div className="grid grid-cols-2 gap-2">
                 {lowAchievers.slice(0, 4).map(s => (
                   <div key={s.id} className="text-[10px] text-white">
                     • {s.lastName} {s.firstName} ({s.scores.find(sc => sc.subjectId === selectedSubjectId)?.value}/20)
                   </div>
                 ))}
               </div>
            </div>
            <div className="bg-white/5 p-4 space-y-2">
              <p className="text-[11px] font-bold text-[#D4AF37]">التوصية الإجرائية:</p>
              <p className="text-[10px] text-[#888] leading-relaxed">
                هؤلاء التلاميذ يحتاجون مهام بسيطة لترميم الثقة. لا تطلب منهم حل وضعيات مركبة الآن. ركز معهم على الأسئلة المباشرة (استرجاع المعارف) بينما توجه الفئة المتفوقة نحو مهام "التحليل والنقد".
              </p>
            </div>
          </div>
        )
      };
    }

    if (gapAnalysis.avg < 10) {
      return {
        title: "استراتيجية الإنعاش الجماعي",
        type: 'warning' as const,
        content: (
          <div className="space-y-4">
            <p className="text-sm text-[#888]">المشكلة هنا ليست تفاوت الأفراد، بل "ضعف الأداء الجماعي". المعدل ({gapAnalysis.avg.toFixed(2)}) يشير إلى فجوة منهجيّة.</p>
            <div className="p-4 bg-orange-500/10 border-r-2 border-orange-500">
               <p className="text-xs font-bold text-orange-500 mb-2">التشخيص البيداغوجي:</p>
               <p className="text-[10px] text-white leading-relaxed">
                 احتمال كبير أن وتيرة تقديم الدروس أسرع من قدرة استيعاب القسم، أو أن نمط الأسئلة في الفروض لم يتدرب عليه التلاميذ بشكل كافٍ.
               </p>
            </div>
            <div className="bg-white/5 p-4 space-y-2">
              <p className="text-[11px] font-bold text-[#D4AF37]">الخطة المقترحة:</p>
              <p className="text-[10px] text-[#888] leading-relaxed">
                خصص حصة "مراجعة شمولية" لأكثر درسين تم فيهما تسجيل تعثر. لا تتقدم في البرنامج حالياً حتى تضمن استرجاع عتبة الـ 10 لأغلب التلاميذ.
              </p>
            </div>
          </div>
        )
      };
    }

    return {
      title: "الحفاظ على الاستقرار التجانس",
      type: 'success' as const,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#888]">وضع القسم مثالي من حيث التجانس. هذه فرصة ذهبية لرفع المستوى النوعي.</p>
          <div className="p-4 bg-green-500/10 border-r-2 border-green-500">
             <p className="text-[10px] text-white leading-relaxed">
               بما أن الجميع يستوعب بنفس الوتيرة، يمكنك بدء إدخال "وضعيات إدماجية معقدة" لتحسين مهارات التفكير العليا لدى الجميع دون خوف من ترك أحد خلفك.
             </p>
          </div>
        </div>
      )
    };
  };

  // Analysis for Bell Curve (Finding Reading)
  const getCurveInterpretation = () => {
    if (currentDistribution.length === 0) return null;
    
    // Find the mode (most common range)
    const sortedDist = [...currentDistribution].sort((a, b) => b.count - a.count);
    const mode = sortedDist[0];
    const avg = gapAnalysis?.avg || 0;

    let reading = "";
    let highlight = "";
    
    if (avg > 12 && parseInt(mode.range.split('-')[0]) >= 12) {
      highlight = "منحنى منزاح لليمين (تميز)";
      reading = "النتائج ممتازة، وأغلب التلاميذ يتمركزون في منطقة الامتياز. هذا يشير إلى أن الاختبار كان في متناولهم أو أن مستوى الفوج عالٍ جداً.";
    } else if (avg < 9 && parseInt(mode.range.split('-')[1]) <= 10) {
      highlight = "منحنى منزاح لليسار (تعثر)";
      reading = "هناك تكدس كبير تحت عتبة الـ 10. هذا جرس إنذار! إما أن المواضيع كانت تفوق مستوى التلاميذ أو أن القاعدة الأساسية للمادة مفقودة.";
    } else if (parseInt(mode.range.split('-')[0]) >= 8 && parseInt(mode.range.split('-')[1]) <= 13) {
      highlight = "منحنى متمركز (توزع طبيعي)";
      reading = "أغلب النتائج حول المعدل. هذا هو التوزيع الصحي بيداغوجياً، حيث يعبر عن اختبار تدرج في الصعوبة وفصل بين مختلف المستويات بصدق.";
    } else {
      highlight = "منحنى مشتت (فجوة مستويات)";
      reading = "لا يوجد تكتل واضح، النتائج مبعثرة. هذا يعني عدم استقرار في التحصيل الدراسي وصعوبة التنبؤ بسلوك الفوج في المرة القادمة.";
    }

    return { highlight, reading };
  };

  const getSimulationRecommendation = () => {
    if (!simulationImpact) return null;

    const pivotStudents = filteredStudents.filter(s => {
      const avg = calculateAvg(s);
      return avg >= 9 && avg < 10;
    }).sort((a, b) => calculateAvg(b) - calculateAvg(a));

    return {
      title: "تحليل رافعة النجاح للمؤسسة",
      type: 'success' as const,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#888]">بمجهود إضافي بسيط في مادتك (+{simulationBonus} نقاط)، يمكنك نقل **{pivotStudents.length}** تلاميذ من "حافة الرسوب" إلى "بر النجاة".</p>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {pivotStudents.map(s => {
              const studentGroup = groups.find(g => g.id === s.groupId);
              return (
                <div key={s.id} className="p-3 bg-blue-500/5 border border-blue-500/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-serif">{s.firstName} {s.lastName}</span>
                    <span className="text-[10px] text-[#444] font-mono">{studentGroup?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-blue-400">المعدل العام الحالي:</span>
                    <span className="text-xs font-mono text-blue-400">{calculateAvg(s).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 bg-white/5 border-l-2 border-blue-500">
             <p className="text-[10px] text-[#D4AF37] leading-tight font-bold italic mb-1">لماذا هؤلاء تحديداً؟</p>
             <p className="text-[10px] text-[#888] leading-relaxed">
               هؤلاء التلاميذ هم "الكتلة الحرجة". مجهود قليل من أستاذ المادة هنا يغير مصير المؤسسة بكاملها في نسب النجاح. أي تحسن طفيف في مادتك سيرفع معدلهم العام فوق 10 مباشرة.
             </p>
          </div>
        </div>
      )
    };
  };

  // 2. Simulation Interpretation
  const getSimulationVibe = (jump: number) => {
    if (jump > 5) return { 
      label: "مادة قاطرة", 
      desc: "تحسين هذه المادة سيؤدي لقفزة تاريخية في نجاح المؤسسة. هي الرهان الأول لمجلس الأساتذة." 
    };
    if (jump > 2) return { 
      label: "مادة مساعدة", 
      desc: "هذه المادة تساهم في رفع المعدلات، لكنها ليست المحرك الأساسي." 
    };
    return { 
      label: "مادة تخصص", 
      desc: "تأثيرها محدود على نسبة النجاح لكنها هامة للمسار الدراسي للتلميذ." 
    };
  };

  const selectedSubData = stats.subjectStats.find(s => s.id === selectedSubjectId);

  const institutionalComparison = useMemo(() => {
    if (!selectedSubjectId || !selectedSubData) return null;
    
    // Group average
    const subScores = filteredStudents
      .flatMap(s => s.scores.filter(sc => sc.subjectId === selectedSubjectId).map(sc => sc.value));
    const groupAvg = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0;
    
    // Global average (from stats)
    const globalAvg = selectedSubData.average;
    const diff = groupAvg - globalAvg;

    return {
      groupAvg,
      globalAvg,
      diff,
      isBetter: diff >= 0
    };
  }, [selectedSubjectId, selectedSubData, filteredStudents]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="border-b border-[#1A1A1A] pb-10">
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-white italic tracking-tight">التحليل البيداغوجي</h2>
              <p className="text-[#888] mt-2 font-sans text-xs sm:text-sm tracking-wide">ترجمة الأرقام إلى قرارات تعليمية ملموسة</p>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {SUBJECTS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border",
                    selectedSubjectId === s.id 
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]" 
                      : "text-[#444] border-[#222] hover:border-[#444]"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Ribbon */}
          {institutionalComparison && (
            <div className="flex items-center gap-4 py-3 px-6 bg-[#D4AF37]/5 border-y border-[#D4AF37]/10">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#D4AF37]" />
                <span className="text-[10px] text-[#888] uppercase font-bold tracking-tighter">موقع الفوج الحالي:</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white">معدل الفوج:</span>
                  <span className="font-mono text-xs text-[#D4AF37]">{institutionalComparison.groupAvg.toFixed(2)}</span>
                </div>
                <div className="w-px h-3 bg-[#444]" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#444]">معدل المؤسسة المستهدف:</span>
                  <span className="font-mono text-xs text-[#666]">{institutionalComparison.globalAvg.toFixed(2)}</span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold",
                  institutionalComparison.isBetter ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {institutionalComparison.isBetter ? "↑ أداء متفوق" : "↓ دون المستوى العام"}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 bg-[#111] p-2 border border-[#222]">
            <span className="text-[10px] text-[#444] font-bold uppercase tracking-widest px-4">تصفية حسب:</span>
            <button 
              onClick={() => setSelectedGroupId(null)}
              className={cn(
                "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                !selectedGroupId ? "bg-[#D4AF37] text-black" : "text-[#888] hover:text-white"
              )}
            >
              كل المؤسسة
            </button>
            {groups.map(g => (
              <button 
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className={cn(
                  "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                  selectedGroupId === g.id ? "bg-[#D4AF37] text-black" : "text-[#444] hover:text-white"
                )}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {selectedSubjectId && selectedSubData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Visual: Bell Curve & Distribution */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#111] border border-[#222] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
               <div className="flex justify-between items-start relative z-10 mb-8">
                  <div>
                    <h3 className="text-2xl font-serif italic text-white flex items-center gap-3">
                      <TrendingUp size={20} className="text-[#D4AF37]" /> دليل تموضع التلاميذ
                    </h3>
                    <p className="text-xs text-[#555] mt-1">أين تتكتل أغلب علامات التلاميذ؟ هذا المنحنى يكشف "سلوك القسم" لـ {selectedGroupId ? groups.find(g => g.id === selectedGroupId)?.name : 'كل الأقسام'}.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const interpretation = getCurveInterpretation();
                      setModalContent({
                        title: "فهم توزيع العلامات",
                        type: 'info',
                        content: (
                          <div className="space-y-6">
                            <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-sm">
                               <p className="text-[10px] text-[#D4AF37] font-bold uppercase mb-2">قراءة النتيجة (فني):</p>
                               <div className="space-y-2">
                                  <p className="text-lg font-serif italic text-white leading-tight">{interpretation?.highlight}</p>
                                  <p className="text-sm text-[#888] leading-relaxed">{interpretation?.reading}</p>
                               </div>
                            </div>

                            <div className="space-y-4">
                              <p className="text-xs text-[#555] leading-relaxed uppercase tracking-widest font-bold">معلومات تقنية للمدير:</p>
                              <p className="text-[11px] text-[#888] leading-relaxed">
                                يُستخدم هذا المنحنى (منحنى الجرس) لاختبار مدى "عدالة وصدق" الاختبارات التي أعدها الأستاذ.
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border-r-2 border-[#D4AF37]">
                                  <h5 className="text-[#D4AF37] font-bold mb-2">التوزع الطبيعي</h5>
                                  <p className="text-[10px] text-[#666]">يعني أن الأسئلة تدرجت من السهولة للصعوبة بشكل علمي، وهي أصح وضعية بيداغوجية.</p>
                                </div>
                                <div className="p-4 bg-white/5 border-r-2 border-red-500">
                                  <h5 className="text-red-500 font-bold mb-2">التوزع المنزاح</h5>
                                  <p className="text-[10px] text-[#666]">إذا انزاح المنحنى لليسار، فهذا يعني أن الاختبار كان يعتمد على 'الحفظ الصم' أو كان 'تعجيزياً'.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      });
                    }}
                    className="p-2 border border-[#222] hover:bg-[#D4AF37]/10 transition-all text-[#D4AF37]"
                  >
                    <Info size={16} />
                  </button>
               </div>

               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis 
                        dataKey="range" 
                        stroke="#444" 
                        fontSize={9} 
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'نطاق العلامات (0-20)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#666' }} 
                      />
                      <YAxis 
                        stroke="#444" 
                        fontSize={9} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #D4AF37', borderRadius: '0', fontSize: '10px' }}
                        itemStyle={{ color: '#D4AF37' }}
                        cursor={{ stroke: '#D4AF37', strokeWidth: 1, strokeDasharray: '5 5' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#D4AF37" 
                        fill="url(#colorCount)" 
                        fillOpacity={1} 
                        strokeWidth={3}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Detailed Skills Breakdown for Arabic */}
            {selectedSubjectId === 'ar' && arabicDetailedAnalysis && (
              <div className="bg-[#111] border border-[#222] p-8 border-r-4 border-r-green-500/50">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-serif italic text-white flex items-center gap-3">
                      <Brain size={20} className="text-green-500" /> تحليل الكفاءات الختامية (اللغة العربية)
                    </h3>
                    <p className="text-[10px] text-[#444] uppercase tracking-widest mt-1">تشخيص دقيق لمواطن القوة والضعف حسب دليل بناء الاختبار</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-[#888]">الجزء 1: البناء الفكري</span>
                      <span className="text-sm font-mono text-white">
                        {arabicDetailedAnalysis.intellectualAvg?.toFixed(1) || '0.0'}/4
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((arabicDetailedAnalysis.intellectualAvg || 0) / 4) * 100}%` }}
                        className="h-full bg-green-500"
                      />
                    </div>
                    <p className="text-[9px] text-[#555] italic">يقيس مدى قدرة التلميذ على استخلاص الأفكار وفهم النص.</p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-[#888]">الجزء 1: البناء اللغوي والفني</span>
                      <span className="text-sm font-mono text-white">
                        {arabicDetailedAnalysis.linguisticAvg?.toFixed(1) || '0.0'}/8
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((arabicDetailedAnalysis.linguisticAvg || 0) / 8) * 100}%` }}
                        className="h-full bg-[#D4AF37]"
                      />
                    </div>
                    <p className="text-[9px] text-[#555] italic">يقيس التمكن من قواعد اللغة، الصرف، والأساليب البلاغية.</p>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-[#888]">الجزء 2: الوضعية الإدماجية</span>
                      <span className="text-sm font-mono text-white">
                        {arabicDetailedAnalysis.integratedAvg?.toFixed(1) || '0.0'}/8
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((arabicDetailedAnalysis.integratedAvg || 0) / 8) * 100}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                    <p className="text-[9px] text-[#555] italic">يقيس مهارة الإنتاج الكتابي وتوظيف المكتسبات في وضعية دالة.</p>
                  </div>
                </div>

                {arabicDetailedAnalysis.integratedAvg !== null && arabicDetailedAnalysis.linguisticAvg !== null && (
                  <div className="mt-8 p-4 border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                    <p className="text-[11px] text-[#D4AF37]">
                      <span className="font-bold">التشخيص البيداغوجي الموحد: </span>
                      {(() => {
                        const sitPerc = (arabicDetailedAnalysis.integratedAvg / 8) * 100;
                        const lingPerc = (arabicDetailedAnalysis.linguisticAvg / 8) * 100;
                        
                        if (lingPerc > 70 && sitPerc < 40) return "هناك 'انفصام' بيداغوجي: التلاميذ متمكنون من القواعد نظرياً لكنهم يعجزون عن توظيفها في تعبير كتابي سليم. ركز على التدريب الإنتاجي.";
                        if (sitPerc > 60 && lingPerc < 50) return "التلاميذ يملكون طاقة تعبيرية ممتازة لكنها تفتقر للانضباط القواعدي. ركز على حصص 'التصحيح الذاتي' وتجويد اللغة.";
                        return "توازن مقبول في تعلم المادة. استمر في تعميق الربط بين 'القواعد' و'الاستعمال الفعلي' للغة.";
                      })()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Breakdown for Math */}
            {selectedSubjectId === 'math' && mathDetailedAnalysis && (
              <div className="bg-[#111] border border-[#222] p-8 border-r-4 border-r-orange-500/50">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-serif italic text-white flex items-center gap-3">
                      <TrendingUp size={20} className="text-orange-500" /> تحليل مجالات الرياضيات (BEM)
                    </h3>
                    <p className="text-[10px] text-[#444] uppercase tracking-widest mt-1">تفكيك الأداء بين التمارين المستقلة والوضعية الإدماجية</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'ت 1: أعداد/حساب', val: mathDetailedAnalysis.ex1Avg, max: 3, color: 'bg-orange-500' },
                    { label: 'ت 2: جبر/معادلات', val: mathDetailedAnalysis.ex2Avg, max: 3, color: 'bg-orange-400' },
                    { label: 'ت 3: هندسة مستوية', val: mathDetailedAnalysis.ex3Avg, max: 3, color: 'bg-orange-600' },
                    { label: 'ت 4: جملة معادلات', val: mathDetailedAnalysis.ex4Avg, max: 3, color: 'bg-orange-300' },
                    { label: 'الوضعية الإدماجية', val: mathDetailedAnalysis.integratedAvg, max: 8, color: 'bg-blue-500' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-[#888]">
                         <span>{item.label}</span>
                         <span className="font-mono text-white">{item.val?.toFixed(1) || '0.0'}/{item.max}</span>
                      </div>
                      <div className="h-1 bg-[#222] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((item.val || 0) / item.max) * 100}%` }}
                          className={cn("h-full", item.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 border border-orange-500/20 bg-orange-500/5">
                  <p className="text-[11px] text-orange-200">
                    <span className="font-bold">التوصية الرياضية للمدير: </span>
                    {(() => {
                      const exAvg = ((mathDetailedAnalysis.ex1Avg || 0) + (mathDetailedAnalysis.ex2Avg || 0) + (mathDetailedAnalysis.ex3Avg || 0) + (mathDetailedAnalysis.ex4Avg || 0)) / 12;
                      const sitAvg = (mathDetailedAnalysis.integratedAvg || 0) / 8;
                      
                      if (exAvg > 0.6 && sitAvg < 0.4) return "التلاميذ يملكون مهارات حسابية رائعة في التمارين المستقلة، لكنهم يعجزون عن تطبيقها في 'مشروع حل مشكلة' (الوضعية). هذا مؤشر على ضعف في 'الذكاء التحليلي' يتطلب حصصاً تركز على استراتيجيات حل المشكلات وليس مجرد تمارين جافة.";
                      if (exAvg < 0.4) return "هناك ضعف قاعدي في الأساسيات الرياضية (جدول الضرب، قواعد الإشارات، التحويلات). الوضعية الإدماجية ستظل معقدة عليهم طالما لم يتم ترميم هذه الأساسيات أولاً.";
                      return "توازن جيد بين تحصيل الموارد وتوظيفها. استمر في تعميق مهارات النمذجة الرياضية لضمان الامتياز.";
                    })()}
                  </p>
                </div>
              </div>
            )}

            {/* Simulated Impact Section */}
            <div className="bg-[#0f0f0f] border border-[#222] p-8 border-r-4 border-r-blue-500/50 cursor-pointer group"
                 onClick={() => setModalContent(getSimulationRecommendation())}>
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <Zap size={20} className="text-blue-500" /> ميزان أثر المادة (ماذا لو تحسنا؟)
                    </h3>
                    <p className="text-[10px] text-[#444] uppercase tracking-widest mt-1">توقع النتائج الكلية بناءً على تحسن هذه المادة فقط</p>
                  </div>
                  <Info size={16} className="text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center" onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold text-[#444]">
                       <span>مجهود المعالجة المخطط</span>
                       <span className="text-blue-500">+{simulationBonus} نقطة</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="5" step="0.5" 
                      value={simulationBonus}
                      onChange={(e) => setSimulationBonus(Number(e.target.value))}
                      className="w-full h-1 bg-[#222] appearance-none accent-blue-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-[#555] leading-relaxed italic">حرك المؤشر لترى كيف تنقذ هذه المادة تلاميذ "الحافة" الذين معدلاتهم قريبة من 10.</p>
                  </div>

                  <div className="flex items-center gap-6 justify-center">
                     <div className="text-center">
                        <p className="text-[10px] text-[#444] uppercase mb-1">النجاح الحالي</p>
                        <p className="text-2xl font-mono text-white opacity-40">{simulationImpact?.originalRate.toFixed(1)}%</p>
                     </div>
                     <ArrowRight size={20} className="text-[#222]" />
                     <div className="text-center relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-black text-[8px] font-black rounded-sm">هدف محتمل</div>
                        <p className="text-[10px] text-blue-500 uppercase mb-1">النجاح الكلي</p>
                        <p className="text-4xl font-mono text-white font-black">{simulationImpact?.simulatedRate.toFixed(1)}%</p>
                     </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-sm">
                    <div className="flex items-center gap-2 text-blue-500 mb-2">
                       <Target size={14} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{getSimulationVibe(simulationImpact?.jump || 0).label}</span>
                    </div>
                    <p className="text-xs text-[#888] leading-tight mb-2 tracking-tight">{getSimulationVibe(simulationImpact?.jump || 0).desc}</p>
                    <p className="text-2xl font-bold text-white">+{simulationImpact?.jump.toFixed(1)}% <span className="text-[10px] text-blue-400 font-normal">زيادة مرتقبة</span></p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Human Interpretation & Recommendations */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Cognitive Gap / Fluctuation - HUMANIZED */}
            <div 
              className={cn("border p-6 space-y-6 transition-all cursor-pointer group", gapAnalysis?.statusBg)}
              onClick={() => setModalContent(getDynamicGapRecommendation())}
            >
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Activity size={20} className={gapAnalysis?.statusColor} />
                    <h4 className={cn("font-bold text-sm uppercase tracking-widest", gapAnalysis?.statusColor)}>توازن مستويات التلاميذ</h4>
                 </div>
                 <Info size={14} className={cn("opacity-20 group-hover:opacity-100 transition-opacity", gapAnalysis?.statusColor)} />
               </div>
               
               <div className="space-y-4">
                  <p className="text-lg font-serif italic text-white leading-tight">{gapAnalysis?.issueType}</p>
                  
                  <div className="bg-black/40 p-4 border-r-2 border-current">
                     <p className="text-xs text-[#888] leading-relaxed">{gapAnalysis?.humanExplanation}</p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-sm">
                     <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
                        <Lightbulb size={12} />
                        <span className="text-[9px] font-bold uppercase">الخطة العلاجية المقترحة</span>
                     </div>
                     <p className="text-xs text-white leading-relaxed">{gapAnalysis?.recommendation}</p>
                  </div>
               </div>
            </div>

             {/* Subject Correlation (Causality) - HUMANIZED */}
             <div className="bg-[#111] border border-[#222] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-purple-500">
                     <Brain size={20} />
                     <h4 className="font-bold text-sm uppercase tracking-widest">مواد تدعم هذا التخصص</h4>
                  </div>
                  <button 
                    onClick={() => setModalContent({
                      title: "فهم ترابط المواد (الارتباط الشرطي)",
                      type: 'info',
                      content: (
                        <div className="space-y-6">
                          <p className="text-sm text-[#888] leading-relaxed">
                            هذا المؤشر لا يعني أن مادة "تسبب" نجاح مادة أخرى، بل يعني وجود <span className="text-purple-400 font-bold">مهارات ذهنية مشتركة</span>.
                          </p>
                          <div className="space-y-4">
                            <div className="p-4 bg-white/5 border-r-2 border-purple-500">
                              <h5 className="text-purple-400 font-bold mb-1 text-xs">لماذا تظهر الفيزياء مرتبطة بالرياضيات؟</h5>
                              <p className="text-[10px] text-[#666]">لأن كلاهما يعتمد على مهارة 'التجريد' و 'المنطق'. إذا تحسن التلميذ في أحدهما، فهذا يعني أن جهازه المنطقي تطور، مما ينعكس آلياً على الأخرى.</p>
                            </div>
                            <div className="p-4 bg-white/5 border-r-2 border-green-500">
                              <h5 className="text-green-400 font-bold mb-1 text-xs">الفائدة العملية للمدير:</h5>
                              <p className="text-[10px] text-[#666]">عند ملاحظة ضعف في {SUBJECTS.find(s => s.id === selectedSubjectId)?.name}، اطلب من أستاذ المادة التنسيق مع أساتذة المواد المرتبطة أعلاه لتوحيد المصطلحات والمنهجية.</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    className="p-1 px-2 border border-purple-500/20 text-purple-500 text-[8px] font-bold uppercase transition-all hover:bg-purple-500/10"
                  >
                    شرح علمي
                  </button>
                </div>
                
                <p className="text-[10px] text-[#555] leading-relaxed italic">التلميذ الذي يتحسن في {SUBJECTS.find(s => s.id === selectedSubjectId)?.name}، غالباً ما يتحسن آلياً في:</p>
                
                <div className="space-y-6">
                   {correlations.map((cor, idx) => (
                     <div key={cor.id} className="space-y-3 group/cor">
                        <div className="flex justify-between text-xs">
                           <span className="text-white group-hover/cor:text-purple-400 transition-colors">{cor.name}</span>
                           <span className={cn(
                             "font-mono text-[10px] px-1.5 rounded-full border",
                             Math.abs(cor.correlation) > 0.7 ? "text-green-400 border-green-500/20 bg-green-500/5" : "text-orange-400 border-orange-500/20 bg-orange-500/5"
                           )}>
                             {(cor.correlation * 100).toFixed(0)}% ارتباط
                           </span>
                        </div>
                        <div className="h-1 bg-[#222] overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.abs(cor.correlation) * 100}%` }}
                             className={cn(
                               "h-full transition-all",
                               idx === 0 ? "bg-purple-500" : idx === 1 ? "bg-purple-600" : "bg-purple-700"
                             )}
                           />
                        </div>
                        <p className="text-[9px] text-[#666] leading-relaxed pr-2 border-r border-[#333] group-hover/cor:text-[#888] transition-colors">
                          {getPedagogicalExplanation(selectedSubjectId!, cor.id)}
                        </p>
                     </div>
                   ))}
                </div>
                
                <div className="p-3 bg-white/5 border border-white/10 text-[9px] text-[#888] leading-relaxed">
                   <span className="text-purple-400 font-bold">بيداغوجيا التكامل:</span> إذا واجه تلميذك صعوبة هنا، ابحث عن نقاط قوته في المواد أعلاه واستخدمها كمدخل لشرح الدروس الجديدة له.
                </div>
             </div>

            {/* Strategic Summary - HUMANIZED */}
            <div className="bg-gradient-to-br from-[#111] to-[#000] border border-[#D4AF37]/20 p-6 relative group overflow-hidden">
               <div className="absolute bottom-0 right-0 p-2 opacity-5">
                  <FileText size={80} />
               </div>
               <h4 className="text-xs font-bold text-[#D4AF37] mb-4 uppercase tracking-widest">توجيهات مجلس الأقسام</h4>
               <div className="space-y-6 relative z-10">
                  <div className="space-y-1">
                     <p className="text-[10px] text-white font-bold opacity-50">التشخيص الاستراتيجي:</p>
                     <p className="text-[11px] text-white leading-relaxed italic">
                       {selectedSubData.average < 10 
                         ? "المادة حالياً تضغط على نتائج المؤسسة للأسفل. هناك خلل في معالجة المادة الأساسية يتطلب تدخلات بيداغوجية هيكلية عاجلة." 
                         : "المادة الآن في 'منطقة الجذب'. هي ترفع معدلات المؤسسة، ويجب استغلالها كنقطة انطلاق لتحسين المواد المرتبطة بها."}
                     </p>
                  </div>

                  <div className="space-y-1">
                     <p className="text-[10px] text-white font-bold opacity-50">خلاصة فنية:</p>
                     <p className="text-[11px] text-[#888] leading-tight pr-4 border-r border-[#D4AF37]/30">
                       {(() => {
                         const avg = institutionalComparison?.groupAvg || 0;
                         if (avg < 8) return "أولوية قصوى: الفوج يحتاج لدروس دعم قاعدية. التلاميذ يفتقرون للأساسيات الضرورية لاستيعاب المنهاج.";
                         if (avg < 10) return "مرحلة الترميم: هناك بوادر فهم لكنها مشتتة. ركز على 'الوضعية المشكلة' لربط الدروس ببعضها.";
                         if (avg < 13) return "مرحلة التثبيت: أداء مستقر. ركز على تقنيات 'الإجابة النموذجية' لرفع العلامات نحو الامتياز.";
                         return "مرحلة الامتياز: الفوج مؤهل لتحقيق نتائج باهرة. ارفع سقف الصعوبة واعمل على الجوانب الدقيقة جداً في المادة.";
                       })()}
                     </p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* Recommendation Modal */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setModalContent(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-[#222] p-8 shadow-2xl overflow-hidden"
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                modalContent.type === 'success' ? 'bg-blue-500' : modalContent.type === 'warning' ? 'bg-orange-500' : 'bg-[#D4AF37]'
              )} />
              
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-serif italic text-white">{modalContent.title}</h3>
                <button onClick={() => setModalContent(null)} className="text-[#444] hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-8">
                {modalContent.content}
              </div>

              <button 
                onClick={() => setModalContent(null)}
                className="w-full py-4 border border-[#222] text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                إغلاق النافذة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
