import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StatCard } from '../ui/StatCards';
import { Prediction, AnalyticsStats } from '../../types';
import { cn } from '../../lib/utils';

export function EarlyWarningSystem({ stats }: { stats: AnalyticsStats }) {
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'RISK' | 'CRITICAL'>('ALL');

  const filteredPredictions = stats.predictions.filter((p: Prediction) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-[#1A1A1A] pb-10 mb-12 gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-white italic tracking-tight">نظام الإنذار المبكر (EWS)</h2>
          <p className="text-[#888] mt-2 font-sans text-sm tracking-wide">التنبؤ العلمي المسبق لنتائج شهادة التعليم المتوسط</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-[#111] p-1 border border-[#222] w-full lg:w-auto">
           {['ALL', 'SUCCESS', 'RISK', 'CRITICAL'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "flex-1 lg:flex-none px-3 sm:px-6 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-[#D4AF37] text-black" : "text-[#444] hover:text-[#888]"
                )}
              >
                {f === 'ALL' ? 'الكل' : f === 'SUCCESS' ? 'المتوقع نجاحهم' : f === 'RISK' ? 'منطقة الخطر' : 'حالات حرجة'}
              </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <StatCard label="نسبة النجاح المتوقعة" value={`${stats.successRate.toFixed(1)}%`} subValue="معدل >= 10" />
            <div className="bg-[#111] p-8 border border-[#222] space-y-6">
               <h4 className="font-serif italic text-white text-lg border-b border-[#222] pb-2">التوقعات حسب المادة</h4>
               <div className="space-y-4 h-[400px] overflow-y-auto custom-scrollbar pr-2 text-right">
                  {stats.subjectPredictions.sort((a:any, b:any) => b.predictedSuccessRate - a.predictedSuccessRate).map((sub:any) => (
                    <div key={sub.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#888] font-serif">{sub.name}</span>
                        <span className="text-[#D4AF37] font-mono">{sub.predictedSuccessRate.toFixed(0)}%</span>
                      </div>
                      <div className="h-[2px] bg-[#222] overflow-hidden">
                        <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${sub.predictedSuccessRate}%` }} />
                      </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-3">
            <div className="bg-[#161616] border border-[#2A2A2A] shadow-2xl overflow-hidden">
              <div className="px-8 py-4 border-b border-[#2A2A2A] bg-[#1a1a1a] flex justify-between items-center">
                 <h3 className="font-serif italic text-[#D4AF37] text-xl">مصفوفة التوقعات الفردية</h3>
                 <span className="text-[10px] text-[#444] font-mono">العدد المستهدف: {filteredPredictions.length}</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar overflow-x-auto">
                <table className="w-full text-right sophisticated-table min-w-[800px]">
                  <thead>
                    <tr className="text-[#D4AF37] text-[10px] sticky top-0 bg-[#0A0A0A] z-10">
                      <th className="px-6 py-4">التلميذ</th>
                      <th className="px-6 py-4">الفوج</th>
                      <th className="px-6 py-4 text-center">المعدل المتوقع</th>
                      <th className="px-6 py-4">عوامل الخطر / الملاحظات</th>
                      <th className="px-6 py-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPredictions.map((p:Prediction) => (
                      <tr key={p.studentId} className="hover:bg-white/5 transition-colors border-b border-[#222]">
                        <td className="px-6 py-4 font-serif text-lg">{p.name}</td>
                        <td className="px-6 py-4 text-[#888] text-sm font-sans">{p.groupName}</td>
                        <td className="px-6 py-4 text-center">
                           <span className={cn(
                             "text-xl font-mono",
                             p.predictedAverage >= 10 ? "text-green-500" : p.predictedAverage >= 9 ? "text-yellow-500" : "text-red-500"
                           )}>
                             {p.predictedAverage.toFixed(2)}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-wrap gap-2">
                             {p.riskFactors.length > 0 ? (
                               p.riskFactors.map((rf, idx) => (
                                 <span key={idx} className="text-[9px] bg-red-950/20 text-red-500 border border-red-900/30 px-2 py-0.5 rounded-none font-sans">
                                   {rf}
                                 </span>
                               ))
                             ) : (
                               <span className="text-[9px] text-[#444] font-mono italic">لا توجد مخاطر حرجة</span>
                             )}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className={cn(
                             "inline-flex items-center gap-2 px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-widest border",
                             p.status === 'SUCCESS' ? "border-green-900 text-green-500 bg-green-950/20" :
                             p.status === 'RISK' ? "border-yellow-900 text-yellow-500 bg-yellow-950/20" :
                             "border-red-900 text-red-500 bg-red-950/20"
                           )}>
                             {p.status === 'SUCCESS' ? 'متوقع نجاحه' : p.status === 'RISK' ? 'مهدد بالرسوب' : 'حالة حرجة جداً'}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
