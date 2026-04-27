import React from 'react';
import { motion } from 'motion/react';
import { StatCard, ChartContainer } from '../ui/StatCards';
import { AnalyticsStats } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SubjectAnalytics({ stats }: { stats: AnalyticsStats }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="border-b border-[#1A1A1A] pb-10">
        <h2 className="text-5xl font-serif font-medium text-white italic tracking-tight">تحليل المواد بالتفصيل</h2>
        <p className="text-[#888] mt-2 font-sans text-sm tracking-wide">النتائج النوعية والكمية لكل مادة تعليمية على حدة</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.subjectStats.map((sub: any) => (
          <div key={sub.id} className="bg-[#111] border border-[#222] p-8 space-y-6 hover:border-[#D4AF37]/30 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-serif text-white italic">{sub.name}</h3>
                <p className="text-[10px] text-[#444] font-mono uppercase tracking-[0.2em] mt-1">المعامل: {sub.coefficient}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-mono text-[#D4AF37] font-bold">{sub.average.toFixed(2)}</span>
                <p className="text-[10px] text-[#444] font-mono">الوسط الحسابي</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs items-center">
                <span className="text-[#888] font-sans">نسبة النجاح</span>
                <span className="text-[#6366f1] font-mono">{sub.successRate.toFixed(1)}%</span>
              </div>
              <div className="h-[2px] bg-[#222] overflow-hidden">
                <div 
                  className="h-full bg-[#6366f1] transition-all duration-1000" 
                  style={{ width: `${sub.successRate}%` }} 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#1A1A1A] flex justify-between items-center">
               <div className="text-center">
                  <p className="text-[10px] text-[#444] font-mono uppercase">التجانس</p>
                  <p className="text-sm font-bold text-white">{sub.homogeneity.toFixed(1)}%</p>
               </div>
               <div className="h-8 w-[1px] bg-[#1A1A1A]" />
               <div className="text-center">
                  <p className="text-[10px] text-[#444] font-mono uppercase">الاستحقاق</p>
                  <p className="text-sm font-bold text-white">{sub.successRate > 70 ? 'مرتفع' : sub.successRate > 50 ? 'متوسط' : 'متدني'}</p>
               </div>
            </div>

            <div className="h-32 mt-6">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sub.distribution} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                     <Tooltip 
                        cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }} 
                        contentStyle={{ 
                           backgroundColor: '#161616', 
                           border: '1px solid #2A2A2A', 
                           borderRadius: '0px',
                           fontSize: '10px',
                           color: '#FFF'
                        }}
                        itemStyle={{ color: '#D4AF37' }}
                        labelStyle={{ display: 'none' }}
                     />
                     <Bar 
                        dataKey="count" 
                        fill="#D4AF37" 
                        fillOpacity={0.7} 
                        activeBar={{ fillOpacity: 1, stroke: '#D4AF37', strokeWidth: 1 }}
                        radius={[2, 2, 0, 0]} 
                     />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
