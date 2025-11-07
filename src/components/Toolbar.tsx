import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { LayoutGrid, List, Calendar, ChevronRight } from 'lucide-react';

interface ToolbarProps {
  currentView?: 'board' | 'list' | 'calendar';
}

export function Toolbar({ currentView = 'board' }: ToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams({ strict: false });

  // Extract spaceId from route params
  const spaceId = 'spaceId' in params ? params.spaceId : null;

  const views = [
    { id: 'board' as const, icon: LayoutGrid, label: 'Board' },
    { id: 'list' as const, icon: List, label: 'List' },
    { id: 'calendar' as const, icon: Calendar, label: 'Calendar' },
  ];

  const handleViewChange = (view: 'board' | 'list' | 'calendar') => {
    if (!spaceId) return;

    // Navigate to the appropriate route
    const routes = {
      board: `/spaces/${spaceId}/board`,
      list: `/spaces/${spaceId}/list`,
      calendar: `/spaces/${spaceId}/calendar`,
    };

    navigate({ to: routes[view] });
  };

  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
      {/* Toolbar content */}
      <div
        className={`h-auto bg-primary rounded-r-md transition-all ease-in-out py-2 ${
          isOpen ? 'pr-2' : 'w-0 overflow-hidden'
        }`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Icon list */}
        <div className={`flex flex-col items-center gap-2 ${isOpen ? '' : 'invisible'}`}>
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = currentView === view.id;

            return (
              <button
                key={view.id}
                onClick={() => handleViewChange(view.id)}
                disabled={!spaceId}
                className={`relative group w-8 h-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
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
        <button
          className="w-4 h-10 bg-primary flex items-center justify-center rounded-r text-gray-400 hover:text-white transition-colors"
          onMouseEnter={() => setIsOpen(true)}
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
