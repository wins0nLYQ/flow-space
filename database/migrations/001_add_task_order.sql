-- Migration: Add display_order column to tasks table
-- This allows tasks to maintain their sort order within kanban columns

-- Add display_order column
ALTER TABLE tasks ADD COLUMN display_order REAL;

-- Initialize existing tasks with order based on created_at
-- Using ROW_NUMBER to assign sequential orders within each list and status
WITH ordered_tasks AS (
    SELECT
        id,
        ROW_NUMBER() OVER (PARTITION BY list_id, status ORDER BY created_at) * 1000 AS computed_order
    FROM tasks
)
UPDATE tasks
SET display_order = ordered_tasks.computed_order
FROM ordered_tasks
WHERE tasks.id = ordered_tasks.id;

-- Make display_order NOT NULL now that we have values
ALTER TABLE tasks ALTER COLUMN display_order SET NOT NULL;

-- Set default for new tasks (will be overridden by application logic)
ALTER TABLE tasks ALTER COLUMN display_order SET DEFAULT 1000;

-- Add index for efficient sorting within columns
CREATE INDEX idx_tasks_list_status_order ON tasks(list_id, status, display_order);

-- Comment the table
COMMENT ON COLUMN tasks.display_order IS 'Display order for tasks within their status column. Lower values appear first.';
