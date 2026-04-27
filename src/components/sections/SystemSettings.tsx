import React from 'react';
import { motion } from 'motion/react';
import { Settings, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { AppConfig, SUBJECTS } from '../../types';

interface SystemSettingsProps {
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
}

export function SystemSettings({ config, onUpdateConfig }: SystemSettingsProps) {
  const handleChange = (field: keyof AppConfig, value: any) => {
    onUpdateConfig({ ...config, [field]: value });
  };

  const handleCoeffChange = (subId: string, value: number) => {
    onUpdateConfig({
      ...config,
      subjectCoefficients: {
        ...config.subjectCoefficients,
        [subId]: value
      }
    });
  };

  const resetCoeffs = () => {
    const defaultCoeffs: Record<string, number> = {};
    SUBJECTS.forEach(s => {
      defaultCoeffs[s.id] = s.coefficient;
    });
    handleChange('subjectCoefficients', defaultCoeffs);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <header className="border-b border-[#1A1A1A] pb-10">
        <h2 className="text-5xl font-serif font-medium text-white italic tracking-tight">إعدادات النظام</h2>
        <p className="text-[#888] mt-2 font-sans text-sm tracking-wide">تخصيص المعايير، المستويات، والمعاملات البيداغوجية</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-[#111] border border-[#222] p-8 space-y-6">
              <h3 className="text-xl font-serif italic text-white flex items-center gap-3">
                <Settings size={20} className="text-[#D4AF37]" /> المعلومات الأساسية
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-[#444] uppercase tracking-widest block font-mono">اسم المؤسسة التعليمة</label>
                  <input 
                    type="text" 
                    value={config.institutionName}
                    onChange={(e) => handleChange('institutionName', e.target.value)}
                    className="w-full bg-black border border-[#222] px-4 py-3 text-sm text-[#D4AF37] focus:border-[#D4AF37]/50 outline-none transition-all"
                    placeholder="مثال: متوسطة الشهيد دليحة"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-[#444] uppercase tracking-widest block font-mono">السنة الدراسية</label>
                  <input 
                    type="text" 
                    value={config.academicYear}
                    onChange={(e) => handleChange('academicYear', e.target.value)}
                    className="w-full bg-black border border-[#222] px-4 py-3 text-sm text-white focus:border-[#D4AF37]/50 outline-none transition-all"
                    placeholder="مثال: 2023 / 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] text-[#444] uppercase tracking-widest block font-mono">المستوى الدراسي</label>
                      <select 
                        value={config.gradeLevel}
                        onChange={(e) => handleChange('gradeLevel', e.target.value)}
                        className="w-full bg-black border border-[#222] px-4 py-3 text-sm text-white focus:border-[#D4AF37]/50 outline-none transition-all"
                      >
                        <option value="1AM">الأولى متوسط</option>
                        <option value="2AM">الثانية متوسط</option>
                        <option value="3AM">الثالثة متوسط</option>
                        <option value="4AM">الرابعة متوسط</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] text-[#444] uppercase tracking-widest block font-mono">نطاق التحليل</label>
                      <select 
                        value={config.analysisScope}
                        onChange={(e) => handleChange('analysisScope', e.target.value)}
                        className="w-full bg-black border border-[#222] px-4 py-3 text-sm text-white focus:border-[#D4AF37]/50 outline-none transition-all"
                      >
                        <option value="S1">الفصل الأول</option>
                        <option value="S2">الفصل الثاني</option>
                        <option value="S3">الفصل الثالث</option>
                        <option value="BEM">شهادة التعليم المتوسط</option>
                      </select>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-8 space-y-4">
              <div className="flex items-center gap-3 text-[#D4AF37]">
                 <AlertCircle size={18} />
                 <p className="text-xs font-serif italic">تنبيه تقني</p>
              </div>
              <p className="text-xs text-[#888] leading-relaxed">
                تغيير المعاملات سيؤدي إلى إعادة حساب جميع المعدلات العامة (GPA) والارتباطات الإحصائية فوراً. يرجى التأكد من مطابقة المعاملات للمخططات الرسمية.
              </p>
           </div>
        </div>

        <div className="lg:col-span-2 bg-[#111] border border-[#222] p-8 space-y-8">
           <div className="flex justify-between items-center border-b border-[#222] pb-6">
              <h3 className="text-xl font-serif italic text-white underline underline-offset-8 decoration-[#D4AF37]">تخصيص معاملات المواد</h3>
              <button 
                onClick={resetCoeffs}
                className="flex items-center gap-2 text-[10px] text-[#444] hover:text-[#D4AF37] transition-all font-bold uppercase tracking-widest"
              >
                <RotateCcw size={14} /> إعادة القيم الافتراضية
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SUBJECTS.map((sub) => (
                <div key={sub.id} className="p-4 bg-black border border-[#222] flex justify-between items-center group hover:border-[#D4AF37]/30 transition-all">
                  <div className="space-y-1">
                    <p className="text-sm font-serif text-white italic">{sub.name}</p>
                    <p className="text-[10px] text-[#444] font-mono uppercase tracking-widest">{sub.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={config.subjectCoefficients[sub.id] || 1}
                      onChange={(e) => handleCoeffChange(sub.id, parseInt(e.target.value) || 1)}
                      className="w-16 bg-[#111] border border-[#222] px-2 py-2 text-center text-lg font-mono text-[#D4AF37] outline-none"
                    />
                  </div>
                </div>
              ))}
           </div>

           <div className="pt-8 border-t border-[#222] flex justify-end">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-3 px-12 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-xl"
              >
                <Save size={16} /> حفظ وتحديث النظام
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
