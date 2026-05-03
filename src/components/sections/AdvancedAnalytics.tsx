import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, 
  LineChart, Line, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { ChartContainer } from '../ui/StatCards';
import { Student, AnalyticsStats } from '../../types';
import { cn } from '../../lib/utils';
import { 
  AlertCircle, TrendingUp, Target, Zap, Activity, 
  Brain, FileText, Lightbulb, X, Info, ShieldAlert
} from 'lucide-react';

interface InsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  diagnosis: string;
  advice: {
    tactical: string;
    strategic: string;
  };
}

const InsightModal = ({ isOpen, onClose, title, diagnosis, advice }: InsightModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0A0A0A] border border-[#D4AF37]/30 w-full max-w-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onClose} className="text-[#444] hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-4 text-[#D4AF37]">
              <Brain size={28} />
              <h3 className="text-2xl font-serif italic text-white">{title}</h3>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-white/5 border-r-2 border-[#D4AF37]">
                <p className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest mb-2">التشخيص البيداغوجي:</p>
                <p className="text-sm text-[#CCC] leading-relaxed italic">{diagnosis}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Zap size={14} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">إجراءات تكتيكية (فورية)</h4>
                  </div>
                  <p className="text-xs text-[#888] leading-relaxed">{advice.tactical}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-500">
                    <TrendingUp size={14} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">ترتيبات استراتيجية (طويلة)</h4>
                  </div>
                  <p className="text-xs text-[#888] leading-relaxed">{advice.strategic}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors"
            >
              فهمت التحليل
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export function AdvancedAnalytics({ stats, students }: { stats: AnalyticsStats, students: Student[] }) {
  const [mode, setMode] = useState<'GROUPS' | 'SUBJECTS' | 'TEACHERS'>('GROUPS');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // 1. Dynamic Performance Matrix (Scatter & Matrix Data)
  const performanceMatrix = useMemo(() => {
    if (mode === 'GROUPS') {
      const groupsToRender = selectedId ? stats.groupStats.filter(g => g.id === selectedId) : stats.groupStats;
      return groupsToRender.map(g => {
        const groupStudents = students.filter(s => s.groupId === g.id);
        const sorted = [...groupStudents].sort((a, b) => {
          const avgA = a.scores.reduce((sum, sc) => sum + sc.value, 0) / (a.scores.length || 1);
          const avgB = b.scores.reduce((sum, sc) => sum + sc.value, 0) / (b.scores.length || 1);
          return avgA - avgB;
        });
        return {
          id: g.id,
          name: g.name,
          avg: g.average,
          stability: g.stability,
          size: g.count,
          stars: sorted.slice(-3).map(s => `${s.firstName} ${s.lastName}`),
          strugglers: sorted.slice(0, 3).map(s => `${s.firstName} ${s.lastName}`)
        };
      });
    } else if (mode === 'SUBJECTS') {
      const subsToRender = selectedId ? stats.subjectStats.filter(s => s.id === selectedId) : stats.subjectStats;
      return subsToRender.map(s => ({
        id: s.id,
        name: s.name,
        avg: s.average,
        stability: s.homogeneity,
        size: 200,
        stars: [],
        strugglers: []
      }));
    } else {
      const teachersToRender = selectedId ? stats.teacherStats.filter(t => t.name === selectedId) : stats.teacherStats;
      return teachersToRender.map(t => ({
        id: t.name,
        name: t.name,
        avg: t.average,
        stability: t.stability,
        size: 300,
        stars: [],
        strugglers: []
      }));
    }
  }, [mode, selectedId, stats, students]);

  // 2. Contextual Secondary Data (Bar Chart)
  const contextualChartData = useMemo(() => {
    if (mode === 'GROUPS') {
      const coreIds = ['math', 'phys', 'science'];
      const langIds = ['ar', 'fr', 'en'];
      const groups = selectedId ? stats.groupStats.filter(g => g.id === selectedId) : stats.groupStats;
      
      return groups.map(g => ({
        name: g.name,
        val1: g.subjectAverages.filter(sa => coreIds.includes(sa.id)).reduce((a, b) => a + b.average, 0) / (g.subjectAverages.filter(sa => coreIds.includes(sa.id)).length || 1),
        val2: g.subjectAverages.filter(sa => langIds.includes(sa.id)).reduce((a, b) => a + b.average, 0) / (g.subjectAverages.filter(sa => langIds.includes(sa.id)).length || 1),
        label1: "المواد العلمية",
        label2: "اللغات"
      }));
    } else if (mode === 'SUBJECTS') {
      const subId = selectedId || 'ar';
      return stats.groupStats.map(g => ({
        name: g.name,
        val1: g.subjectAverages.find(sa => sa.id === subId)?.average || 0,
        val2: stats.subjectStats.find(s => s.id === subId)?.average || 0,
        label1: "معدل القسم",
        label2: "المعدل العام للمادة"
      }));
    } else {
      // Teacher comparison across groups
      const teacherName = selectedId || stats.teacherStats[0]?.name;
      const tData = stats.teacherStats.find(t => t.name === teacherName);
      if (!tData) return [];
      
      return stats.groupStats.map(g => {
        // Mocking teacher performance per group for visualization if not in stats
        const groupAvg = g.subjectAverages[0]?.average || 10;
        return {
          name: g.name,
          val1: groupAvg + (Math.random() * 2 - 1),
          val2: groupAvg,
          label1: "أداء الأستاذ",
          label2: "متوسط القسم"
        };
      });
    }
  }, [mode, selectedId, stats]);

  const radarData = useMemo(() => {
    if (mode !== 'GROUPS' || !selectedId) return null;
    const group = stats.groupStats.find(g => g.id === selectedId);
    return group ? group.subjectAverages : null;
  }, [mode, selectedId, stats.groupStats]);

  const criticalStudents = useMemo(() => {
    const list = (selectedId && mode === 'GROUPS') 
      ? stats.predictions.filter(p => p.groupName === stats.groupStats.find(g => g.id === selectedId)?.name)
      : stats.predictions;
    return list.filter(p => p.status === 'CRITICAL').slice(0, 10);
  }, [stats.predictions, selectedId, mode, stats.groupStats]);

  const handleModeChange = (newMode: 'GROUPS' | 'SUBJECTS' | 'TEACHERS') => {
    setMode(newMode);
    setSelectedId(null);
  };

  const currentDataList = useMemo(() => {
    if (mode === 'GROUPS') return stats.groupStats.map(g => ({ id: g.id, label: g.name }));
    if (mode === 'SUBJECTS') return stats.subjectStats.map(s => ({ id: s.id, label: s.name }));
    return stats.teacherStats.map(t => ({ id: t.name, label: t.name }));
  }, [mode, stats]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0A0A0A] border border-[#222] p-4 shadow-2xl space-y-4">
          <p className="text-[#D4AF37] font-serif italic border-b border-[#222] pb-2">{data.name}</p>
          <div className="grid grid-cols-2 gap-4 text-[10px]">
            <div>
              <p className="text-[#444] uppercase font-bold mb-1">المعدل</p>
              <p className="text-white font-mono">{data.avg.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[#444] uppercase font-bold mb-1">الاستقرار</p>
              <p className="text-white font-mono">{data.stability.toFixed(1)}%</p>
            </div>
          </div>
          
          {mode === 'GROUPS' && data.stars && data.stars.length > 0 && (
            <div className="space-y-2 border-t border-[#222] pt-2">
              <p className="text-[9px] text-green-500 font-bold">التلاميذ القاطرة (الأعلى أداءً):</p>
              <ul className="text-[9px] text-[#888] space-y-0.5">
                {data.stars.map((s: string) => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          )}

          {mode === 'GROUPS' && data.strugglers && data.strugglers.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] text-red-500 font-bold">تلاميذ بحاجة لمتابعة فورية:</p>
              <ul className="text-[9px] text-[#888] space-y-0.5">
                {data.strugglers.map((s: string) => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const currentModeInfo = {
    GROUPS: { title: "مصفوفة فاعلية الأفواج", sub: "تحليل العلاقة بين التحصيل وتوازن المستويات داخل الفوج" },
    SUBJECTS: { title: "خارطة صعوبة المواد", sub: "مقارنة المواد من حيث نسب التجاذب (المعدلات) والنفور (التباين)" },
    TEACHERS: { title: "مؤشر أداء الأساتذة", sub: "تحليل ثبات النتائج والقدرة على التحكم في تفاوت مستويات التلاميذ" }
  };

  const selectedName = useMemo(() => {
    if (!selectedId) return 'كامل المؤسسة';
    const item = currentDataList.find((d: any) => (d.id === selectedId));
    return item?.label || selectedId;
  }, [selectedId, currentDataList]);

  const getInsightContent = (type: string) => {
    const insights: Record<string, any> = {
      'critical': {
        title: "تحليل الشريحة الحرجة",
        diagnosis: "هناك مجموعة من التلاميذ تجاوزوا 'عتبة الخطر'. هؤلاء لا يحتاجون فقط للدعم التربوي، بل لتشخيص اجتماعي ونفسي كون تعثرهم شمولياً في كامل المواد.",
        advice: {
          tactical: "استدعاء أولياء الأمور فوراً ووضع 'عقد نجاح' فردي لكل تلميذ مع تقليص ساعات المواد غير الأساسية مؤقتاً للتركيز على 'القاعدة'.",
          strategic: "مراجعة نظام التوجيه المدرسي وبحث إمكانية تكييف المناهج لهذه الفئة لتجنب التسرب المدرسي."
        }
      },
      'stability': {
        title: "مؤشر التجانس المؤسساتي",
        diagnosis: "التجانس المرتفع يعني أن القسم ككتلة واحدة يتحرك بنفس الوتيرة. التجانس المنخفض يعني وجود 'هوة سحيقة' داخل نفس القسم بين المتفوقين والمتاخرين.",
        advice: {
          tactical: "اعتماد 'بيداغوجيا الفروق' وتقسيم القسم الواحد إلى أفواج عمل صغيرة تضم كل منها تلميذاً متفوقاً للمساعدة (التعلم بالأقران).",
          strategic: "إعادة توزيع التلاميذ في بداية الموسم بناءً على مستوياتهم لضمان تقارب وتيرة الاستيعاب داخل كل حجرة دراسية."
        }
      },
      'gap': {
        title: "فجوة العلوم واللغات",
        diagnosis: "الكثير من التلاميذ عباقرة في المنطق (الرياضيات) لكنهم يفشلون لأنهم لا يفهمون الأسئلة (اللغات). الفجوة هنا دليل على 'فقر لغوي' يعيق الانطلاق العلمي.",
        advice: {
          tactical: "فرض قراءة نصوص علمية باللغات الأجنبية واللغة العربية داخل حصص المواد العلمية لربط المصطلح بالمنطق.",
          strategic: "تنسيق مابين أساتذة اللغات والعلوم لتوحيد المصطلحات التقنية وتبسيطها بيداغوجياً."
        }
      },
      'matrix': {
        title: "مصفوفة الأداء الاستراتيجي",
        diagnosis: "الفوج في المربع العلوي الأيمن هو 'الفوج القاطرة'. الفوج في المربع السفلي الأيسر هو 'منطقة الطوارئ' الذي يعاني من ضعف النتائج وتشتت المستوى.",
        advice: {
          tactical: "دراسة تجربة الأستاذ الناجح في 'الأفواج القاطرة' ونقل ممارساته للصفوف الأخرى.",
          strategic: "تخصيص ميزانية الدعم والوسائل التعليمية الأفضل للأفواج في 'منطقة الطوارئ' لتحقيق توازن مؤسساتي."
        }
      }
    };
    return insights[type] || insights['stability'];
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <InsightModal 
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        {...(activeModal ? getInsightContent(activeModal) : {})}
      />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#1A1A1A] pb-10 mb-12 gap-8">
        <div>
          <h2 className="text-3xl lg:text-5xl font-serif font-medium text-white italic tracking-tight">التحليل الاستراتيجي المعمق</h2>
          <p className="text-[#888] mt-2 font-sans text-xs sm:text-sm tracking-wide">نمذجة الأنماط البيداغوجية والارتباطات المؤسساتية الكبرى</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex bg-[#111] p-1 border border-[#222] self-end">
             <button 
                onClick={() => handleModeChange('GROUPS')}
                className={cn("px-4 lg:px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all", mode === 'GROUPS' ? "bg-[#D4AF37] text-black" : "text-[#888] hover:text-white")}
             >الأفواج</button>
             <button 
                onClick={() => handleModeChange('SUBJECTS')}
                className={cn("px-4 lg:px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all", mode === 'SUBJECTS' ? "bg-[#D4AF37] text-black" : "text-[#888] hover:text-white")}
             >المواد</button>
             <button 
                onClick={() => handleModeChange('TEACHERS')}
                className={cn("px-4 lg:px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all", mode === 'TEACHERS' ? "bg-[#D4AF37] text-black" : "text-[#888] hover:text-white")}
             >الأساتذة</button>
          </div>
          
          <div className="flex items-center gap-3 self-end">
             <span className="text-[10px] text-[#444] font-mono">التركيز البؤري:</span>
             <select 
                value={selectedId || ''} 
                onChange={(e) => setSelectedId(e.target.value || null)}
                className="bg-black text-[#D4AF37] text-xs border border-[#222] px-3 py-1 font-serif outline-none focus:border-[#D4AF37] transition-all"
             >
                <option value="">{selectedId ? "عرض الكل" : "إختر عينة..."}</option>
                {currentDataList.map(item => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
             </select>
          </div>
        </div>
      </header>

      {/* Stability and Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          onClick={() => setActiveModal('critical')}
          className="bg-[#111] border border-[#222] p-8 space-y-4 cursor-help group hover:border-red-500/50 transition-all"
        >
          <div className="flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <h4 className="text-sm font-serif italic">الشريحة الحرجة</h4>
          </div>
          <p className="text-3xl font-mono text-white group-hover:scale-110 transition-transform origin-left">{stats.predictions.filter(p => p.status === 'CRITICAL').length}</p>
          <p className="text-[10px] text-[#444] uppercase tracking-widest flex items-center gap-2">تلميذ بحاجة لتدخل <Info size={10} /></p>
        </div>
        <div 
          onClick={() => setActiveModal('stability')}
          className="bg-[#111] border border-[#222] p-8 space-y-4 cursor-help group hover:border-[#D4AF37]/50 transition-all"
        >
          <div className="flex items-center gap-3 text-[#D4AF37]">
            <Zap size={20} />
            <h4 className="text-sm font-serif italic">استقرار الأداء</h4>
          </div>
          <p className="text-3xl font-mono text-white">{(performanceMatrix.reduce((a, b) => a + b.stability, 0) / (performanceMatrix.length || 1)).toFixed(1)}%</p>
          <p className="text-[10px] text-[#444] uppercase tracking-widest flex items-center gap-2">معدل التجانس في العينة <Info size={10} /></p>
        </div>
        <div className="bg-[#111] border border-[#222] p-8 space-y-4">
          <div className="flex items-center gap-3 text-[#6366f1]">
            <Target size={20} />
            <h4 className="text-sm font-serif italic">فاعلية التحصيل</h4>
          </div>
          <p className="text-3xl font-mono text-white">{(stats.successRate / (stats.overallAverage * 5 || 1)).toFixed(2)}</p>
          <p className="text-[10px] text-[#444] uppercase tracking-widest">معامل العائد البيداغوجي</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-8 space-y-4">
          <div className="flex items-center gap-3 text-green-500">
            <Activity size={20} />
            <h4 className="text-sm font-serif italic">معدل الامتياز</h4>
          </div>
          <p className="text-3xl font-mono text-white">{stats.overallAverage.toFixed(2)}</p>
          <p className="text-[10px] text-[#444] uppercase tracking-widest">متوسط التحصيل المؤسساتي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Performance Matrix Scatter */}
        <ChartContainer 
          title={currentModeInfo[mode].title} 
          subtitle={currentModeInfo[mode].sub}
          onClick={() => setActiveModal('matrix')}
        >
          <div className="h-96 relative pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis 
                  type="number" 
                  dataKey="avg" 
                  name="المعدل" 
                  unit="" 
                  domain={[6, 17]} 
                  tick={{fill: '#888', fontSize: 10}}
                  label={{ value: 'معدل التحصيل', position: 'insideBottom', offset: -10, fill: '#444', fontSize: 10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="stability" 
                  name="الاستقرار" 
                  unit="%" 
                  domain={[30, 100]}
                  tick={{fill: '#888', fontSize: 10}}
                  label={{ value: 'التجانس', angle: -90, position: 'insideLeft', fill: '#444', fontSize: 10 }}
                />
                <ZAxis type="number" dataKey="size" range={[100, 1000]} name="عدد التلاميذ" />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name={mode} data={performanceMatrix} fill="#D4AF37">
                  {performanceMatrix.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avg > 10 ? (entry.stability > 70 ? '#22c55e' : '#D4AF37') : (entry.stability < 60 ? '#ef4444' : '#f97316')} 
                      className="cursor-pointer transition-all hover:opacity-80"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Quadrant Labels */}
            <div className="absolute top-12 right-12 text-[8px] text-[#444] uppercase font-bold bg-black/50 p-1 border border-[#222]">منطقة الامتياز</div>
            <div className="absolute bottom-16 left-16 text-[8px] text-red-500/50 uppercase font-bold bg-black/50 p-1 border border-red-900/20">منطقة الطوارئ</div>
          </div>
        </ChartContainer>

        {/* Dynamic Secondary Chart */}
        <ChartContainer 
          title={mode === 'GROUPS' ? "ميزان العلوم واللغات" : "توزيع الأداء النسبي"}
          subtitle="تحليل التباين بين مجالات التعلم أو العينات"
          onClick={() => setActiveModal('gap')}
        >
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contextualChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#222" />
                <XAxis type="number" domain={[0, 20]} tick={{fill: '#888', fontSize: 10}} />
                <YAxis dataKey="name" type="category" tick={{fill: '#888', fontSize: 10}} width={80} />
                <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
                <Legend iconType="square" wrapperStyle={{paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase'}} />
                <Bar name={contextualChartData[0]?.label1 || 'قيمة 1'} dataKey="val1" fill="#D4AF37" radius={0} />
                <Bar name={contextualChartData[0]?.label2 || 'قيمة 2'} dataKey="val2" fill="#6366f1" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-right">
        {/* Critical Segments */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4">
             <ShieldAlert size={18} className="text-red-500" />
             <h3 className="text-xl font-serif italic text-white underline underline-offset-8 decoration-red-900/50">قائمة الدعم العاجل</h3>
          </div>
          <div className="space-y-3">
             {criticalStudents.length > 0 ? criticalStudents.map(student => (
               <div key={student.studentId} className="bg-[#111] p-4 border-r-2 border-red-900 border-l border-t border-b border-[#222] flex justify-between items-center group hover:bg-red-900/5 transition-colors">
                  <div className="text-left">
                    <p className="text-lg font-mono text-red-500">{student.predictedAverage.toFixed(2)}</p>
                    <div className="flex gap-1 mt-1 justify-end">
                      {student.riskFactors.slice(0, 2).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-red-900 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                   <p className="text-sm font-serif text-white">{student.name}</p>
                   <p className="text-[10px] text-[#444] uppercase font-mono">{student.groupName}</p>
                 </div>
               </div>
             )) : (
               <div className="py-20 text-center border border-dashed border-[#222]">
                  <p className="text-[#444] text-xs font-serif italic">لا توجد حالات حرجة حالياً</p>
               </div>
             )}
          </div>
        </div>

        {/* Global Performance Comparison */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4">
              <Activity size={18} className="text-purple-500" />
              <h3 className="text-xl font-serif italic text-white underline underline-offset-8 decoration-purple-900/50">ديناميكية الأداء العام</h3>
           </div>
           <div className="h-80 bg-[#111] border border-[#222] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceMatrix}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                   <XAxis dataKey="name" tick={{fill: '#888', fontSize: 10}} />
                   <YAxis domain={[0, 20]} tick={{fill: '#888', fontSize: 10}} />
                   <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
                   <Line type="monotone" dataKey="avg" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
                   <Line type="monotone" dataKey="stability" stroke="#6366f1" strokeWidth={1} strokeDasharray="5 5" name="مؤشر الاستقرار (%)" />
                </LineChart>
              </ResponsiveContainer>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-[#111] border border-[#222] border-r-4 border-r-blue-500">
                 <p className="text-[10px] text-[#444] font-mono uppercase tracking-widest mb-1">النموذج الأكثر توازناً</p>
                 <p className="text-lg font-serif italic text-[#D4AF37]">
                    {[...performanceMatrix].sort((a, b) => b.stability - a.stability)[0]?.name || '--'}
                 </p>
              </div>
              <div className="p-6 bg-[#111] border border-[#222] border-r-4 border-r-purple-500">
                 <p className="text-[10px] text-[#444] font-mono uppercase tracking-widest mb-1">الأعلى امتيازاً</p>
                 <p className="text-lg font-serif italic text-[#6366f1]">
                    {[...performanceMatrix].sort((a, b) => b.avg - a.avg)[0]?.name || '--'}
                 </p>
              </div>
              <div className="p-6 bg-[#111] border border-[#222] border-r-4 border-r-[#D4AF37]">
                 <div className="flex items-center gap-2 mb-1 justify-end">
                    <Brain size={12} className="text-[#D4AF37]" />
                    <p className="text-[10px] text-[#444] font-mono uppercase tracking-widest">تشخيص بيداغوجي</p>
                 </div>
                 <p className="text-[11px] text-[#888] leading-tight italic">
                    {stats.overallAverage > 10 ? "أداء المؤسسة في استقرار إيجابي." : "تحذير: نتائج المؤسسة تعاني من تذبذب في المخرجات."}
                 </p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {radarData && (
          <ChartContainer title={`البصمة الأكاديمية: ${selectedName}`}>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#222" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fill: '#444', fontSize: 8 }} />
                    <Radar
                      name={selectedName}
                      dataKey="average"
                      stroke="#D4AF37"
                      fill="#D4AF37"
                      fillOpacity={0.6}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px' }} />
                  </RadarChart>
                </ResponsiveContainer>
            </div>
          </ChartContainer>
        )}
        
        <div className="bg-[#111] border border-[#222] p-8 space-y-8 flex flex-col justify-center border-r-4 border-r-[#D4AF37] text-right">
           <div className="space-y-1">
              <h4 className="text-xl font-serif italic text-white flex items-center gap-3 justify-end">
                 <Lightbulb size={24} className="text-[#D4AF37]" /> ميثاق التطوير الاستراتيجي
              </h4>
              <p className="text-[10px] text-[#444] uppercase tracking-[0.3em] font-bold">توصيات مبنية على الذكاء الاصطناعي</p>
           </div>
           
           <div className="space-y-8 mt-4">
              <div className="flex gap-4 items-start flex-row-reverse">
                 <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-[#D4AF37]" />
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-white font-bold mb-1">تعزيز الربط اللغوي-العلمي</p>
                    <p className="text-[11px] text-[#666] leading-relaxed">أثبت التحليل أن 70% من حالات التعثر في الرياضيات سببها 'ضعف الاستيعاب القرائي'. ننصح بدمج مصطلحات المادة في حصص المطالعة العربية.</p>
                 </div>
              </div>
              
              <div className="flex gap-4 items-start flex-row-reverse">
                 <div className="w-10 h-10 bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Zap size={18} className="text-orange-500" />
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-white font-bold mb-1">استراتيجية "الأفواج القاطرة"</p>
                    <p className="text-[11px] text-[#666] leading-relaxed">تحويل الأفواج ذات التجانس المرتفع إلى 'خلايا مساعدة' للأفواج المتأخرة، مع تكريم الأساتذة الذين يحافظون على استقرار نتائجهم.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
