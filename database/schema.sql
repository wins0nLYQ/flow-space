-- FlowSpace Database Schema
-- PostgreSQL Database Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Spaces table
CREATE TABLE spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lists table
CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('task', 'project')),
    status_columns JSONB DEFAULT '["To Do", "In Progress", "Done"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    status VARCHAR(100) DEFAULT 'Planning',
    progress FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(100) DEFAULT 'To Do',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_lists_space_id ON lists(space_id);
CREATE INDEX idx_projects_list_id ON projects(list_id);
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate project progress
CREATE OR REPLACE FUNCTION calculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks INTEGER;
    done_tasks INTEGER;
    progress_value FLOAT;
BEGIN
    -- Get counts for the project
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'Done')
    INTO total_tasks, done_tasks
    FROM tasks
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);

    -- Calculate progress percentage
    IF total_tasks > 0 THEN
        progress_value := (done_tasks::FLOAT / total_tasks::FLOAT) * 100;
    ELSE
        progress_value := 0;
    END IF;

    -- Update the project
    UPDATE projects
    SET progress = progress_value
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate project progress when tasks change
CREATE TRIGGER task_update_project_progress
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION calculate_project_progress();

-- Insert default space and list for testing
INSERT INTO spaces (id, name, description)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Personal', 'Personal workspace'),
    ('00000000-0000-0000-0000-000000000002', 'Work', 'Work-related projects');

INSERT INTO lists (id, space_id, name, type, status_columns)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'My Tasks', 'task', '["To Do", "In Progress", "Done"]'::jsonb),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'My Projects', 'project', '["Planning", "In Progress", "Pending Payment", "Completed"]'::jsonb);
