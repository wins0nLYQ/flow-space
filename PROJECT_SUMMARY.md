# FlowSpace - Project Summary

## Overview

FlowSpace is a lightweight, self-hosted productivity app built with modern web technologies. It provides a flexible, relational system for managing tasks and projects with full visibility across all entities.

## Key Differentiators

Unlike tools like ClickUp which enforce rigid hierarchies with limited relational visibility, FlowSpace:
- ✅ Shows relationships between all entities in all views
- ✅ Allows flexible linking between tasks and projects
- ✅ Auto-calculates project progress from linked tasks
- ✅ Provides consistent multi-view experience (Kanban, List, Calendar)
- ✅ Is self-hostable with no paid dependencies

## Architecture

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for blazing-fast dev & build
- TanStack Router (file-based routing)
- TanStack Query (server state management)
- Tailwind CSS 4 (modern styling)
- shadcn/ui (accessible components)
- @dnd-kit (drag-and-drop)
- react-big-calendar (calendar views)

**Backend:**
- PostgreSQL (relational database)
- Direct database queries (no ORM overhead)

### Data Model

```
Space (Workspace)
  └── Lists
       ├── Task List
       │    └── Tasks
       │         └── Can link to Projects
       │
       └── Project List
            └── Projects
                 └── Auto-calculated progress from linked tasks
```

**Relationships:**
- Space → Lists (1:many)
- List → Tasks/Projects (1:many)
- Project ↔ Tasks (1:many)
- Tasks can optionally belong to a Project

### Project Structure

```
flow-space/
├── database/
│   ├── schema.sql          # PostgreSQL schema with triggers
│   └── README.md           # Database setup guide
├── src/
│   ├── api/                # API service layer
│   │   ├── spaces.ts
│   │   ├── lists.ts
│   │   ├── tasks.ts
│   │   └── projects.ts
│   ├── components/
│   │   ├── Layout.tsx      # App layout with sidebar
│   │   ├── dialogs/        # Task & Project creation dialogs
│   │   │   ├── TaskDialog.tsx
│   │   │   └── ProjectDialog.tsx
│   │   ├── ui/             # shadcn/ui components
│   │   └── views/          # View components
│   │       ├── KanbanView.tsx
│   │       ├── ListView.tsx
│   │       └── CalendarView.tsx
│   ├── hooks/              # TanStack Query hooks
│   │   ├── useSpaces.ts
│   │   ├── useLists.ts
│   │   ├── useTasks.ts
│   │   └── useProjects.ts
│   ├── lib/
│   │   ├── db.ts           # PostgreSQL connection
│   │   └── utils.ts        # Utilities
│   ├── routes/             # File-based routes
│   │   ├── __root.tsx      # Root layout
│   │   ├── index.tsx       # Home page
│   │   ├── spaces/
│   │   │   ├── new.tsx     # Create space
│   │   │   └── $spaceId.tsx # Space detail
│   │   └── lists/
│   │       └── $listId.tsx # List with all views
│   └── types/
│       └── index.ts        # TypeScript types
├── .env                    # Environment variables
├── SETUP.md               # Setup guide
└── README.md              # Documentation
```

## Features Implemented

### Core Functionality ✅

1. **Spaces**
   - Create, view, delete workspaces
   - Organize multiple lists per space
   - Sidebar navigation

2. **Lists**
   - Create Task Lists or Project Lists
   - Custom status columns per list
   - Default pipelines:
     - Tasks: To Do → In Progress → Done
     - Projects: Planning → In Progress → Pending Payment → Completed

3. **Tasks**
   - Full CRUD operations
   - Fields: title, description, due date, priority, status
   - Link to projects (optional)
   - Drag-and-drop status updates
   - Visible project relationships in all views

4. **Projects**
   - Full CRUD operations
   - Fields: name, description, start date, status
   - Auto-calculated progress (% = done tasks / total tasks)
   - Link multiple tasks
   - Progress indicators

5. **Views**
   - **Kanban**: Drag-and-drop cards across status columns
   - **List/Table**: Sortable table with inline status updates
   - **Calendar**: Date-based scheduling (tasks by due date, projects by start date)

### Database Features

- **Auto-updating timestamps** via triggers
- **Auto-calculating project progress** when tasks change status
- **Cascading deletes** (delete space → deletes all lists, tasks, projects)
- **Optimized indexes** for fast queries
- **UUID primary keys** for scalability

## Performance

- ⚡ Page load < 2s (target)
- ⚡ Build time ~1.8s
- ⚡ Optimized bundle sizes (gzipped):
  - Main bundle: 145KB
  - List view: 85KB
  - Total CSS: ~10KB

## MVP Scope

### Included ✅
- Spaces (CRUD)
- Lists (CRUD with type selection)
- Tasks (CRUD + Kanban movement)
- Projects (CRUD + linked tasks)
- Views (Kanban, List, Calendar)
- Relationships (Task ↔ Project linkage)
- Progress Calculation (auto-updated)

### Not Included (Future v2+)
- ❌ Authentication (Supabase Auth planned)
- ❌ Team collaboration
- ❌ Comments & attachments
- ❌ Time tracking
- ❌ External calendar sync
- ❌ Dashboard/analytics
- ❌ Dark mode
- ❌ Offline support

## Running the App

### Development
```bash
npm install
cp .env.example .env
# Configure .env with database credentials
createdb flowspace
psql -d flowspace -f database/schema.sql
npm run dev
```

### Production
```bash
npm run build
npm run serve
```

## Design Decisions

### Why PostgreSQL?
- Self-hostable (no vendor lock-in)
- Powerful relational features (triggers, foreign keys)
- Free and open source
- Excellent performance for this scale

### Why TanStack Query?
- Automatic caching and background refetching
- Optimistic updates
- No need for global state management
- Built-in loading/error states

### Why Direct SQL vs ORM?
- Better performance (no query overhead)
- More control over queries
- Simpler for this project scope
- Easier to optimize

### Why File-based Routing?
- Automatic code splitting
- Clear project structure
- Type-safe route parameters
- Simpler mental model

## Security Considerations

**Current State:**
- No authentication (local development only)
- Direct database access from client

**Production Recommendations:**
- Add authentication (Supabase Auth, Auth0, etc.)
- Implement API layer/backend
- Add row-level security
- Use environment variables properly
- Enable HTTPS
- Add CSRF protection

## Deployment Options

### Self-Hosted
1. **Frontend**: Vercel, Netlify, or any static host
2. **Database**: Self-hosted PostgreSQL or managed (AWS RDS, Digital Ocean, etc.)
3. **Note**: Will need backend API layer for production

### Development Only
Current setup is for development. Production requires additional backend layer.

## Maintenance

### Database Migrations
Currently manual via SQL files. Future: migration tool like `node-pg-migrate`

### Backups
Regular PostgreSQL backups recommended:
```bash
pg_dump flowspace > backup_$(date +%Y%m%d).sql
```

## Contributing

Future improvements:
1. Add backend API layer (Express, Fastify)
2. Implement authentication
3. Add tests (Vitest + Testing Library)
4. Add E2E tests (Playwright)
5. Improve error handling
6. Add loading skeletons
7. Optimize images
8. Add PWA support

## License

MIT License - Free to use and modify

---

**Built with ❤️ using React, TanStack, Tailwind CSS, and PostgreSQL**
