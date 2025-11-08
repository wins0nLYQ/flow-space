import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Calendar, Flag, FolderKanban, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useCreateTask } from '@/hooks/useTasks';
import { useProjectsByList } from '@/hooks/useProjects';
import type { CreateTaskInput } from '@/types';
import { format } from 'date-fns';

interface TaskEditorProps {
  listId: string;
  defaultStatus: string;
  onSave: () => void;
  onCancel: () => void;
  onEnter?: () => void;
}

export function TaskEditor({ listId, defaultStatus, onSave, onCancel, onEnter }: TaskEditorProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const createTask = useCreateTask();
  const { data: projects } = useProjectsByList(listId);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [title]); // Depend on title to ensure latest value is used

  const handleSave = async () => {
    if (!title.trim()) {
      onCancel();
      return;
    }

    const input: CreateTaskInput = {
      list_id: listId,
      status: defaultStatus,
      title: title.trim(),
      ...(dueDate && { due_date: dueDate.toISOString() }),
      ...(priority && { priority }),
      ...(projectId && { project_id: projectId }),
    };

    try {
      await createTask.mutateAsync(input);
      onSave();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) {
        handleSave();
        if (onEnter) {
          onEnter();
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const getPriorityLabel = () => {
    if (!priority) return 'Add priority';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getProjectLabel = () => {
    if (!projectId || !projects) return 'Add project';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Add project';
  };

  return (
    <div
      ref={cardRef}
      className="bg-secondary p-1 rounded-md border border-dashed border-white/50 hover:border-white transition-colors"
    >
      {/* Task Title Input */}
      <Input
        ref={inputRef}
        type="text"
        placeholder="Task name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-2 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium py-0 px-2"
      />

      {/* Expandable Options */}
      <div className="space-y-1 mb-3">
        {/* Add Dates Button/Display */}
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <button
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                dueDate
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  : 'text-gray-400 hover:bg-secondary-foreground/10'
              }`}
            >
              <Calendar size={14} />
              <span>
                {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Add dates'}
              </span>
              {dueDate && (
                <X
                  size={14}
                  className="ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDueDate(undefined);
                  }}
                />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dueDate}
              onSelect={(date) => {
                setDueDate(date);
                setShowDatePicker(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Add Priority Button/Display */}
        <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
          <SelectTrigger
            className={`w-full h-auto px-2 py-1.5 rounded text-xs border-none ${
              priority
                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                : 'bg-transparent text-gray-400 hover:bg-secondary-foreground/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flag size={14} />
              <span>{getPriorityLabel()}</span>
              {priority && (
                <X
                  size={14}
                  className="ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPriority(undefined);
                  }}
                />
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Add Project Button/Display */}
        {projects && projects.length > 0 && (
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger
              className={`w-full h-auto px-2 py-1.5 rounded text-xs border-none ${
                projectId
                  ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                  : 'bg-transparent text-gray-400 hover:bg-secondary-foreground/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderKanban size={14} />
                <span className="truncate">{getProjectLabel()}</span>
                {projectId && (
                  <X
                    size={14}
                    className="ml-auto flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectId(undefined);
                    }}
                  />
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!title.trim() || createTask.isPending}
          className="h-7 text-xs"
        >
          <Check size={14} className="mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={createTask.isPending}
          className="h-7 text-xs"
        >
          <X size={14} className="mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
