import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query, queryOne } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== SPACES =====
app.get('/api/spaces', async (req, res) => {
  try {
    const spaces = await query('SELECT * FROM spaces ORDER BY created_at DESC');
    res.json(spaces);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/spaces/:id', async (req, res) => {
  try {
    const space = await queryOne('SELECT * FROM spaces WHERE id = $1', [req.params.id]);
    if (!space) return res.status(404).json({ error: 'Space not found' });
    res.json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/spaces', async (req, res) => {
  try {
    const { name, description } = req.body;
    const space = await queryOne(
      'INSERT INTO spaces (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/spaces/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const space = await queryOne(
      'UPDATE spaces SET name = COALESCE($2, name), description = COALESCE($3, description) WHERE id = $1 RETURNING *',
      [req.params.id, name, description]
    );
    if (!space) return res.status(404).json({ error: 'Space not found' });
    res.json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/spaces/:id', async (req, res) => {
  try {
    await query('DELETE FROM spaces WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== LISTS =====
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await query('SELECT * FROM lists ORDER BY created_at DESC');
    res.json(lists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lists/space/:spaceId', async (req, res) => {
  try {
    const lists = await query(
      'SELECT * FROM lists WHERE space_id = $1 ORDER BY created_at DESC',
      [req.params.spaceId]
    );
    res.json(lists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lists/:id', async (req, res) => {
  try {
    const list = await queryOne('SELECT * FROM lists WHERE id = $1', [req.params.id]);
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lists', async (req, res) => {
  try {
    const { space_id, name, type, status_columns } = req.body;
    const defaultColumns = type === 'task'
      ? ['To Do', 'In Progress', 'Done']
      : ['Planning', 'In Progress', 'Pending Payment', 'Completed'];

    const list = await queryOne(
      'INSERT INTO lists (space_id, name, type, status_columns) VALUES ($1, $2, $3, $4) RETURNING *',
      [space_id, name, type, JSON.stringify(status_columns || defaultColumns)]
    );
    res.status(201).json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lists/:id', async (req, res) => {
  try {
    const { name, type, status_columns } = req.body;
    const list = await queryOne(
      'UPDATE lists SET name = COALESCE($2, name), type = COALESCE($3, type), status_columns = COALESCE($4, status_columns) WHERE id = $1 RETURNING *',
      [req.params.id, name, type, status_columns ? JSON.stringify(status_columns) : null]
    );
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/lists/:id', async (req, res) => {
  try {
    await query('DELETE FROM lists WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TASKS =====
app.get('/api/tasks/list/:listId', async (req, res) => {
  try {
    const tasks = await query(
      `SELECT t.*, row_to_json(p.*) as project
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.list_id = $1
       ORDER BY t.display_order ASC`,
      [req.params.listId]
    );
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await queryOne(
      `SELECT t.*, row_to_json(p.*) as project
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { list_id, project_id, title, description, due_date, priority, status, display_order } = req.body;

    // If no display_order provided, calculate max order for the status and add 1000
    let order = display_order;
    if (order === undefined || order === null) {
      const maxOrderResult = await queryOne<{ max_order: number }>(
        'SELECT COALESCE(MAX(display_order), 0) as max_order FROM tasks WHERE list_id = $1 AND status = $2',
        [list_id, status || 'To Do']
      );
      order = (maxOrderResult?.max_order || 0) + 1000;
    }

    const task = await queryOne(
      'INSERT INTO tasks (list_id, project_id, title, description, due_date, priority, status, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [list_id, project_id || null, title, description || null, due_date || null, priority || 'medium', status || 'To Do', order]
    );
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, due_date, priority, status, project_id, display_order } = req.body;
    const task = await queryOne(
      'UPDATE tasks SET title = COALESCE($2, title), description = COALESCE($3, description), due_date = COALESCE($4, due_date), priority = COALESCE($5, priority), status = COALESCE($6, status), project_id = COALESCE($7, project_id), display_order = COALESCE($8, display_order) WHERE id = $1 RETURNING *',
      [req.params.id, title, description, due_date, priority, status, project_id, display_order]
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { status, display_order } = req.body;

    // If moving to new status and no order provided, calculate max order for new status
    let order = display_order;
    if (status && (order === undefined || order === null)) {
      const task = await queryOne<{ list_id: string }>(
        'SELECT list_id FROM tasks WHERE id = $1',
        [req.params.id]
      );
      if (task) {
        const maxOrderResult = await queryOne<{ max_order: number }>(
          'SELECT COALESCE(MAX(display_order), 0) as max_order FROM tasks WHERE list_id = $1 AND status = $2',
          [task.list_id, status]
        );
        order = (maxOrderResult?.max_order || 0) + 1000;
      }
    }

    const updateFields = ['status = $2'];
    const params: any[] = [req.params.id, status];

    if (order !== undefined && order !== null) {
      updateFields.push(`display_order = $${params.length + 1}`);
      params.push(order);
    }

    const task = await queryOne(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk update task order (for efficient drag-and-drop operations)
app.patch('/api/tasks/bulk/order', async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    // Validate updates structure
    for (const update of updates) {
      if (!update.id || update.display_order === undefined) {
        return res.status(400).json({ error: 'Each update must have id and display_order' });
      }
    }

    // Perform bulk update in a transaction
    const client = await query('BEGIN', []);
    try {
      for (const update of updates) {
        await query(
          'UPDATE tasks SET display_order = $1, status = COALESCE($2, status) WHERE id = $3',
          [update.display_order, update.status, update.id]
        );
      }
      await query('COMMIT', []);
      res.json({ success: true, updated: updates.length });
    } catch (error) {
      await query('ROLLBACK', []);
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PROJECTS =====
app.get('/api/projects/list/:listId', async (req, res) => {
  try {
    const projects = await query(
      'SELECT * FROM projects WHERE list_id = $1 ORDER BY created_at DESC',
      [req.params.listId]
    );
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await queryOne(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { list_id, name, description, start_date, status } = req.body;
    const project = await queryOne(
      'INSERT INTO projects (list_id, name, description, start_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [list_id, name, description || null, start_date || null, status || 'Planning']
    );
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { name, description, start_date, status } = req.body;
    const project = await queryOne(
      'UPDATE projects SET name = COALESCE($2, name), description = COALESCE($3, description), start_date = COALESCE($4, start_date), status = COALESCE($5, status) WHERE id = $1 RETURNING *',
      [req.params.id, name, description, start_date, status]
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/projects/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const project = await queryOne(
      'UPDATE projects SET status = $2 WHERE id = $1 RETURNING *',
      [req.params.id, status]
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
