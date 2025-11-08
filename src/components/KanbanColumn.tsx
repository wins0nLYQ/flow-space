import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { TaskEditor } from './TaskEditor';
import { Plus } from 'lucide-react';
import type { Task } from '@/types';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  listId: string;
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  listId,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [editors, setEditors] = useState<number[]>([]);

  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px] p-1.5 rounded-lg bg-primary gap-1.5">
      {/* Column header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-xs border px-2 py-1 rounded-md">{title.toUpperCase()}</h3>
          <span className="text-sm font-medium text-gray-500 bg-primary px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column content */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-primary rounded-lg transition-colors ${
          isOver ? 'ring-2 ring-white ring-opacity-50' : ''
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))}

            {/* Task Editors */}
            {editors.map((editorId) => (
              <TaskEditor
                key={editorId}
                listId={listId}
                defaultStatus={id}
                onSave={() => {
                  setEditors(editors.filter(id => id !== editorId));
                }}
                onCancel={() => {
                  setEditors(editors.filter(id => id !== editorId));
                }}
                onEnter={() => {
                  setEditors([...editors, Date.now()]);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => setEditors([...editors, Date.now()])}
        className="w-full p-1.5 rounded-md hover:bg-secondary transition-all duration-200 group flex items-center gap-2 text-sm text-secondary-foreground"
        title="Add new task"
      >
        <Plus size={16} className="transition-transform group-hover:scale-110" />
        <span className="font-medium">Add Task</span>
      </button>
    </div>
  );
}
