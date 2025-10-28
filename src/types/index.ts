// Core entity types matching the database schema

export interface Space {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  space_id: string;
  name: string;
  type: 'task' | 'project';
  status_columns: string[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  list_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  list_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: string;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface TaskWithProject extends Task {
  project?: Project | null;
}

export interface ProjectWithTasks extends Project {
  tasks?: Task[];
}

export interface ListWithItems extends List {
  tasks?: Task[];
  projects?: Project[];
}

export interface SpaceWithLists extends Space {
  lists?: List[];
}

// Form input types
export interface CreateSpaceInput {
  name: string;
  description?: string;
}

export interface CreateListInput {
  space_id: string;
  name: string;
  type: 'task' | 'project';
  status_columns?: string[];
}

export interface CreateTaskInput {
  list_id: string;
  project_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
}

export interface CreateProjectInput {
  list_id: string;
  name: string;
  description?: string;
  start_date?: string;
  status?: string;
}

// View types
export type ViewMode = 'kanban' | 'list' | 'calendar';

// Calendar event type
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'project';
  resource?: Task | Project;
}
