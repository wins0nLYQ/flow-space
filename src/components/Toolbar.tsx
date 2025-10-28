import { useState } from 'react';
import { LayoutGrid, List, Calendar, ChevronRight } from 'lucide-react';

interface ToolbarProps {
  currentView?: 'board' | 'list' | 'calendar';
  onViewChange?: (view: 'board' | 'list' | 'calendar') => void;
}

export function Toolbar({ currentView = 'board', onViewChange }: ToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const views = [
    { id: 'board' as const, icon: LayoutGrid, label: 'Board' },
    { id: 'list' as const, icon: List, label: 'List' },
    { id: 'calendar' as const, icon: Calendar, label: 'Calendar' },
  ];

  return (
    <div
      className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Toolbar content */}
      <div
        className={`h-auto bg-primary rounded-r-md transition-all duration-200 ease-in-out py-2 ${
          isOpen ? 'pr-2' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Icon list */}
        <div className={`flex flex-col items-center gap-2 ${isOpen ? '' : 'invisible'}`}>
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = currentView === view.id;

            return (
              <button
                key={view.id}
                onClick={() => onViewChange?.(view.id)}
                className={`relative group w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                  isActive
                    ? 'bg-secondary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-secondary/50'
                }`}
              >
                <Icon size={20} />

                {/* Tooltip */}
                <div className="absolute left-full ml-2 text-sm text-white opacity-0 group-hover:opacity-100 group-hover:delay-[800ms] transition-opacity duration-0 pointer-events-none whitespace-nowrap">
                  {view.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle button - only shown when collapsed */}
      {!isOpen && (
        <button className="w-4 h-10 bg-primary flex items-center justify-center rounded-r text-gray-400 hover:text-white transition-colors">
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
