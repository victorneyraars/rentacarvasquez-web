'use client';

import { useState } from 'react';

interface Props {
  text: string;
  size?: 'sm' | 'md';
}

export default function HelpTooltip({ text, size = 'sm' }: Props) {
  const [open, setOpen] = useState(false);
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        aria-label="Ayuda"
        title={text}
        className={`${iconSize} inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition-colors`}
      >
        <span className="text-[10px] font-bold">?</span>
      </button>
      {open && (
        <span className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-white shadow-xl">
          {text}
          <span className="absolute -top-1 left-3 h-2 w-2 rotate-45 bg-slate-900" />
        </span>
      )}
    </span>
  );
}
