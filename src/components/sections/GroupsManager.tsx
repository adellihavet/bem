import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Users, GraduationCap, Download, Upload, ClipboardList, Info } from 'lucide-react';
import { Group, Student, SUBJECTS, StudentScore } from '../../types';
import { exportSubjectTemplate, parseSubjectExcel } from '../../lib/excel';

interface Props {
  groups: Group[];
  students: Student[];
  onUpdateGroups: (groups: Group[]) => void;
  onUpdateStudents: (students: Student[]) => void;
}

export function GroupsManager({ groups, students, onUpdateGroups, onUpdateStudents }: Props) {
  const [activeTab, setActiveTab] = useState<'GROUPS' | 'DATA'>('GROUPS');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const addGroup = () => {
    if (!newGroupName) return;
    const newGroup = { id: Math.random().toString(36).substr(2, 9), name: newGroupName, teachers: {} };
    onUpdateGroups([...groups, newGroup]);
    setNewGroupName('');
  };

  const deleteGroup = (id: string) => {
    onUpdateGroups(groups.filter(g => g.id !== id));
    onUpdateStudents(students.filter(s => s.groupId !== id));
  };

  const updateTeacher = (groupId: string, subjectId: string, name: string) => {
    onUpdateGroups(groups.map(g => g.id === groupId ? {
      ...g,
      teachers: { ...g.teachers, [subjectId]: name }
    } : g));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, subId: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedGroupId) return;

    try {
      const results = await parseSubjectExcel(file);
      
      const newStudents = [...students];
      results.forEach(res => {
        // Match by name or use generated ID
        const matchName = `${res.lastName} ${res.firstName}`.trim();
        const idx = newStudents.findIndex(s => `${s.lastName} ${s.firstName}`.trim() === matchName && s.groupId === selectedGroupId);
        
        const score: StudentScore = {
          subjectId: subId,
          value: res.examScore,
          subScores: res.subScores
        };

        if (idx > -1) {
          const scoreIdx = newStudents[idx].scores.findIndex(sc => sc.subjectId === subId);
          if (scoreIdx > -1) {
            newStudents[idx].scores[scoreIdx] = score;
          } else {
            newStudents[idx].scores.push(score);
          }
        } else {
          // New student
          newStudents.push({
            id: Math.random().toString(36).substr(2, 9),
            firstName: res.firstName,
            lastName: res.lastName,
            groupId: selectedGroupId,
            scores: [score]
          });
        }
      });
      
      onUpdateStudents(newStudents);
      setUploadFeedback({ type: 'success', message: `تم استيراد علامات ${results.length} تلميذ بنجاح` });
    } catch (err) {
      setUploadFeedback({ type: 'error', message: 'خطأ في معالجة الملف. يرجى التأكد من الالتزام بالنموذج.' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-wrap border-b border-[#222] mb-8">
        <button onClick={() => setActiveTab('GROUPS')} className={`flex-1 sm:flex-none px-4 sm:px-8 py-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'GROUPS' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-[#444] hover:text-white'}`}>إدارة الأفواج</button>
        <button onClick={() => setActiveTab('DATA')} className={`flex-1 sm:flex-none px-4 sm:px-8 py-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'DATA' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-[#444] hover:text-white'}`}>إدخال البيانات</button>
      </div>

      {activeTab === 'GROUPS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-[#111] border border-[#222] p-8 space-y-6">
            <h3 className="font-serif italic text-white text-xl border-b border-[#222] pb-4">إضافة فوج جديد</h3>
            <div className="space-y-4">
              <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="مثال: الفوج 01" className="w-full bg-black border border-[#222] p-4 text-[#D4AF37] outline-none font-serif text-lg focus:border-[#D4AF37] transition-all" />
              <button onClick={addGroup} className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#B48F27] transition-all"><Plus size={16} /> إضافة الفوج</button>
            </div>
            <div className="pt-6 space-y-3">
              <p className="text-[10px] text-[#444] uppercase tracking-widest flex items-center gap-2"><Info size={12}/> تنبيه</p>
              <p className="text-xs text-[#888] font-sans leading-relaxed">عند إضافة فوج جديد، يمكنك لاحقاً تحديد الأساتذة واستيراد القوائم الإسمية لكل مادة على حدة.</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-4">
            {groups.map(g => (
              <div key={g.id} className="bg-[#111] border border-[#222] p-6 hover:border-[#D4AF37]/50 transition-all group">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 flex items-center justify-center font-serif text-xl text-[#D4AF37]">{g.name.split(' ')[1] || '00'}</div>
                    <h4 className="text-2xl font-serif text-white italic">{g.name}</h4>
                  </div>
                  <button onClick={() => deleteGroup(g.id)} className="text-red-950 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SUBJECTS.map(sub => (
                    <div key={sub.id} className="space-y-1">
                      <label className="text-[10px] text-[#444] uppercase font-bold tracking-tighter">{sub.name}</label>
                      <input type="text" value={g.teachers?.[sub.id] || ''} onChange={(e) => updateTeacher(g.id, sub.id, e.target.value)} placeholder="اسم الأستاذ..." className="w-full bg-black/50 border border-[#222] p-2 text-xs text-[#888] outline-none focus:border-[#D4AF37]/30 transition-all font-sans" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'DATA' && (
        <div className="bg-[#111] border border-[#222] p-10">
          <div className="flex flex-col md:flex-row gap-8 mb-10 border-b border-[#222] pb-10">
            <div className="flex-1 space-y-4">
              <label className="text-xs text-[#444] uppercase tracking-widest block">1. اختر الفوج التربوي</label>
              <div className="flex flex-wrap gap-2">
                {groups.map(g => (
                  <button key={g.id} onClick={() => { setSelectedGroupId(g.id); setUploadFeedback(null); }} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all border ${selectedGroupId === g.id ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'text-[#444] border-[#222] hover:border-[#D4AF37]/50'}`}>{g.name}</button>
                ))}
              </div>
            </div>
          </div>

          {selectedGroupId && (
            <div className="space-y-6">
              <header className="flex justify-between items-center bg-[#1a1a1a] p-4 border-l-4 border-[#D4AF37]">
                <h4 className="text-lg font-serif italic text-white flex items-center gap-3 flex-wrap lg:flex-nowrap"><Upload size={18} className="text-[#D4AF37]" /> استيراد العلامات للفوج: {groups.find(g => g.id === selectedGroupId)?.name}</h4>
                {uploadFeedback && <span className={`text-xs font-bold ${uploadFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{uploadFeedback.message}</span>}
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUBJECTS.map(sub => (
                  <div key={sub.id} className="bg-black border border-[#222] p-4 space-y-4 group hover:border-[#D4AF37]/20 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white font-serif">{sub.name}</span>
                      <span className="text-[10px] text-[#444] font-mono">COEFF: {sub.coefficient}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => exportSubjectTemplate(sub.id, sub.name, groups.find(g => g.id === selectedGroupId)?.name || '')} className="flex-1 py-2 bg-white/5 text-[10px] uppercase font-bold tracking-widest text-[#444] hover:text-[#D4AF37] hover:bg-white/10 transition-all flex items-center justify-center gap-2"><Download size={12} /> قالب</button>
                      <label className="flex-1 py-2 bg-[#D4AF37]/5 text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-center gap-2 cursor-pointer"><Upload size={12} /> رفع <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, sub.id)} /></label>
                    </div>
                    <div className="text-[9px] text-[#222] font-mono italic">
                      {students.filter(s => s.groupId === selectedGroupId && s.scores.some(sc => sc.subjectId === sub.id)).length} تلاميذ مسجلين
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
