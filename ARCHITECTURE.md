# FlowSpace Architecture

## Overview

FlowSpace uses a **client-server architecture** with a clear separation between frontend and backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Port 3000)                            │ │
│  │  - TanStack Router                                     │ │
│  │  - TanStack Query                                      │ │
│  │  - Tailwind CSS + shadcn/ui                           │ │
│  │  - Kanban/List/Calendar Views                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/JSON
                          │ (fetch API)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Express Backend API (Port 3002)                             │
│  - REST API Endpoints                                        │
│  - CORS enabled                                              │
│  - Routes: /api/spaces, /api/lists, /api/tasks, /api/projects│
└─────────────────────────────────────────────────────────────┘
                          │
                          │ SQL Queries
                          │ (pg library)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database (Port 5432)                             │
│  - Tables: spaces, lists, tasks, projects                    │
│  - Triggers for auto-updates                                 │
│  - Foreign key constraints                                   │
└─────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

### Problem
Initially, the frontend tried to connect directly to PostgreSQL using the `pg` library. However, **Node.js libraries like `pg` cannot run in the browser** because they require Node.js-specific modules (fs, net, crypto, etc.) that don't exist in browsers.

### Solution
Implement a backend API server that:
1. **Runs in Node.js** (where `pg` works perfectly)
2. **Exposes REST API endpoints** that the browser can call
3. **Handles all database operations** securely
4. **Provides CORS support** for cross-origin requests

## Technology Stack

### Frontend (Browser)
- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool & dev server
- **TanStack Router**: File-based routing
- **TanStack Query**: Data fetching & caching
- **Tailwind CSS 4**: Styling
- **shadcn/ui**: Component library
- **@dnd-kit**: Drag-and-drop
- **react-big-calendar**: Calendar views

### Backend (Node.js)
- **Express 5**: Web framework
- **TypeScript**: Type safety
- **tsx**: TypeScript execution
- **pg**: PostgreSQL client
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables

### Database
- **PostgreSQL 14+**: Relational database

## API Endpoints

### Spaces
- `GET /api/spaces` - Get all spaces
- `GET /api/spaces/:id` - Get space by ID
- `POST /api/spaces` - Create space
- `PUT /api/spaces/:id` - Update space
- `DELETE /api/spaces/:id` - Delete space

### Lists
- `GET /api/lists` - Get all lists
- `GET /api/lists/space/:spaceId` - Get lists by space
- `GET /api/lists/:id` - Get list by ID
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list

### Tasks
- `GET /api/tasks/list/:listId` - Get tasks by list
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Projects
- `GET /api/projects/list/:listId` - Get projects by list
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `PATCH /api/projects/:id/status` - Update project status
- `DELETE /api/projects/:id` - Delete project

## Data Flow Example

### Creating a Task

1. **User Action**: User fills out task form and clicks "Create"
2. **Frontend**:
   - `TaskDialog` component calls `useCreateTask()` hook
   - Hook triggers `tasksApi.create(input)`
   - API client sends `POST /api/tasks` to backend
3. **Backend**:
   - Express receives request at `/api/tasks`
   - Validates and inserts into PostgreSQL
   - Returns created task as JSON
4. **Frontend**:
   - TanStack Query receives response
   - Updates cache automatically
   - UI re-renders with new task
   - All related queries are invalidated

## Security Considerations

### Current State (Development)
- ✅ Backend validates all inputs
- ✅ SQL injection prevented by parameterized queries
- ✅ CORS configured for localhost
- ❌ No authentication
- ❌ No authorization
- ❌ API exposed without rate limiting

### Production Recommendations
1. **Add Authentication**: JWT tokens, session-based, or OAuth
2. **Add Authorization**: Row-level security in PostgreSQL
3. **Use HTTPS**: Encrypt data in transit
4. **Add Rate Limiting**: Prevent abuse
5. **Validate All Input**: Backend validation for all fields
6. **Add API Keys**: Secure API access
7. **Environment Variables**: Never commit secrets

## Development Workflow

### Running Both Servers
```bash
npm run dev:all
```

This runs:
- Backend API server on port 3002
- Frontend dev server on port 3000

### Running Separately
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost          # PostgreSQL host
DB_PORT=5432               # PostgreSQL port
DB_NAME=flowspace          # Database name
DB_USER=your_username      # Database user
DB_PASSWORD=your_password  # Database password
PORT=3002                  # Backend server port
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3002/api  # Backend API URL
```

## File Structure

```
flow-space/
├── server/                 # Backend server
│   ├── index.ts           # Express app & routes
│   └── db.ts              # PostgreSQL connection
├── src/                   # Frontend app
│   ├── api/               # API client functions
│   │   ├── spaces.ts      # Spaces API calls
│   │   ├── lists.ts       # Lists API calls
│   │   ├── tasks.ts       # Tasks API calls
│   │   └── projects.ts    # Projects API calls
│   ├── components/        # React components
│   ├── hooks/             # TanStack Query hooks
│   ├── lib/
│   │   └── db.ts          # API client (fetch wrapper)
│   ├── routes/            # TanStack Router routes
│   └── types/             # TypeScript types
├── database/
│   └── schema.sql         # Database schema
├── .env                   # Environment variables
└── package.json           # Dependencies & scripts
```

## Performance Optimizations

### Frontend
- Code splitting by route
- TanStack Query caching (5min stale time)
- Lazy loading components
- Optimized bundle sizes

### Backend
- Connection pooling (PostgreSQL)
- Parameterized queries
- Efficient SQL queries with joins
- Indexed database columns

### Database
- Primary key indexes (UUID)
- Foreign key indexes
- Created_at indexes
- Status indexes

## Future Enhancements

1. **WebSockets**: Real-time updates
2. **GraphQL**: More efficient data fetching
3. **Redis**: Caching layer
4. **Docker**: Containerization
5. **CI/CD**: Automated testing & deployment
6. **Monitoring**: Error tracking & analytics
