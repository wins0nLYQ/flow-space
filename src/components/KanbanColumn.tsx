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
    <div className="flex flex-col h-full min-w-[280px] w-[280px] p-1.5 rounded-lg bg-primary">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-xs border px-2 py-0.5 rounded-md">{title.toUpperCase()}</h3>
          <span className="text-xs text-gray-500 bg-primary px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column content - only show if there are tasks */}
      {tasks.length > 0 && (
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
        </div>
      )}

      {/* Add Task Button */}
      <button
        onClick={onAddTask}
        className="w-full p-1.5 rounded-md hover:bg-secondary transition-all duration-200 group flex items-center gap-2 text-sm text-secondary-foreground"
        title="Add new task"
      >
        <Plus size={16} className="transition-transform group-hover:scale-110" />
        <span className="font-medium">Add Task</span>
      </button>
    </div>
  );
}
