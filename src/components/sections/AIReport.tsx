import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { AnalyticsStats } from '../../types';

export function AIReport({ stats }: { stats: AnalyticsStats }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<null | any>(null);

  const performAIAnalysis = () => {
    setAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      const topSubjects = [...stats.subjectStats].sort((a, b) => b.successRate - a.successRate).slice(0, 3);
      const riskSubjects = [...stats.subjectStats].sort((a, b) => a.successRate - b.successRate).slice(0, 3);
      
      setReport({
        overall: stats.successRate > 60 ? 'أداء المؤسسة العام مستقر مع بوادر نجاح قوية.' : 'المؤسسة في حالة استنفار بيداغوجي، النتائج دون المتوسط المطلوب.',
        strengths: topSubjects.map(s => `تفوق ملحوظ في مادة ${s.name} بنسبة نجاح ${s.successRate.toFixed(1)}%.`),
        weaknesses: riskSubjects.map(s => `تحديات كبيرة في مادة ${s.name} (نسبة نجاح ${s.successRate.toFixed(1)}%).`),
        recommendations: [
          'تفعيل حصص الدعم الاستدراكي في المواد العلمية فوراً.',
          'تعديل المخطط السنوي لبناء التعلمات بما يتوافق مع مستوى التلاميذ الحالي.',
          'التركيز على مهارات حل الوضعية الادماجية في اللغة العربية والرياضيات.'
        ],
        predictiveInsight: `من المتوقع تحسن النتائج بنسبة 15% في حال تفعيل المخطط الاستعجالي المقترح.`
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="border-b border-[#1A1A1A] pb-10">
        <h2 className="text-5xl font-serif font-medium text-white italic tracking-tight">التحليل الذكي (AI Insight)</h2>
        <p className="text-[#888] mt-2 font-sans text-sm tracking-wide">توليد تقارير ذكية بناءً على الأنماط السلوكية والتاريخية للنتائج</p>
      </header>

      {!report && !analyzing && (
        <div className="flex flex-col items-center justify-center py-24 space-y-8 bg-[#111] border border-[#222]">
          <div className="w-24 h-24 bg-[#D4AF37]/10 flex items-center justify-center rounded-full">
            <Sparkles size={48} className="text-[#D4AF37]" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-serif italic text-white">هل تريد توليد تقرير تحليلي شامل؟</h3>
            <p className="text-xs text-[#444] font-mono uppercase tracking-widest">سيقوم المحرك بمعالجة {stats.totalStudents} تلميذ و 9 مواد تعليمية</p>
          </div>
          <button 
            onClick={performAIAnalysis}
            className="px-10 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-2xl flex items-center gap-3"
          >
            <Brain size={18} /> بدء التحليل العميق
          </button>
        </div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center py-24 space-y-8">
           <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
           <div className="text-center space-y-2">
             <p className="text-[#D4AF37] font-serif italic text-xl animate-pulse">جاري تحليل الأنماط البيداغوجية...</p>
             <p className="text-[10px] text-[#444] font-mono uppercase tracking-[0.2em]">Processing correlation matrices and performance vectors</p>
           </div>
        </div>
      )}

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-[#111] border border-[#222] p-10 space-y-6">
                <h3 className="text-2xl font-serif italic text-white flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-green-500" /> الملخص التنفيذي
                </h3>
                <p className="text-xl text-[#888] font-serif leading-relaxed italic">{report.overall}</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#111] border border-[#222] p-10 space-y-6">
                   <h4 className="text-lg font-serif italic text-white flex items-center gap-3">
                     <TrendingUp size={20} className="text-[#D4AF37]" /> نقاط القوة
                   </h4>
                   <ul className="space-y-4">
                     {report.strengths.map((s: string, i: number) => (
                       <li key={i} className="text-sm text-[#888] font-sans border-r-2 border-[#D4AF37] pr-4 py-1">{s}</li>
                     ))}
                   </ul>
                </div>
                <div className="bg-[#111] border border-[#222] p-10 space-y-6">
                   <h4 className="text-lg font-serif italic text-white flex items-center gap-3">
                     <AlertTriangle size={20} className="text-red-500" /> نقاط الضعف
                   </h4>
                   <ul className="space-y-4">
                     {report.weaknesses.map((w: string, i: number) => (
                       <li key={i} className="text-sm text-[#888] font-sans border-r-2 border-red-900 pr-4 py-1">{w}</li>
                     ))}
                   </ul>
                </div>
             </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
             <div className="bg-[#D4AF37] p-10 text-black space-y-6 relative overflow-hidden">
                <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-20 rotate-12" />
                <h4 className="text-xl font-serif font-bold italic border-b border-black/20 pb-4">توصيات الخبير</h4>
                <ul className="space-y-4">
                   {report.recommendations.map((r: string, i: number) => (
                     <li key={i} className="text-sm font-bold flex gap-3">
                       <span className="w-1.5 h-1.5 bg-black mt-2 shrink-0" />
                       {r}
                     </li>
                   ))}
                </ul>
             </div>

             <div className="bg-[#111] border border-[#222] p-10 space-y-4">
                <div className="flex items-center gap-3 text-[#444] mb-2">
                   <Info size={16} />
                   <span className="text-[10px] font-mono uppercase tracking-widest">التوقعات الهيكلية</span>
                </div>
                <p className="text-sm text-[#888] italic leading-relaxed">{report.predictiveInsight}</p>
                <button 
                  onClick={() => setReport(null)}
                  className="w-full mt-6 py-3 border border-[#222] text-[10px] uppercase font-bold tracking-widest text-[#444] hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all"
                >
                  إعادة تشغيل التحليل
                </button>
             </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
