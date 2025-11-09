import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle, Edit, MoreVertical, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { useUpdateTask, useUpdateTaskStatus, useDeleteTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
  isOverlay?: boolean;
}

export function KanbanCard({ task, onClick, isOverlay = false }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

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

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  // Close popover when dragging starts
  useEffect(() => {
    if (isDragging && isPopoverOpen) {
      setIsPopoverOpen(false);
    }
  }, [isDragging, isPopoverOpen]);

  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateTaskStatus.mutateAsync({
        id: task.id,
        status: 'Done',
      });
    } catch (error) {
      console.error('Failed to mark task as complete:', error);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      try {
        await updateTask.mutateAsync({
          id: task.id,
          input: { title: editedTitle.trim() },
        });
      } catch (error) {
        console.error('Failed to update task title:', error);
        setEditedTitle(task.title);
      }
    } else {
      setEditedTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="relative border border-border/40 p-3 rounded-md cursor-pointer transition-colors group bg-secondary"
    >
      {/* Hover Actions */}
      <div className={cn(
        "absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex border border-border/50 bg-secondary rounded-md p-0.5",
        isPopoverOpen && "opacity-100",
        (isDragging || isOverlay) && "hidden"
      )}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleMarkComplete}
          disabled={task.status === 'Done'}
          className="h-6 w-6 bg-transparent backdrop-blur-sm shadow-sm hover:bg-border!"
          title="Mark complete"
        >
          <CheckCircle className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleEditClick}
          className="h-6 w-6 bg-transparent backdrop-blur-sm shadow-sm hover:bg-border!"
          title="Edit task name"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 bg-transparent backdrop-blur-sm shadow-sm hover:bg-border!"
              title="More actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-1"
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash2 className="h-2 w-2 mr-2" />
              Delete Task
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Task Title - Single Input with Conditional Behavior */}
      <input
        ref={inputRef}
        type="text"
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        onBlur={handleSaveEdit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        readOnly={!isEditing}
        placeholder={isEditing ? "Task Name..." : ""}
        className={`font-medium text-sm outline-none border-0 p-0 m-0 bg-transparent w-full leading-5 h-5 ${
          isEditing ? 'cursor-text' : 'cursor-pointer pointer-events-none'
        }`}
      />

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
