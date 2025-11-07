import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { ColumnEditor } from './ColumnEditor';
import { useTasksByList } from '@/hooks/useTasks';
import { useUpdateTaskStatus } from '@/hooks/useTasks';
import { Settings } from 'lucide-react';
import type { List, Task } from '@/types';

interface KanbanBoardProps {
  spaceId: string;
  lists: List[];
}

export function KanbanBoard({ spaceId, lists }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const updateTaskStatus = useUpdateTaskStatus();

  // Get the first list (main board)
  const mainList = lists[0];
  const { data: tasks = [] } = useTasksByList(mainList?.id || '');

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    // Initialize all columns
    mainList?.status_columns?.forEach((column) => {
      grouped[column] = [];
    });

    // Group tasks
    tasks.forEach((task) => {
      const status = task.status || (mainList?.status_columns?.[0] || 'To Do');
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(task);
    });

    return grouped;
  }, [tasks, mainList]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Check if this is a valid column
    const isValidColumn = mainList?.status_columns?.includes(newStatus);

    if (isValidColumn) {
      try {
        await updateTaskStatus.mutateAsync({
          id: taskId,
          status: newStatus,
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }

    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  if (!mainList) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">No board found</div>
      </div>
    );
  }

  const columns = mainList.status_columns || ['To Do', 'In Progress', 'Done'];

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </div>
        <button
          onClick={() => setShowColumnEditor(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-[#323232] rounded text-sm transition-colors"
        >
          <Settings size={14} />
          Edit Columns
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column}
                id={column}
                title={column}
                tasks={tasksByStatus[column] || []}
                onAddTask={() => {
                  // TODO: Implement add task dialog
                  console.log('Add task to', column);
                }}
                onTaskClick={(task) => {
                  // TODO: Implement task detail dialog
                  console.log('Open task', task);
                }}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {showColumnEditor && mainList && (
        <ColumnEditor
          listId={mainList.id}
          columns={columns}
          onClose={() => setShowColumnEditor(false)}
        />
      )}
    </>
  );
}
