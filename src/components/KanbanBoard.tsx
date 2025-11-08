import { useState, useMemo, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { ColumnEditor } from './ColumnEditor';
import { useTasksByList } from '@/hooks/useTasks';
import { useUpdateTaskStatus } from '@/hooks/useTasks';
import type { List, Task } from '@/types';

interface KanbanBoardProps {
  spaceId: string;
  lists: List[];
}

export function KanbanBoard({ lists }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const updateTaskStatus = useUpdateTaskStatus();

  // Track if we're currently dragging to prevent server sync during drag
  const isDraggingRef = useRef(false);

  // Get the first list (main board)
  const mainList = lists[0];
  const { data: tasks = [] } = useTasksByList(mainList?.id || '');

  // Sync server tasks to local state only when not dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Group tasks by status
  // Note: Order is maintained in localTasks array via arrayMove during drag operations
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    // Initialize all columns
    mainList?.status_columns?.forEach((column) => {
      grouped[column] = [];
    });

    // Group tasks while preserving the order from localTasks
    localTasks.forEach((task) => {
      const status = task.status || (mainList?.status_columns?.[0] || 'To Do');
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(task);
    });

    return grouped;
  }, [localTasks, mainList]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    const task = localTasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dragging over the same item, do nothing
    if (activeId === overId) return;

    const activeTask = localTasks.find((t) => t.id === activeId);
    const overTask = localTasks.find((t) => t.id === overId);

    if (!activeTask) return;

    // Determine the target status
    let targetStatus: string;

    if (overTask) {
      // Dragging over another task - use that task's status
      targetStatus = overTask.status;
    } else {
      // Dragging over a column - check if it's a valid column
      const isValidColumn = mainList?.status_columns?.includes(overId);
      if (isValidColumn) {
        targetStatus = overId;
      } else {
        return;
      }
    }

    // Update local state for immediate UI feedback
    setLocalTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = overTask
        ? tasks.findIndex((t) => t.id === overId)
        : tasks.findIndex((t) => t.status === targetStatus);

      if (activeIndex === -1) return tasks;

      // If moving to a different column
      if (activeTask.status !== targetStatus) {
        const updatedTasks = [...tasks];
        updatedTasks[activeIndex] = { ...activeTask, status: targetStatus };
        return updatedTasks;
      }

      // If reordering within the same column
      if (overIndex !== -1 && activeIndex !== overIndex) {
        return arrayMove(tasks, activeIndex, overIndex);
      }

      return tasks;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      // Revert optimistic update
      setLocalTasks(tasks);
      setActiveTask(null);
      isDraggingRef.current = false;
      return;
    }

    const taskId = active.id as string;
    const activeTask = localTasks.find((t) => t.id === taskId);
    const overTask = localTasks.find((t) => t.id === over.id);

    if (!activeTask) {
      setActiveTask(null);
      isDraggingRef.current = false;
      return;
    }

    // Determine the new status
    let newStatus: string;

    if (overTask) {
      newStatus = overTask.status;
    } else {
      const isValidColumn = mainList?.status_columns?.includes(over.id as string);
      if (isValidColumn) {
        newStatus = over.id as string;
      } else {
        // Invalid drop target, revert
        setLocalTasks(tasks);
        setActiveTask(null);
        isDraggingRef.current = false;
        return;
      }
    }

    // Only update backend if status changed
    if (activeTask.status !== newStatus) {
      try {
        await updateTaskStatus.mutateAsync({
          id: taskId,
          status: newStatus,
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
        // Revert on error
        setLocalTasks(tasks);
      }
    }
    // Note: For same-column reordering, we keep the local state change
    // but don't persist to backend since there's no order field in the Task model
    // The order will reset on page refresh

    setActiveTask(null);
    isDraggingRef.current = false;
  };

  const handleDragCancel = () => {
    // Revert optimistic update
    setLocalTasks(tasks);
    setActiveTask(null);
    isDraggingRef.current = false;
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
      <div>
        <h1>Board</h1>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2 h-full pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column}
                id={column}
                title={column}
                tasks={tasksByStatus[column] || []}
                listId={mainList.id}
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
