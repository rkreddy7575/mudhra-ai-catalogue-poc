'use client';

import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-surface-200 bg-surface-50 p-0.5">
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200
          ${view === 'grid'
            ? 'bg-white text-brand-600 shadow-sm'
            : 'text-surface-400 hover:text-surface-600'
          }`}
        aria-label="Grid view"
      >
        <LayoutGrid size={15} />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200
          ${view === 'list'
            ? 'bg-white text-brand-600 shadow-sm'
            : 'text-surface-400 hover:text-surface-600'
          }`}
        aria-label="List view"
      >
        <List size={15} />
      </button>
    </div>
  );
}
