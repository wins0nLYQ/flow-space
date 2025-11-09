# Task Order Persistence Implementation

This document describes the implementation of task order persistence in the FlowSpace kanban board.

## Overview

Tasks can now maintain their position within kanban columns across page refreshes. The order is persisted to the database and synchronized between drag operations and the backend.

## Implementation Details

### 1. Database Schema Changes

**File:** `/Users/Winson/Projects/flow-space/database/migrations/001_add_task_order.sql`

Added `display_order` column to the `tasks` table:

```sql
ALTER TABLE tasks ADD COLUMN display_order REAL;
```

- **Type:** REAL (floating-point for flexible ordering)
- **Default:** 1000
- **Nullable:** NO (after initialization)
- **Index:** Composite index on (list_id, status, display_order) for efficient sorting

**Migration Features:**
- Initializes existing tasks with sequential order values (1000, 2000, 3000...)
- Groups tasks by list_id and status for proper ordering
- Creates index for efficient queries

### 2. Backend API Changes

**File:** `/Users/Winson/Projects/flow-space/server/index.ts`

#### Updated Endpoints

**GET /api/tasks/list/:listId**
- Now sorts by `status`, `display_order ASC`, `created_at DESC`
- Ensures tasks are returned in the correct order

**POST /api/tasks**
- Accepts optional `display_order` field
- Auto-calculates order if not provided (max order + 1000)
- Places new tasks at the end of their column

**PUT /api/tasks/:id**
- Now accepts `display_order` in update payload
- Allows updating task order along with other fields

**PATCH /api/tasks/:id/status**
- Enhanced to accept `display_order` parameter
- Auto-calculates order when moving to a new status
- Supports both status and order updates in one call

#### New Endpoint

**PATCH /api/tasks/bulk/order**
- Allows bulk updates of task order (for future optimization)
- Accepts array of `{ id, display_order, status? }` updates
- Performs updates in a transaction for consistency

**Request Body:**
```json
{
  "updates": [
    { "id": "uuid", "display_order": 1500, "status": "In Progress" }
  ]
}
```

### 3. Frontend Type Changes

**File:** `/Users/Winson/Projects/flow-space/src/types/index.ts`

Updated `Task` interface:
```typescript
export interface Task {
  // ... existing fields
  display_order: number;
  // ... existing fields
}
```

Updated `CreateTaskInput` interface:
```typescript
export interface CreateTaskInput {
  // ... existing fields
  display_order?: number;
}
```

### 4. API Client Changes

**File:** `/Users/Winson/Projects/flow-space/src/api/tasks.ts`

Enhanced methods:

```typescript
// Updated to accept optional display_order
updateStatus: async (id: string, status: string, display_order?: number): Promise<Task>

// New method for order-only updates
updateOrder: async (id: string, display_order: number, status?: string): Promise<Task>

// New method for bulk updates (future optimization)
bulkUpdateOrder: async (updates: Array<{ id: string; display_order: number; status?: string }>)
```

### 5. React Hooks Changes

**File:** `/Users/Winson/Projects/flow-space/src/hooks/useTasks.ts`

Updated `useUpdateTaskStatus` mutation:
```typescript
mutationFn: ({ id, status, display_order }: {
  id: string;
  status: string;
  display_order?: number
}) => tasksApi.updateStatus(id, status, display_order)
```

### 6. KanbanBoard Component Changes

**File:** `/Users/Winson/Projects/flow-space/src/components/KanbanBoard.tsx`

#### Sorting Logic

Added sorting by `display_order` in the `tasksByStatus` memo:

```typescript
// Sort each column by display_order
Object.keys(grouped).forEach((status) => {
  grouped[status].sort((a, b) => a.display_order - b.display_order);
});
```

#### Drag and Drop Order Calculation

Enhanced `handleDragEnd` to calculate and persist order:

**Algorithm:**
1. Find all tasks in the target status column
2. Determine drop position (before/after specific task or at end)
3. Calculate new order value:
   - **At beginning:** `overTask.display_order - 500`
   - **Between tasks:** `(prevTask.display_order + overTask.display_order) / 2`
   - **At end:** `overTask.display_order + 500`
   - **Empty column:** `maxOrder + 1000`

4. Update backend with new status and order
5. Optimistic UI update with automatic revert on error

**Key Features:**
- Uses midpoint calculation for insertion between tasks
- Prevents order collision by using floating-point values
- Handles edge cases (first position, last position, empty columns)
- Atomic updates (status + order in single API call)

## Order Assignment Strategy

### New Task Creation
```
order = MAX(display_order) + 1000
```

### Reordering Within Column
```
// Between two tasks
order = (task_above.order + task_below.order) / 2

// At beginning
order = first_task.order - 500

// At end
order = last_task.order + 500
```

### Moving to Different Column
```
order = MAX(display_order in new_column) + 1000
```

## Benefits of REAL Type

Using PostgreSQL's REAL type (floating-point) instead of INTEGER provides:

1. **Flexible Insertion:** Can insert between any two tasks without reordering all subsequent tasks
2. **No Gaps Required:** Doesn't rely on fixed gaps (which can run out)
3. **Infinite Precision:** Can calculate midpoints indefinitely
4. **Performance:** Single UPDATE vs. multiple UPDATEs when reordering

## Testing the Implementation

### Manual Testing Steps

1. **Start the servers:**
   ```bash
   npm run dev:all
   ```

2. **Open the application** at http://localhost:3000

3. **Test drag and drop:**
   - Drag tasks within the same column
   - Drag tasks between different columns
   - Refresh the page and verify order is maintained

4. **Verify database:**
   ```bash
   npx tsx scripts/verify-migration.ts
   ```

### Expected Behavior

- Tasks maintain their order after page refresh
- Dragging updates the order immediately (optimistic UI)
- Order values are floating-point numbers (e.g., 1000, 1500, 2000)
- Moving between columns assigns order at the end of the new column
- Errors during update revert the optimistic change

## Migration Instructions

### Running the Migration

```bash
npx tsx scripts/run-migration.ts database/migrations/001_add_task_order.sql
```

### Verifying the Migration

```bash
npx tsx scripts/verify-migration.ts
```

### Rollback (if needed)

```sql
-- Remove the column
ALTER TABLE tasks DROP COLUMN display_order;

-- Remove the index
DROP INDEX IF EXISTS idx_tasks_list_status_order;
```

## Performance Considerations

### Database
- Added composite index on (list_id, status, display_order) for fast sorting
- Single UPDATE per drag operation (no cascading updates)
- Efficient query plan with ORDER BY on indexed columns

### Frontend
- Optimistic updates prevent UI lag during drag operations
- Local state prevents unnecessary re-fetches during drag
- React Query handles cache invalidation automatically

### API
- Status and order updated in single API call
- Bulk update endpoint available for future optimization (not currently used)
- Transaction support for multi-task updates

## Future Enhancements

1. **Order Normalization:** Periodic task to reset orders to clean intervals (1000, 2000, 3000...)
2. **Bulk Operations:** Use bulk update endpoint when reordering multiple tasks
3. **Conflict Resolution:** Handle concurrent updates from multiple users
4. **Undo/Redo:** Track order history for undo functionality
5. **Keyboard Navigation:** Support arrow key reordering with order persistence

## Files Modified

### Backend
- `/Users/Winson/Projects/flow-space/server/index.ts` - API endpoints
- `/Users/Winson/Projects/flow-space/database/migrations/001_add_task_order.sql` - Schema migration

### Frontend
- `/Users/Winson/Projects/flow-space/src/types/index.ts` - Type definitions
- `/Users/Winson/Projects/flow-space/src/api/tasks.ts` - API client
- `/Users/Winson/Projects/flow-space/src/hooks/useTasks.ts` - React Query hooks
- `/Users/Winson/Projects/flow-space/src/components/KanbanBoard.tsx` - UI logic

### Scripts
- `/Users/Winson/Projects/flow-space/scripts/run-migration.ts` - Migration runner
- `/Users/Winson/Projects/flow-space/scripts/verify-migration.ts` - Verification script

## Technical Decisions

### Why REAL instead of INTEGER?
- Allows infinite insertion without reordering
- Simpler logic (midpoint calculation)
- Better performance (no cascading updates)

### Why not a linked list?
- Sorting would require recursive queries or app-level sorting
- More complex to maintain
- Harder to query efficiently

### Why optimistic updates?
- Better UX (immediate feedback)
- Reduces perceived latency
- Easy to revert on error

### Why single API call for status + order?
- Atomic operation (consistency)
- Reduces network requests
- Simpler error handling

## Troubleshooting

### Order values getting too small/large
Run order normalization:
```sql
WITH ordered_tasks AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY list_id, status ORDER BY display_order) * 1000 AS new_order
  FROM tasks
)
UPDATE tasks
SET display_order = ordered_tasks.new_order
FROM ordered_tasks
WHERE tasks.id = ordered_tasks.id;
```

### Tasks not maintaining order after refresh
1. Check browser console for API errors
2. Verify display_order column exists: `npx tsx scripts/verify-migration.ts`
3. Check backend logs for query errors
4. Verify React Query cache is being invalidated

### Drag and drop not working
1. Ensure backend server is running
2. Check network tab for failed API calls
3. Verify optimistic updates are reverting (indicates API issue)
4. Check console for JavaScript errors

## Summary

This implementation provides robust task order persistence with:
- Efficient database storage (REAL type with composite index)
- Flexible insertion algorithm (midpoint calculation)
- Optimistic UI updates for smooth UX
- Atomic status + order updates
- Proper error handling and rollback
- Future-proof architecture (bulk updates, order normalization)

The solution balances simplicity, performance, and maintainability while providing a solid foundation for future enhancements.
