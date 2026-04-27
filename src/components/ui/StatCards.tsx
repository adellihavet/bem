import React from 'react';

export function StatCard({ label, value, subValue, trend }: { label: string, value: string, subValue?: string, trend?: 'up' | 'down' }) {
  return (
    <div className="bg-[#111] border border-[#222] p-8 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]/20 group-hover:bg-[#D4AF37] transition-all" />
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#444] font-bold mb-4">{label}</p>
      <div className="flex items-baseline gap-3">
        <h3 className="text-4xl font-mono text-[#D4AF37] font-bold tracking-tighter">{value}</h3>
        {subValue && <span className="text-[10px] text-[#444] font-sans pb-1">{subValue}</span>}
      </div>
      {trend && (
        <div className={`absolute top-8 right-8 text-[10px] font-mono ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? '↑ STABLE' : '↓ RISK'}
        </div>
      )}
    </div>
  );
}

export function ChartContainer({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-[#111] p-10 border border-[#222] shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 border-b border-[#1A1A1A] pb-6">
        <h3 className="text-2xl font-serif italic text-white">{title}</h3>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-[#D4AF37]" />
          <div className="w-1.5 h-1.5 bg-[#444]" />
        </div>
      </div>
      {children}
    </div>
  );
}
