import React from 'react';
import { cn } from '../../lib/utils';
import { Info } from 'lucide-react';

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

export function ChartContainer({ title, subtitle, children, onClick }: { title: string, subtitle?: string, children: React.ReactNode, onClick?: () => void }) {
  return (
    <div 
      className={cn(
        "bg-[#111] p-10 border border-[#222] shadow-2xl relative overflow-hidden",
        onClick && "cursor-pointer group hover:border-[#D4AF37]/30 transition-all"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-8 border-b border-[#1A1A1A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {onClick && <Info size={14} className="text-[#D4AF37] opacity-50 group-hover:opacity-100 transition-opacity" />}
            <h3 className="text-2xl font-serif italic text-white leading-tight">{title}</h3>
          </div>
          {subtitle && <p className="text-[10px] text-[#444] uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 bg-[#D4AF37]" />
          <div className="w-1.5 h-1.5 bg-[#444]" />
        </div>
      </div>
      {children}
    </div>
  );
}
