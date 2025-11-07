import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-secondary p-3 rounded-md cursor-pointer hover:bg-[#323232] transition-colors group"
    >
      <h4 className="font-medium text-sm mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
      )}
      {task.due_date && (
        <div className="mt-2 text-xs text-gray-500">
          Due: {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
