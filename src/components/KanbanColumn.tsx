import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';
import type { Task } from '@/types';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask?: () => void;
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onAddTask,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-gray-500 bg-primary px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 hover:bg-secondary rounded transition-colors"
          title="Add task"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Column content */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-primary rounded-lg p-2 transition-colors ${
          isOver ? 'ring-2 ring-white ring-opacity-50' : ''
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
