import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Prediction, AnalyticsStats } from '../../types';
import { cn } from '../../lib/utils';
import { 
  AlertTriangle, Zap, Target, 
  Brain, ShieldAlert, ArrowUpRight, Search, 
  ChevronRight, Lightbulb, X, Activity
} from 'lucide-react';

interface RiskModalProps {
  student: Prediction | null;
  onClose: () => void;
}

const RiskDiagnosisModal = ({ student, onClose }: RiskModalProps) => {
  if (!student) return null;

  const radarData = [
    { subject: 'المنطق', value: 65 },
    { subject: 'اللغات', value: 45 },
    { subject: 'الحفظ', value: 80 },
    { subject: 'الانضباط', value: 70 },
    { subject: 'التطور', value: 40 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#0A0A0A] border border-[#D4AF37]/20 w-full max-w-4xl overflow-hidden relative"
        >
          <button onClick={onClose} className="absolute top-6 left-6 text-[#444] hover:text-white transition-colors z-20">
            <X size={24} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Visual Analysis */}
            <div className="p-10 bg-[#111] border-l border-[#222]">
              <div className="mb-8">
                <p className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-[0.2em] mb-1 text-right">تحليل البصمة الأكاديمية</p>
                <h3 className="text-3xl font-serif italic text-white text-right">{student.name}</h3>
              </div>

              <div className="h-64 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar
                      name="المستوى"
                      dataKey="value"
                      stroke="#D4AF37"
                      fill="#D4AF37"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-6 text-right">
                <div className="order-2">
                  <p className="text-[10px] text-[#444] uppercase font-bold mb-2">المعدل المتوقع</p>
                  <p className={cn(
                    "text-3xl font-mono",
                    student.predictedAverage >= 10 ? "text-green-500" : "text-red-500"
                  )}>{student.predictedAverage.toFixed(2)}</p>
                </div>
                <div className="order-1">
                  <p className="text-[10px] text-[#444] uppercase font-bold mb-2">مؤشر الاستجابة</p>
                  <p className="text-3xl font-mono text-blue-500">74%</p>
                </div>
              </div>
            </div>

            {/* Diagnosis and Advice */}
            <div className="p-10 space-y-10 text-right">
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-red-500 justify-end">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white">التشخيص البيداغوجي</h4>
                  <ShieldAlert size={18} />
                </div>
                <div className="bg-red-500/5 p-4 border-r-2 border-red-500">
                  <p className="text-xs text-[#CCC] leading-relaxed italic">
                    "يعاني التلميذ من فجوة كبيرة في المواد الأداتية (اللغات) مما يعيق فهمه للوضعيات الإدماجية في المواد العلمية. 
                    تحليله المنطقي سليم لكنه يتعثر في مرحلة صياغة الحل."
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-[#D4AF37] justify-end">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white">خطة التدخل المقترحة</h4>
                  <Lightbulb size={18} />
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0 text-[#D4AF37] text-[10px] font-bold">01</div>
                    <div className="text-right">
                      <p className="text-xs text-white font-bold mb-1">التركيز على المفردات التقنية</p>
                      <p className="text-[11px] text-[#666]">تزويد التلميذ بمعجم مصطلحات علمية مبسط لتقليل حاجز اللغة في الرياضيات والفيزياء.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500 text-[10px] font-bold">02</div>
                    <div className="text-right">
                      <p className="text-xs text-white font-bold mb-1">الدعم بالأقران</p>
                      <p className="text-[11px] text-[#666]">دمجه في فوج عمل مع تلميذ متفوق في اللغات لتحفيزه على التواصل البيداغوجي.</p>
                    </div>
                  </div>
                </div>
              </section>

              <button 
                onClick={onClose}
                className="w-full py-4 mt-8 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4AF37] transition-colors"
              >
                تحديث حالة المتابعة
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export function EarlyWarningSystem({ stats }: { stats: AnalyticsStats }) {
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'RISK' | 'CRITICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Prediction | null>(null);

  const filteredPredictions = useMemo(() => {
    return stats.predictions.filter((p: Prediction) => {
      const matchesFilter = filter === 'ALL' || p.status === filter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.groupName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [stats.predictions, filter, searchQuery]);

  const riskMatrixData = useMemo(() => {
    return filteredPredictions.map(p => ({
      name: p.name,
      avg: p.predictedAverage,
      risk: p.status === 'CRITICAL' ? 85 : p.status === 'RISK' ? 60 : 25,
      id: p.studentId,
      full: p
    }));
  }, [filteredPredictions]);

  const statsBreakdown = useMemo(() => {
    const total = filteredPredictions.length || 1;
    const success = filteredPredictions.filter(p => p.predictedAverage >= 10).length;
    const fail = total - success;
    
    // Subject specific success rates (Mocked based on prediction logic)
    const subjects = [
      { name: 'الرياضيات', rate: 68 },
      { name: 'العلوم', rate: 74 },
      { name: 'اللغة العربية', rate: 89 },
      { name: 'اللغة الفرنسية', rate: 45 },
    ];

    return {
      globalSuccessRate: (success / total) * 100,
      total,
      success,
      fail,
      subjects
    };
  }, [filteredPredictions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload.full;
      return (
        <div className="bg-[#0A0A0A] border border-[#333] p-4 shadow-2xl min-w-[180px] text-right" dir="rtl">
          <p className="text-[#D4AF37] font-serif italic border-b border-[#222] pb-2 mb-2">{data.name}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-auto">
               <span className="text-[10px] text-[#444] uppercase ml-4">المعدل المتوقع:</span>
               <span className={cn("font-mono text-xs", data.predictedAverage >= 10 ? "text-green-500" : "text-red-500")}>
                 {data.predictedAverage.toFixed(2)}
               </span>
            </div>
            <div className="flex justify-between items-center ml-auto">
               <span className="text-[10px] text-[#444] uppercase ml-4">الفوج:</span>
               <span className="text-white text-[10px]">{data.groupName}</span>
            </div>
            <div className="pt-2 border-t border-[#222]">
               <p className="text-[8px] text-[#D4AF37] mb-1">عوامل الخطر:</p>
               <div className="flex flex-wrap gap-1 justify-start">
                  {data.riskFactors.slice(0, 2).map((rf: string, i: number) => (
                    <span key={i} className="text-[7px] bg-white/5 px-1 border border-white/5">{rf}</span>
                  ))}
               </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleExport = (title: string = "خطة الدعم المؤسساتية") => {
    const originalTitle = document.title;
    document.title = `${title} - ${new Date().toLocaleDateString('ar-DZ')}`;
    window.print();
    document.title = originalTitle;
    
    // UI Feedback
    const btn = document.getElementById('export-btn');
    if (btn) {
      btn.innerText = "...جاري التجهيز";
      setTimeout(() => { btn.innerText = "✓ تمت العملية"; }, 1000);
      setTimeout(() => { btn.innerText = "تصدير خطة الدعم المؤسساتية"; }, 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <RiskDiagnosisModal 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-[#1A1A1A] pb-10 mb-12 gap-8">
        <div className="text-right">
           <div className="flex items-center gap-3 text-red-500 mb-2 justify-end">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">نظام التنبؤ الاستباقي</span>
            <Zap size={20} className="animate-pulse" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-serif font-medium text-white italic tracking-tight">رادار الكشف المبكر</h2>
          <p className="text-[#888] mt-2 font-sans text-xs sm:text-sm tracking-wide">نمذجة احتمالات النجاح بناءً على المتغيرات السلوكية والأكاديمية</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full lg:w-auto">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#D4AF37] transition-colors" size={16} />
            <input 
              type="text"
              placeholder="ابحث عن تلميذ أو فوج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0A0A0A] border border-[#222] pr-12 pl-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] w-full lg:w-80 transition-all font-serif text-right"
            />
          </div>
          
          <div className="flex flex-wrap gap-1 bg-[#111] p-1 border border-[#222] flex-row-reverse">
             {[
               { id: 'ALL', label: 'الكل' },
               { id: 'SUCCESS', label: 'المستقرون' },
               { id: 'RISK', label: 'المهددون' },
               { id: 'CRITICAL', label: 'منطقة الطوارئ' }
             ].map((f) => (
                <button 
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={cn(
                    "px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all",
                    filter === f.id ? "bg-[#D4AF37] text-black" : "text-[#444] hover:text-[#888]"
                  )}
                >
                  {f.label}
                </button>
             ))}
          </div>
        </div>
      </header>

      {/* Probability Matrix Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-[#111] border border-[#222] p-10 relative group">
           <div className="flex justify-between items-center mb-10 border-b border-[#1A1A1A] pb-6 flex-row-reverse">
              <div className="text-right">
                <h3 className="text-2xl font-serif italic text-white">مصفوفة احتمالات النجاح</h3>
                <p className="text-[10px] text-[#444] uppercase tracking-widest mt-1">توزيع التلاميذ حسب (المعدل المتوقع vs درجة التعثر)</p>
              </div>
              <Activity size={24} className="text-[#333]" />
           </div>

           <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 60, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    type="number" 
                    dataKey="avg" 
                    name="المعدل" 
                    domain={[5, 18]} 
                    reversed={true}
                    tick={{fill: '#444', fontSize: 10}}
                    label={{ value: 'المعدل المتوقع (تدرج من اليمين)', position: 'insideBottom', offset: -10, fill: '#444', fontSize: 9 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="risk" 
                    name="الخطر" 
                    orientation="right"
                    domain={[0, 100]}
                    tick={{fill: '#444', fontSize: 10}}
                    label={{ value: 'مؤشر الخطر (%)', angle: 90, position: 'insideRight', fill: '#444', offset: 20, fontSize: 9 }}
                  />
                  <ZAxis type="number" range={[100, 400]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter name="تلاميذ" data={riskMatrixData}>
                    {riskMatrixData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.avg >= 10 ? '#22c55e' : entry.avg >= 9 ? '#f97316' : '#ef4444'} 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedStudent(entry.full)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              
              {/* Strategic Layers */}
              <div className="absolute top-[25%] right-[20%] text-[8px] text-[#444] uppercase font-bold tracking-[0.2em] -rotate-12 opacity-30 select-none">منطقة التدخل العاجل</div>
              <div className="absolute bottom-[20%] left-[30%] text-[8px] text-[#444] uppercase font-bold tracking-[0.2em] rotate-12 opacity-30 select-none">مسار الامتياز</div>
           </div>
        </div>

        <div className="lg:col-span-1 space-y-6 text-right print:hidden">
           <div className="bg-[#111] border border-[#222] p-8 border-r-4 border-r-red-600">
              <div className="flex items-center gap-3 text-red-500 mb-4 justify-end">
                 <h4 className="text-sm font-serif italic">حالات تحت المراقبة</h4>
                 <AlertTriangle size={20} />
              </div>
              <p className="text-4xl font-mono text-white mb-2">{filteredPredictions.filter(p => p.status === 'CRITICAL').length}</p>
              <div className="h-1 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                 <div className="h-full bg-red-600" style={{ width: `${(filteredPredictions.filter(p => p.status === 'CRITICAL').length / (filteredPredictions.length || 1)) * 100}%` }} />
              </div>
              <p className="text-[10px] text-[#444] mt-2 uppercase tracking-widest italic">
                {((filteredPredictions.filter(p => p.status === 'CRITICAL').length / (filteredPredictions.length || 1)) * 100).toFixed(1)}% من العينة المحددة
              </p>
           </div>

           <div className="bg-[#111] border border-[#222] p-8 space-y-6">
              <h4 className="font-serif italic text-[#D4AF37] text-lg border-b border-[#222]/50 pb-2">أولويات المعالجة</h4>
              <div className="space-y-4">
                 <div className="p-4 bg-white/5 border border-[#222] flex gap-4 items-center flex-row-reverse">
                    <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center shrink-0">
                       <Brain size={16} className="text-blue-500" />
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-white font-bold">تعزيز الاستيعاب</p>
                       <p className="text-[8px] text-[#888]">{filteredPredictions.filter(p => p.riskFactors.some(f => f.includes('لغة'))).length} تلميذاً بحاجة للغة</p>
                    </div>
                 </div>
                 <div className="p-4 bg-white/5 border border-[#222] flex gap-4 items-center flex-row-reverse">
                    <div className="w-10 h-10 bg-orange-500/10 flex items-center justify-center shrink-0">
                       <Target size={16} className="text-orange-500" />
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-white font-bold">تقوية المنطق</p>
                       <p className="text-[8px] text-[#888]">{filteredPredictions.filter(p => p.riskFactors.some(f => f.includes('منطق') || f.includes('علم'))).length} تلاميذ في خطر رياضي</p>
                    </div>
                 </div>
              </div>
              <button 
                id="export-btn"
                onClick={handleExport}
                className="w-full py-3 bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest border border-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                تصدير خطة الدعم المؤسساتية
              </button>
           </div>
        </div>
      </div>

      {/* Success Analytics Dashboard */}
      <div className="bg-[#0A0A0A] border border-[#222] p-10 space-y-10" dir="rtl">
         <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="text-right w-full lg:w-auto">
               <h3 className="text-2xl font-serif italic text-[#D4AF37]">تقرير عتبات النجاح المتوقعة</h3>
               <p className="text-[10px] text-[#444] uppercase tracking-widest mt-1">تحليل القدرة على تجاوز عتبة 10/20</p>
            </div>
            
            <div className="flex bg-[#111] p-6 border border-[#222] gap-10 flex-1 lg:max-w-xl w-full">
               <div className="text-right">
                  <p className="text-[10px] text-[#444] uppercase font-bold mb-1">المعدل العام</p>
                  <p className="text-3xl font-mono text-white">{statsBreakdown.globalSuccessRate.toFixed(1)}%</p>
               </div>
               <div className="flex-1 space-y-4">
                  {statsBreakdown.subjects.map((s, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[8px] text-[#888] uppercase">
                        <span>{s.name}</span>
                        <span>{s.rate}%</span>
                      </div>
                      <div className="h-0.5 bg-[#1A1A1A] w-full">
                        <div className="h-full bg-[#D4AF37]" style={{ width: `${s.rate}%` }} />
                      </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Expected Success List */}
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-green-500 border-b border-[#1A1A1A] pb-3 justify-start">
                  <Target size={14} />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#888]">تلاميذ المسار الآمن (المتوقع نجاحهم)</h4>
               </div>
               <div className="bg-[#111] border border-[#222] divide-y divide-[#1A1A1A]">
                  {filteredPredictions.filter(p => p.predictedAverage >= 10).slice(0, 5).map(p => (
                    <div key={p.studentId} className="p-4 flex justify-between items-center group hover:bg-white/5 transition-colors">
                       <span className="text-xs text-white font-serif">{p.name}</span>
                       <span className="text-xs font-mono text-green-500">{p.predictedAverage.toFixed(2)}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Expected Failure List */}
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-red-500 border-b border-[#1A1A1A] pb-3 justify-start">
                  <AlertTriangle size={14} />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#888]">تلاميذ في دائرة الخطر (المتوقع رسوبهم)</h4>
               </div>
               <div className="bg-[#111] border border-[#222] divide-y divide-[#1A1A1A]">
                  {filteredPredictions.filter(p => p.predictedAverage < 10).slice(0, 5).map(p => (
                    <div key={p.studentId} className="p-4 flex justify-between items-center group hover:bg-white/5 transition-colors">
                       <span className="text-xs text-white font-serif">{p.name}</span>
                       <span className="text-xs font-mono text-red-500">{p.predictedAverage.toFixed(2)}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Enhanced Prediction List */}
      <div className="space-y-6 text-right" dir="rtl">
         <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4">
            <div className="flex items-center gap-4">
               <ShieldAlert size={24} className="text-[#D4AF37]" />
               <h3 className="text-2xl font-serif italic text-white">قائمة الاستجابة السريعة</h3>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleExport("قائمة الاستجابة السريعة - حسب الفوج")}
                className="px-3 py-1 text-[9px] font-bold text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black transition-all print:hidden"
              >
                تحديث نسخة المنسق (PDF)
              </button>
              <span className="text-[10px] text-[#444] font-mono tracking-widest uppercase">نتائج التصفية: {filteredPredictions.length} حالة</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPredictions.map((p) => (
               <motion.div 
                  layout
                  key={p.studentId}
                  onClick={() => setSelectedStudent(p)}
                  className={cn(
                    "bg-[#111] p-6 border transition-all cursor-pointer group relative overflow-hidden",
                    p.status === 'CRITICAL' ? "border-red-900/30 hover:border-red-500" : 
                    p.status === 'RISK' ? "border-yellow-900/30 hover:border-yellow-500" : 
                    "border-[#222] hover:border-[#D4AF37]"
                  )}
               >
                  <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-100 transition-opacity">
                     <ArrowUpRight size={14} className="text-white" />
                  </div>

                  <div className="flex justify-between items-start mb-6 flex-row-reverse">
                     <div className="text-right">
                        <h4 className="text-lg font-serif text-white mb-1">{p.name}</h4>
                        <p className="text-[10px] text-[#444] uppercase font-mono tracking-widest">{p.groupName}</p>
                     </div>
                     <div className={cn(
                        "text-2xl font-mono",
                        p.predictedAverage >= 10 ? "text-green-500" : p.predictedAverage >= 9 ? "text-yellow-500" : "text-red-500"
                     )}>
                        {p.predictedAverage.toFixed(2)}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex flex-wrap gap-1.5 justify-end">
                        {p.riskFactors.length > 0 ? p.riskFactors.map((rf, idx) => (
                           <span key={idx} className="px-2 py-0.5 bg-black border border-[#222] text-[8px] text-[#888] font-sans">
                              {rf}
                           </span>
                        )) : (
                          <span className="text-[8px] text-green-500/50 font-mono italic">مسار أكاديمي مستقر</span>
                        )}
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-[#222] mt-4 flex-row-reverse">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          p.status === 'SUCCESS' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                          p.status === 'RISK' ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" :
                          "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        )} />
                        <span className="text-[9px] text-[#444] uppercase tracking-widest font-bold group-hover:text-white transition-colors flex items-center gap-2">
                           <ChevronRight size={10} /> توصيات التدخل 
                        </span>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}
