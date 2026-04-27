import React from 'react';
import { cn } from '../../lib/utils';

export function NavLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn("nav-link", active && "active")}
    >
      <span className={cn("transition-colors", active ? "text-[#D4AF37]" : "text-[#444]")}>{icon}</span>
      <span className="text-xs uppercase tracking-wider font-semibold">{label}</span>
    </button>
  );
}
