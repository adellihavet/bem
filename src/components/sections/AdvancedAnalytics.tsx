import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, LineChart, Line } from 'recharts';
import { ChartContainer } from '../ui/StatCards';
import { Student, AnalyticsStats } from '../../types';
import { cn } from '../../lib/utils';
import { AlertCircle, TrendingUp, Target, Zap, Activity } from 'lucide-react';

export function AdvancedAnalytics({ stats, students }: { stats: AnalyticsStats, students: Student[] }) {
  const [mode, setMode] = useState<'GROUPS' | 'SUBJECTS' | 'TEACHERS'>('GROUPS');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentData = useMemo(() => {
    if (mode === 'GROUPS') {
      return stats.groupStats.map(g => ({ ...g, displayLabel: g.name }));
    } else if (mode === 'SUBJECTS') {
      return stats.subjectStats.map(s => ({ ...s, displayLabel: s.name }));
    } else {
      return stats.teacherStats.map(t => ({ ...t, displayLabel: t.name, id: t.name }));
    }
  }, [mode, stats]);

  const gapAnalysisData = useMemo(() => {
    const coreIds = ['math', 'phys', 'science'];
    const languageIds = ['ar', 'fr', 'en'];
    
    return stats.groupStats.map(g => {
      const coreAvg = g.subjectAverages.filter(sa => coreIds.includes(sa.id)).reduce((acc, curr) => acc + curr.average, 0) / coreIds.filter(id => g.subjectAverages.find(sa => sa.id === id)).length;
      const langAvg = g.subjectAverages.filter(sa => languageIds.includes(sa.id)).reduce((acc, curr) => acc + curr.average, 0) / languageIds.filter(id => g.subjectAverages.find(sa => sa.id === id)).length;
      return {
        name: g.name,
        core: coreAvg,
        languages: langAvg,
        gap: coreAvg - langAvg
      };
    });
  }, [stats.groupStats]);

  const radarData = useMemo(() => {
    if (mode !== 'GROUPS' || !selectedId) return null;
    const group = stats.groupStats.find(g => g.id === selectedId);
    if (!group) return null;
    return group.subjectAverages;
  }, [mode, selectedId, stats.groupStats]);

  const criticalStudents = useMemo(() => {
    return stats.predictions.filter(p => p.status === 'CRITICAL').slice(0, 10);
  }, [stats.predictions]);

  const handleModeChange = (newMode: 'GROUPS' | 'SUBJECTS' | 'TEACHERS') => {
    setMode(newMode);
    setSelectedId(null);
  };

  const contextualDetails = useMemo(() => {
    let filteredStudents = students;
    
    if (selectedId) {
      if (mode === 'GROUPS') {
        filteredStudents = students.filter(s => s.groupId === selectedId);
      } else if (mode === 'TEACHERS') {
        const teacherName = selectedId;
        const groupsByTeacher = stats.groupStats.filter(g => 
          Object.values(g.teachers || {}).includes(teacherName)
        ).map(g => g.id);
        filteredStudents = students.filter(s => groupsByTeacher.includes(s.groupId));
      }
    }

    const getDetailedAnalysis = (subjectId: string) => {
      const subjectScores = filteredStudents.flatMap(s => s.scores.filter(sc => sc.subjectId === subjectId && sc.subScores));
      if (subjectScores.length === 0) return null;

      const tasks: Record<string, { total: number, count: number }> = {};
      subjectScores.forEach(sc => {
        if (sc.subScores) {
          Object.entries(sc.subScores).forEach(([task, value]) => {
            if (!tasks[task]) tasks[task] = { total: 0, count: 0 };
            tasks[task].total += (value as number);
            tasks[task].count += 1;
          });
        }
      });

      return Object.entries(tasks).map(([name, data]) => ({
        name,
        average: data.total / data.count,
        maxPotential: name.includes('الوضعية الادماجية') ? 8 : 3
      })).sort((a, b) => a.name.localeCompare(b.name));
    };

    return {
      math: getDetailedAnalysis('math'),
      ar: getDetailedAnalysis('ar')
    };
  }, [mode, selectedId, students, stats.groupStats]);

  const selectedName = useMemo(() => {
    if (!selectedId) return 'المؤسسة ككل';
    const item = currentData.find((d: any) => (d.id === selectedId || d.name === selectedId));
    return item?.displayLabel || selectedId;
  }, [selectedId, currentData]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <header className="flex justify-between items-end border-b border-[#1A1A1A] pb-10 mb-12">
        <div>
          <h2 className="text-5xl font-serif font-medium text-white italic tracking-tight">التحليل المعمق (Deep Analysis)</h2>
          <p className="text-[#888] mt-2 font-sans text-sm tracking-wide">دراسة الأنماط البيداغوجية والارتباطات العلمية الدقيقة</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex bg-[#111] p-1 border border-[#222]">
             <button 
                onClick={() => handleModeChange('GROUPS')}
                className={cn("px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all", mode === 'GROUPS' ? "bg-[#D4AF37] text-black" : "text-[#888] hover:text-white")}
             >الأفواج</button>
             <button 
                onClick={() => handleModeChange('SUBJECTS')}
                className={cn("px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all", mode === 'SUBJECTS' ? "bg-[#D4AF37] text-black" : "text-[#888] hover:text-white")}
             >المواد</button>
             <button 
                onClick={() => handleModeChange('TEACHERS')}
                className={cn("px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all", mode === 'TEACHERS' ? "bg-[#D4AF37] text-black" : "text-[#888] hover:text-white")}
             >الأساتذة</button>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="text-[10px] text-[#444] font-mono">التركيز البؤري:</span>
             <select 
                value={selectedId || ''} 
                onChange={(e) => setSelectedId(e.target.value || null)}
                className="bg-black text-[#D4AF37] text-xs border border-[#222] px-3 py-1 font-serif outline-none"
             >
                <option value="">كامل المؤسسة</option>
                {currentData.map((item: any) => (
                  <option key={item.id || item.name} value={item.id || item.name}>{item.displayLabel}</option>
                ))}
             </select>
          </div>
        </div>
      </header>

      {/* Stability and Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-[#111] border border-[#222] p-8 space-y-4">
          <div className="flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <h4 className="text-sm font-serif italic">الشريحة الحرجة</h4>
          </div>
          <p className="text-3xl font-mono text-white">{stats.predictions.filter(p => p.status === 'CRITICAL').length}</p>
          <p className="text-[10px] text-[#444] uppercase tracking-widest">تلميذ بحاجة لتدخل فوري</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-8 space-y-4">
          <div className="flex items-center gap-3 text-[#D4AF37]">
            <Zap size={20} />
            <h4 className="text-sm font-serif italic">استقرار المخرجات</h4>
          </div>
          <p className="text-3xl font-mono text-white">{(stats.subjectStats.reduce((acc, s) => acc + s.homogeneity, 0) / stats.subjectStats.length).toFixed(1)}%</p>
          <p className="text-[10px] text-[#444] uppercase tracking-widest">مؤشر التجانس العام</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-8 space-y-4">
          <div className="flex items-center gap-3 text-[#6366f1]">
            <Target size={20} />
            <h4 className="text-sm font-serif italic">فاعلية النجاح</h4>
          </div>
          <p className="text-3xl font-mono text-white">{(stats.successRate / (stats.overallAverage * 5)).toFixed(2)}</p>
          <p className="text-[10px] text-[#444] uppercase tracking-widest">معامل العائد البيداغوجي</p>
        </div>
        <div className="bg-[#111] border border-[#222] p-8 space-y-4">
          <div className="flex items-center gap-3 text-green-500">
            <Activity size={20} />
            <h4 className="text-sm font-serif italic">المعدل العام</h4>
          </div>
          <p className="text-3xl font-mono text-white">{stats.overallAverage.toFixed(2)}</p>
          <p className="text-[10px] text-[#444] uppercase tracking-widest">متوسط التحصيل المؤسساتي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Radar Analysis */}
        <ChartContainer title={`الهوية الأكاديمية: ${selectedName}`}>
          <div className="h-96">
            {radarData ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 border border-dashed border-[#222]">
                <p className="text-[#444] font-serif italic">اختر فوجاً لعرض الهوية الأكاديمية</p>
              </div>
            )}
          </div>
        </ChartContainer>

        {/* Gap Analysis */}
        <ChartContainer title="تحليل الفجوة: المواد الدقيقة vs اللغات">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapAnalysisData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#222" />
                <XAxis type="number" domain={[0, 20]} tick={{fill: '#888', fontSize: 10}} />
                <YAxis dataKey="name" type="category" tick={{fill: '#888', fontSize: 10}} />
                <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
                <Legend />
                <Bar name="المواد العلمية" dataKey="core" fill="#D4AF37" radius={0} />
                <Bar name="اللغات" dataKey="languages" fill="#6366f1" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Critical Segments */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-serif italic text-white border-b border-[#1A1A1A] pb-4">الشرائح الحرجة (Top 10)</h3>
          <div className="space-y-3">
             {criticalStudents.length > 0 ? criticalStudents.map(student => (
               <div key={student.studentId} className="bg-[#111] p-4 border-r-2 border-red-900 border-l border-t border-b border-[#222] flex justify-between items-center group">
                 <div>
                   <p className="text-sm font-serif text-white">{student.name}</p>
                   <p className="text-[10px] text-[#444] uppercase font-mono">{student.groupName}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-mono text-red-500">{student.predictedAverage.toFixed(2)}</p>
                    <div className="flex gap-1 mt-1">
                      {student.riskFactors.slice(0, 2).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-red-900 rounded-full" />
                      ))}
                    </div>
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
           <h3 className="text-xl font-serif italic text-white border-b border-[#1A1A1A] pb-4">مقارنة أداء النظم المختارة</h3>
           <div className="h-80 bg-[#111] border border-[#222] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                   <XAxis dataKey="displayLabel" tick={{fill: '#888', fontSize: 10}} />
                   <YAxis domain={[0, 20]} tick={{fill: '#888', fontSize: 10}} />
                   <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
                   <Line type="monotone" dataKey="average" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
                   <Line type="monotone" dataKey="stability" stroke="#6366f1" strokeWidth={1} strokeDasharray="5 5" name="مؤشر الاستقرار (%)" />
                </LineChart>
              </ResponsiveContainer>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-6 bg-[#111] border border-[#222]">
                 <p className="text-[10px] text-[#444] font-mono uppercase tracking-widest mb-1">النموذج الأكثر استقراراً</p>
                 <p className="text-lg font-serif italic text-[#D4AF37]">
                    {[...currentData].sort((a, b) => b.stability - a.stability)[0]?.displayLabel || '--'}
                 </p>
              </div>
              <div className="p-6 bg-[#111] border border-[#222]">
                 <p className="text-[10px] text-[#444] font-mono uppercase tracking-widest mb-1">الأعلى تحصيلاً</p>
                 <p className="text-lg font-serif italic text-[#6366f1]">
                    {[...currentData].sort((a, b) => b.average - a.average)[0]?.displayLabel || '--'}
                 </p>
              </div>
              <div className="p-6 bg-[#111] border border-[#222]">
                 <p className="text-[10px] text-[#444] font-mono uppercase tracking-widest mb-1">نسبة التغطية</p>
                 <p className="text-lg font-serif italic text-white">
                    {((stats.totalStudents / 100) * 100).toFixed(0)}%
                 </p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Detailed Task Analysis - reused from original but made more compact */}
         {contextualDetails.math && (
           <ChartContainer title={`تحليل فواعل الرياضيات: ${selectedName}`}>
              <div className="space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contextualDetails.math} margin={{bottom: 40, top: 10}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                      <XAxis dataKey="name" tick={{fill: '#888', fontSize: 9}} angle={-45} textAnchor="end" interval={0} height={60} />
                      <YAxis domain={[0, 8]} tick={{fill: '#888', fontSize: 10}} />
                      <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
                      <Bar dataKey="average" fill="#D4AF37" radius={0} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
           </ChartContainer>
         )}

         {contextualDetails.ar && (
           <ChartContainer title={`تحليل فواعل اللغة العربية: ${selectedName}`}>
              <div className="space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contextualDetails.ar} margin={{bottom: 40, top: 10}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                      <XAxis dataKey="name" tick={{fill: '#888', fontSize: 9}} angle={-45} textAnchor="end" interval={0} height={60} />
                      <YAxis domain={[0, 8]} tick={{fill: '#888', fontSize: 10}} />
                      <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #2A2A2A', borderRadius: '0px'}} />
                      <Bar dataKey="average" fill="#6366f1" radius={0} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
           </ChartContainer>
         )}
      </div>
    </motion.div>
  );
}
