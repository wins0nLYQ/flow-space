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

  // Group tasks by status and sort by display_order
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

    // Sort each column by display_order
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort((a, b) => a.display_order - b.display_order);
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

    // Only process when dragging over another task
    // When dragging over empty space or non-task elements (like "Add Task" button),
    // we preserve the current localTasks state to prevent jumping back
    if (!overTask) {
      // Check if dragging over a column container for cross-column moves
      const isValidColumn = mainList?.status_columns?.includes(overId);
      if (isValidColumn && activeTask.status !== overId) {
        // Moving to a different column - just update status, keep position
        setLocalTasks((tasks) => {
          const activeIndex = tasks.findIndex((t) => t.id === activeId);
          if (activeIndex === -1) return tasks;

          const updatedTasks = [...tasks];
          updatedTasks[activeIndex] = { ...activeTask, status: overId };
          return updatedTasks;
        });
      }
      // Otherwise, do nothing - preserve current order
      return;
    }

    const targetStatus = overTask.status;

    // Update local state for immediate UI feedback
    setLocalTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (activeIndex === -1 || overIndex === -1) return tasks;

      // If moving to a different column
      if (activeTask.status !== targetStatus) {
        const updatedTasks = [...tasks];
        updatedTasks[activeIndex] = { ...activeTask, status: targetStatus };
        return updatedTasks;
      }

      // If reordering within the same column
      if (activeIndex !== overIndex) {
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
    const draggedTask = localTasks.find((t) => t.id === taskId);
    const overTask = localTasks.find((t) => t.id === over.id);

    if (!draggedTask) {
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

    // Calculate new order based on the current position in localTasks (which has been optimistically updated)
    // Use the visual order from arrayMove - DO NOT sort by display_order
    const tasksInTargetColumn = localTasks.filter((t) => t.status === newStatus);

    const draggedTaskIndex = tasksInTargetColumn.findIndex((t) => t.id === taskId);

    let newOrder: number;

    if (tasksInTargetColumn.length === 1) {
      // Only task in the column
      newOrder = 1000;
    } else if (draggedTaskIndex === 0) {
      // Task is at the beginning of the column
      const nextTask = tasksInTargetColumn[1];
      newOrder = nextTask.display_order - 500;
    } else if (draggedTaskIndex === tasksInTargetColumn.length - 1) {
      // Task is at the end of the column
      const prevTask = tasksInTargetColumn[draggedTaskIndex - 1];
      newOrder = prevTask.display_order + 500;
    } else {
      // Task is in the middle - calculate midpoint between neighbors
      const prevTask = tasksInTargetColumn[draggedTaskIndex - 1];
      const nextTask = tasksInTargetColumn[draggedTaskIndex + 1];
      newOrder = (prevTask.display_order + nextTask.display_order) / 2;
    }

    // Update localTasks with the new display_order BEFORE mutation
    // This ensures localTasks already reflects the final state
    setLocalTasks((currentTasks) =>
      currentTasks.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, display_order: newOrder }
          : t
      )
    );

    console.log('🎯 Drag End Debug:', {
      taskId,
      taskTitle: draggedTask.title,
      oldStatus: draggedTask.status,
      newStatus,
      oldOrder: draggedTask.display_order,
      newOrder,
      draggedTaskIndex,
      totalInColumn: tasksInTargetColumn.length,
    });

    // Update backend with both status and order
    const statusChanged = draggedTask.status !== newStatus;
    const orderChanged = Math.abs(draggedTask.display_order - newOrder) > 0.01; // Use small epsilon for float comparison

    if (statusChanged || orderChanged) {
      try {
        await updateTaskStatus.mutateAsync({
          id: taskId,
          status: newStatus,
          display_order: newOrder,
        });
        console.log('✅ Task updated successfully:', { taskId, status: newStatus, display_order: newOrder });
      } catch (error) {
        console.error('❌ Failed to update task:', error);
        // Revert on error
        setLocalTasks(tasks);
      } finally {
        // Only clear drag state AFTER mutation completes (success or error)
        setActiveTask(null);
        isDraggingRef.current = false;
      }
    } else {
      console.log('⏭️  No changes needed - skipping update');
      // No mutation needed, safe to clear drag state immediately
      setActiveTask(null);
      isDraggingRef.current = false;
    }
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
          {activeTask ? (
            <div style={{ transform: 'rotate(-2deg)' }}>
              <KanbanCard task={activeTask} isOverlay={true} />
            </div>
          ) : null}
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
