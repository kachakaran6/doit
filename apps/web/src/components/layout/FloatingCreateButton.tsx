import React from 'react';
import { Plus } from 'lucide-react';
import { CreateType } from './CreateModal';
import { useCreateStore } from '@/lib/create-store';

export interface FloatingCreateButtonProps {
  type?: CreateType;
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function FloatingCreateButton({
  type = 'task',
  label,
  onClick,
  icon,
}: FloatingCreateButtonProps) {
  const openCreate = useCreateStore((s) => s.openCreate);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openCreate(type);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 pl-3.5 pr-4.5 py-2.5 rounded-full bg-[var(--primary)] text-white text-[13px] font-semibold shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-150 cursor-pointer select-none group"
    >
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        {icon || <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
      </div>
      <span className="tracking-tight whitespace-nowrap">{label}</span>
    </button>
  );
}

