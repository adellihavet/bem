import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Zap, Target, ClipboardList, TrendingUp, Sparkles, BookOpen, Activity
} from 'lucide-react';
import { cn } from './lib/utils';
import { View, Student, Group, PrintData, SUBJECTS, AppConfig } from './types';
import { useAnalytics } from './hooks/useAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { Download, Upload } from 'lucide-react';

// Layout & UI
import { NavLink } from './components/layout/NavLink';
import { Settings } from 'lucide-react';

// Sections
import { Overview } from './components/sections/Overview';
import { GroupsManager } from './components/sections/GroupsManager';
import { AdvancedAnalytics } from './components/sections/AdvancedAnalytics';
import { EarlyWarningSystem } from './components/sections/EarlyWarningSystem';
import { CorrelationEngine } from './components/sections/CorrelationEngine';
import { ReportsManager } from './components/sections/ReportsManager';
import { AIReport } from './components/sections/AIReport';
import { SubjectAnalytics } from './components/sections/SubjectAnalytics';
import { SystemSettings } from './components/sections/SystemSettings';

export default function App() {
  const [view, setView] = useState<View>('OVERVIEW');
  const [activePrintReport, setActivePrintReport] = useState<PrintData | null>(null);

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('bem_config');
    if (saved) return JSON.parse(saved);
    
    const defaultCoeffs: Record<string, number> = {};
    SUBJECTS.forEach(s => {
      defaultCoeffs[s.id] = s.coefficient;
    });

    return {
      institutionName: 'متوسطة الشهيد دليحة',
      academicYear: '2023 / 2024',
      gradeLevel: '4AM',
      analysisScope: 'BEM',
      subjectCoefficients: defaultCoeffs
    };
  });

  useEffect(() => {
    localStorage.setItem('bem_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const handleAfterPrint = () => setActivePrintReport(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  useEffect(() => {
    if (activePrintReport) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [activePrintReport]);

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('bem_groups');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'الفوج 01' }];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('bem_students');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bem_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('bem_students', JSON.stringify(students));
  }, [students]);

  const stats = useAnalytics(students, groups, config);

  const simulateData = () => {
    const mockGroups: Group[] = [
      { id: '1', name: 'الفوج 01', teachers: { ar: 'أ. دليحة', math: 'أ. كمال', phys: 'أ. محمد' } },
      { id: '2', name: 'الفوج 02', teachers: { ar: 'أ. سعاد', math: 'أ. مريم', phys: 'أ. ليلى' } },
      { id: '3', name: 'الفوج 03', teachers: { ar: 'أ. سمير', math: 'أ. نادية', phys: 'أ. علي' } },
      { id: '4', name: 'الفوج 04', teachers: { ar: 'أ. زينب', math: 'أ. حكيم', phys: 'أ. رانيا' } },
    ];

    const mockStudents: Student[] = [];
    const firstNames = ['أحمد', 'محمد', 'سامي', 'ليلى', 'مريم', 'ياسين', 'سارة', 'عمر', 'خالد', 'هدى', 'سمية', 'إيمان'];
    const lastNames = ['دليحة', 'بن علي', 'منصور', 'قاسم', 'زروقي', 'بلعيد', 'عمور', 'سالمي', 'حميدوش', 'فارس'];

    for (let i = 0; i < 100; i++) {
      const groupId = mockGroups[Math.floor(Math.random() * mockGroups.length)].id;
      const student: Student = {
        id: Math.random().toString(36).substr(2, 9),
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        groupId,
        scores: SUBJECTS.map(sub => {
          let val = 8 + Math.random() * 10; // Bias towards passing for simulation
          if (Math.random() > 0.8) val = 4 + Math.random() * 5; // Some failing
          
          const subScores: Record<string, number> = {};
          if (sub.id === 'math') {
            subScores['التمرين الأول'] = Math.random() * 3;
            subScores['التمرين الثاني'] = Math.random() * 3;
            subScores['التمرين الثالث'] = Math.random() * 3;
            subScores['التمرين الرابع'] = Math.random() * 3;
            subScores['الوضعية الادماجية'] = Math.random() * 8;
            val = Object.values(subScores).reduce((a, b) => a + b, 0);
          }
          if (sub.id === 'ar') {
             subScores['البناء الفكري'] = Math.random() * 6;
             subScores['البناء اللغوي'] = Math.random() * 6;
             subScores['الوضعية الادماجية'] = Math.random() * 8;
             val = Object.values(subScores).reduce((a, b) => a + b, 0);
          }

          return {
            subjectId: sub.id,
            value: Math.min(20, Math.max(0, val)),
            subScores: Object.keys(subScores).length > 0 ? subScores : undefined
          };
        })
      };
      mockStudents.push(student);
    }

    setGroups(mockGroups);
    setStudents(mockStudents);
    setView('OVERVIEW');
  };

  const exportData = () => {
    const data = {
      config,
      groups,
      students,
      version: '2.4',
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bem-analysis-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        
        if (imported.config && imported.groups && imported.students) {
          setConfig(imported.config);
          setGroups(imported.groups);
          setStudents(imported.students);
          alert('تم استيراد البيانات بنجاح!');
        } else {
          alert('الملف غير صالح أو ينقصه بعض البيانات الأساسية.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف JSON صالح.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#D4AF37] selection:text-black">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-[#1A1A1A] flex items-center justify-between px-12 z-50 no-print">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('OVERVIEW')}>
            <div className="w-10 h-10 border-2 border-[#D4AF37] flex items-center justify-center relative overflow-hidden">
              <span className="text-lg font-serif font-bold group-hover:scale-110 transition-transform">A</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-serif font-bold italic tracking-tighter text-[#D4AF37]">Analysis Pro</p>
              <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#444]">{config.gradeLevel} {config.academicYear}</p>
            </div>
          </div>

          <div className="flex gap-8">
            <NavLink icon={<LayoutDashboard size={18} />} label="العامة" active={view === 'OVERVIEW'} onClick={() => setView('OVERVIEW')} />
            <NavLink icon={<Users size={18} />} label="الأفواج" active={view === 'GROUPS'} onClick={() => setView('GROUPS')} />
            <NavLink icon={<BookOpen size={18} />} label="المواد" active={view === 'SUBJECTS'} onClick={() => setView('SUBJECTS')} />
            <NavLink icon={<Activity size={18} />} label="المعمق" active={view === 'ADVANCED'} onClick={() => setView('ADVANCED')} />
            <NavLink icon={<Target size={18} />} label="التنبؤات" active={view === 'PREDICTIONS'} onClick={() => setView('PREDICTIONS')} />
            <NavLink icon={<Zap size={18} />} label="الارتباط" active={view === 'CORRELATION'} onClick={() => setView('CORRELATION')} />
            <NavLink icon={<ClipboardList size={18} />} label="التقارير" active={view === 'REPORTS'} onClick={() => setView('REPORTS')} />
            <NavLink icon={<Settings size={18} />} label="الإعدادات" active={view === 'SETTINGS'} onClick={() => setView('SETTINGS')} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setView('AI_REPORT')} className={cn("px-4 py-2 flex items-center gap-2 transition-all", view === 'AI_REPORT' ? "text-[#D4AF37]" : "text-[#444] hover:text-[#D4AF37]")}>
            <Sparkles size={18} />
            <span className="text-[10px] uppercase tracking-widest font-bold">AI Analysis</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-32 px-12 pb-20 no-print min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'OVERVIEW' && (
            <Overview 
              stats={stats} 
              institutionName={config.institutionName}
              onNavigateToGroups={() => setView('GROUPS')} 
              onNavigateToSettings={() => setView('SETTINGS')}
              onSimulate={simulateData} 
              onExport={exportData}
              onImport={importData}
            />
          )}

          {view === 'GROUPS' && (
            <GroupsManager 
              groups={groups} 
              students={students} 
              onUpdateGroups={setGroups} 
              onUpdateStudents={setStudents} 
            />
          )}

          {view === 'ADVANCED' && (
            <AdvancedAnalytics stats={stats} students={students} />
          )}

          {view === 'SUBJECTS' && (
            <SubjectAnalytics stats={stats} />
          )}
          
          {view === 'PREDICTIONS' && (
            <EarlyWarningSystem stats={stats} />
          )}

          {view === 'CORRELATION' && (
            <CorrelationEngine stats={stats} />
          )}

          {view === 'REPORTS' && (
            <ReportsManager 
              groups={groups} 
              students={students} 
              config={config}
              onPrint={setActivePrintReport} 
            />
          )}

          {view === 'AI_REPORT' && (
            <AIReport stats={stats} />
          )}

          {view === 'SETTINGS' && (
            <SystemSettings config={config} onUpdateConfig={setConfig} />
          )}
        </AnimatePresence>
      </main>

      {/* Print View Rendered separately for professional print styles */}
      {activePrintReport && (
        <div className="print-only report-container" dir="rtl">
           <div className="institutional-header mb-10 border-b-4 border-black pb-6">
              <div className="text-center mb-8">
                 <h1 className="text-xl font-bold mb-1">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
                 <h2 className="text-lg font-bold border-b border-black pb-2 inline-block px-12">وزارة التربية الوطنية</h2>
              </div>
              
              <div className="flex justify-between items-center gap-6 text-black">
                 <div className="w-1/3 text-right space-y-2">
                    <div>
                       <p className="text-[9px] font-bold text-gray-500 uppercase">المؤسسة التعليمية</p>
                       <p className="text-base font-black leading-tight border-b border-gray-100 pb-1">{config.institutionName}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-gray-500 uppercase">المستوى الدراسي</p>
                       <p className="text-xs font-bold">{config.gradeLevel}</p>
                    </div>
                 </div>

                 <div className="w-1/3 text-center px-4 self-center border-x border-gray-200 h-full flex flex-col justify-center py-2">
                    <h3 className="text-xl font-black mb-1 leading-tight">{activePrintReport.title}</h3>
                    <p className="text-base font-serif italic text-gray-700">{activePrintReport.subtitle}</p>
                 </div>

                 <div className="w-1/3 text-left space-y-2">
                    <div>
                       <p className="text-[9px] font-bold text-gray-500 uppercase">تاريخ الاستخراج</p>
                       <p className="text-xs font-bold">{new Date().toLocaleDateString('ar-DZ')}</p>
                    </div>
                 </div>
              </div>
           </div>

           {activePrintReport.stats && (
             <div className="stat-grid mt-8">
                {activePrintReport.stats.map((s, i) => (
                  <div key={i} className="stat-box border border-black bg-gray-50">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">{s.label}</p>
                    <p className="text-xl font-black">{s.value}</p>
                  </div>
                ))}
             </div>
           )}

           {activePrintReport.charts && (
             <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 print-chart-container">
               {activePrintReport.charts.map((chart, i) => (
                 <div key={i} className="border border-black p-6 page-break-inside-avoid">
                   <h4 className="text-sm font-black mb-6 text-center border-b border-black pb-2">{chart.label}</h4>
                    <div className="h-64 flex justify-center">
                      {chart.type === 'BAR' ? (
                        <BarChart width={350} height={256} data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="name" fontSize={10} stroke="#000" />
                          <YAxis fontSize={10} stroke="#000" />
                          <Bar dataKey="value" fill="#000" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                            {chart.data.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#000' : '#888'} />
                            ))}
                          </Bar>
                        </BarChart>
                      ) : (
                        <PieChart width={350} height={256}>
                          <Pie
                            isAnimationActive={false}
                            data={chart.data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {chart.data.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={['#000', '#555', '#AAA', '#DDD'][index % 4]} />
                            ))}
                          </Pie>
                        </PieChart>
                      )}
                    </div>
                 </div>
               ))}
             </div>
           )}

           <div className="mt-8">
              <table className="sophisticated-table w-full">
                <thead>
                  <tr className="bg-gray-100">
                    {activePrintReport.headers.map((h, i) => (
                      <th key={i} className="p-3 text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activePrintReport.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell: any, j: number) => (
                        <td key={j} className="p-2 border border-black">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>

           {activePrintReport.analysis && (
             <div className="mt-10 p-6 border-2 border-black bg-gray-50">
                <h4 className="text-lg font-bold mb-4 border-b border-black pb-2">التحليل البيداغوجي المنهجي</h4>
                <ul className="space-y-3 list-disc pr-6">
                   {activePrintReport.analysis.map((line, i) => (
                     <li key={i} className="text-sm leading-relaxed">{line}</li>
                   ))}
                </ul>
             </div>
           )}

           <div className="mt-20 flex justify-between px-10">
              <div className="text-center">
                 <p className="font-bold underline mb-16">إمضاء أستاذ المادة / منسق الفوج</p>
              </div>
              <div className="text-center">
                 <p className="font-bold underline mb-16">توقيع السيد المدير وختم المؤسسة</p>
              </div>
           </div>
           
           <div className="fixed bottom-0 left-0 right-0 py-4 border-t border-black text-[10px] flex justify-between px-10">
              <span>تاريخ الاستخراج: {new Date().toLocaleString('ar-DZ')}</span>
              <span>نظام BEM Analysis Pro V2.4 المركز الوطني للمعلوماتية</span>
              <span>صفحة 1 من 1</span>
           </div>
        </div>
      )}
    </div>
  );
}
