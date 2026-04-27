import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsStats } from '../../types';

export function CorrelationEngine({ stats }: { stats: AnalyticsStats }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <header className="flex justify-between items-end border-b border-[#1A1A1A] pb-10 mb-12">
        <div>
          <h2 className="text-5xl font-serif font-medium text-white italic tracking-tight">محرك الارتباط البيداغوجي (Correlation)</h2>
          <p className="text-[#888] mt-2 font-sans text-sm tracking-wide">تحليل العلاقة بين المواد المتداخلة لإيجاد الخلل المنهجي</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <CorrelationCard 
            title="الرياضيات vs العلوم الفيزيائية" 
            data={stats.correlations.mathPhys} 
            description="إذا لاحظت تباعداً كبيراً، فالمشكلة تكمن في صياغة القوانين الفيزيائية وتطبيقها بيداغوجياً وليس في القدرة الحسابية."
            color1="#D4AF37"
            color2="#6366f1"
         />
         <CorrelationCard 
            title="اللغة العربية vs التاريخ والجغرافيا" 
            data={stats.correlations.arHis} 
            description="ارتباط وثيق بين القدرة اللغوية والقدرة على تحليل وحفظ المفاهيم الاجتماعية والكرونولوجية."
            color1="#D4AF37"
            color2="#ec4899"
         />
         <div className="lg:col-span-2">
            <CorrelationCard 
              title="اللغات الأجنبية (الفرنسية vs الانجليزية)" 
              data={stats.correlations.frEn} 
              description="يقيس التوفر اللغوي لدى التلاميذ والتوازن بين اللغات الأجنبية المختارة في المنظومة التربوية."
              color1="#a855f7"
              color2="#0ea5e9"
            />
         </div>
      </div>
    </motion.div>
  );
}

function CorrelationCard({ title, data, description, color1, color2 }: { title: string, data: any[], description: string, color1: string, color2: string }) {
  return (
    <div className="bg-[#111] border border-[#222] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-2 h-full bg-[#D4AF37]/5 group-hover:bg-[#D4AF37]/20 transition-all" />
      <div className="space-y-2">
        <h3 className="text-2xl font-serif italic text-white">{title}</h3>
        <p className="text-xs text-[#888] font-sans leading-relaxed italic">{description}</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
            <XAxis dataKey="groupName" tick={{fill: '#888', fontSize: 10}} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 20]} tick={{fill: '#888', fontSize: 10}} />
            <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '10px'}} />
            <Bar dataKey="sub1" name="المادة الأولى" fill={color1} radius={0} />
            <Bar dataKey="sub2" name="المادة الثانية" fill={color2} radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
