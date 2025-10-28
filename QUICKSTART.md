# FlowSpace - Quick Start

Get FlowSpace running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed

## Setup (5 steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Database
```bash
createdb flowspace
psql -d flowspace -f database/schema.sql
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials (or leave defaults)
```

### 4. Start App
```bash
npm run dev:all
```

This starts both the backend API server (port 3002) and frontend (port 3000)

### 5. Open Browser
Visit: **http://localhost:3000**

## First Steps

1. **Click "Create Your First Space"** (or use existing "Personal" space)
2. **Click "New List"** to create a Task List or Project List
3. **Click "New Task"** or "New Project"** to add items
4. **Switch views** using Kanban, List, or Calendar tabs
5. **Drag and drop** tasks in Kanban view to change status

## Features to Try

### Task Management
- Create a task with a due date and priority
- Link the task to a project
- Drag it across Kanban columns
- View it in the Calendar

### Project Tracking
- Create a project
- Add multiple tasks linked to that project
- Mark tasks as "Done"
- Watch the project progress auto-update

### Views
- **Kanban**: Best for workflow management
- **List**: Best for detailed view with all fields
- **Calendar**: Best for deadline tracking

## Need Help?

- **Detailed Setup**: See SETUP.md
- **Full Documentation**: See README.md
- **Project Details**: See PROJECT_SUMMARY.md
- **Database Help**: See database/README.md

## Common Issues

**"createdb: command not found"**
- Install PostgreSQL first

**"Connection refused"**
- Start PostgreSQL: `brew services start postgresql@16` (macOS)

**Port 3000 in use**
- Change port: `npm run dev -- --port 3001`

## What's Next?

Customize your workflow:
1. Create different spaces for Work vs Personal
2. Set up lists for different project types
3. Use custom status columns (edit list type defaults)
4. Link related tasks to track project progress

---

Enjoy using FlowSpace! 🚀
