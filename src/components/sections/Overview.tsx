import React from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { StatCard, ChartContainer } from '../ui/StatCards';
import { AnalyticsStats } from '../../types';
import { Plus, Sparkles, Settings } from 'lucide-react';

const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#10b981'];

export function Overview({ stats, onNavigateToGroups, onSimulate, onNavigateToSettings, institutionName }: { 
  stats: AnalyticsStats, 
  onNavigateToGroups: () => void,
  onSimulate: () => void,
  onNavigateToSettings: () => void,
  institutionName: string
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="flex justify-between items-end border-b border-[#1A1A1A] pb-10">
        <div>
          <h2 className="text-5xl font-serif font-medium text-white italic tracking-tight">{institutionName}</h2>
          <p className="text-[#888] mt-2 font-sans text-sm tracking-wide">لوحة القيادة الإحصائية - نظام التحليل التنبؤي</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onNavigateToSettings}
            className="px-6 py-3 bg-white/5 border border-white/10 text-[#888] text-[10px] uppercase font-bold tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
          >
            <Settings size={14} /> الإعدادات
          </button>
          <button 
            onClick={onSimulate}
            className="px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase font-bold tracking-widest hover:bg-[#D4AF37]/20 transition-all flex items-center gap-2"
          >
            <Sparkles size={14} /> محاكاة بيانات AI
          </button>
          <button 
            onClick={onNavigateToGroups}
            className="px-6 py-3 bg-[#D4AF37] text-black text-[10px] uppercase font-bold tracking-widest hover:bg-white transition-all flex items-center gap-2"
          >
            <Plus size={14} /> إدخال بيانات جديدة
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="إجمالي التلاميذ" value={stats.totalStudents.toString()} subValue="طالب مسجل" />
        <StatCard label="المعدل العام" value={stats.overallAverage.toFixed(2)} subValue="/ 20" />
        <StatCard label="نسبة النجاح" value={`${stats.successRate.toFixed(1)}%`} subValue="معدل >= 10" trend={stats.successRate >= 50 ? 'up' : 'down'} />
        <StatCard label="الأفواج التربوية" value={stats.groupStats.length.toString()} subValue="فوج فعال" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartContainer title="توزيع نتائج المؤسسة حسب المواد">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                  <XAxis dataKey="name" tick={{fill: '#888', fontSize: 10}} />
                  <YAxis domain={[0, 20]} tick={{fill: '#888', fontSize: 10}} />
                  <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
                  <Bar dataKey="average" fill="#D4AF37" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        <div className="lg:col-span-1">
          <ChartContainer title="الشرائح التحصيلية">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.segments} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {stats.segments.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] overflow-hidden">
        <div className="bg-[#1a1a1a] px-8 py-4 border-b border-[#222]">
           <h3 className="text-xl font-serif italic text-white">ترتيب الأفواج حسب الأداء</h3>
        </div>
        <table className="w-full text-right">
          <thead>
            <tr className="text-[#D4AF37] text-[10px] uppercase tracking-widest border-b border-[#222]">
              <th className="px-8 py-4">الفوج التربوي</th>
              <th className="px-8 py-4">تعداد التلاميذ</th>
              <th className="px-8 py-4">المعدل العام</th>
              <th className="px-8 py-4">نسبة النجاح</th>
            </tr>
          </thead>
          <tbody>
            {stats.groupStats.sort((a, b) => b.average - a.average).map((g) => (
              <tr key={g.id} className="border-b border-[#1A1A1A] hover:bg-white/5 transition-colors">
                <td className="px-8 py-4 font-serif text-lg text-white">{g.name}</td>
                <td className="px-8 py-4 font-mono text-[#888]">{g.count}</td>
                <td className="px-8 py-4 font-mono text-[#D4AF37] text-xl">{g.average.toFixed(2)}</td>
                <td className="px-8 py-4">
                   <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-[#222] overflow-hidden">
                         <div className="h-full bg-[#6366f1] transition-all" style={{ width: `${g.successRate}%` }} />
                      </div>
                      <span className="text-xs font-mono text-[#6366f1] w-12">{g.successRate.toFixed(1)}%</span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
