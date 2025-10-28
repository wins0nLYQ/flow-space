# 🚀 START HERE - FlowSpace Setup

## Important: Architecture Changed!

FlowSpace now uses a **client-server architecture**:
- **Frontend**: React app (port 3000)
- **Backend**: Express API server (port 3002)
- **Database**: PostgreSQL (port 5432)

## Quick Start (3 Steps)

### Step 1: Set Up Database

You need PostgreSQL installed and running.

**Don't have PostgreSQL?** Install it:

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from: https://www.postgresql.org/download/windows/

### Step 2: Create Database & Run Migrations

```bash
# Create the database
createdb flowspace

# Run the schema to create tables
psql -d flowspace -f database/schema.sql
```

**If you get an error**, you may need to specify a user:
```bash
createdb -U postgres flowspace
psql -U postgres -d flowspace -f database/schema.sql
```

### Step 3: Start the Application

```bash
# Start both backend and frontend
npm run dev:all
```

This will start:
- ✅ Backend API server on `http://localhost:3002`
- ✅ Frontend app on `http://localhost:3000`

**Open your browser** to `http://localhost:3000`

## Troubleshooting

### "createdb: command not found"
- PostgreSQL is not installed. See Step 1.

### "Connection refused" or "ECONNREFUSED"
- PostgreSQL is not running
- Start it: `brew services start postgresql@16` (macOS)
- Or: `sudo systemctl start postgresql` (Linux)

### "Database flowspace does not exist"
- Run: `createdb flowspace`

### "role does not exist"
- Create a PostgreSQL user:
```bash
psql postgres
CREATE USER yourname WITH PASSWORD 'password';
ALTER USER yourname CREATEDB;
\q
```

### Port 3000 or 3002 already in use
- Kill the processes:
```bash
lsof -ti:3000 | xargs kill
lsof -ti:3002 | xargs kill
```

### Frontend shows blank screen
- Check browser console for errors
- Make sure backend is running on port 3002
- Check that `.env` file exists with correct settings

## What You Should See

✅ Terminal output:
```
[0] 🚀 Server running on http://localhost:3002
[0] ✅ Connected to PostgreSQL database
[1] VITE ready in 438 ms
[1] ➜  Local:   http://localhost:3000/
```

✅ Browser at `http://localhost:3000`:
- Welcome screen
- Two existing spaces: "Personal" and "Work"
- Ability to create spaces, lists, tasks, and projects

## Next Steps

1. Click on a space (e.g., "Personal")
2. Click "New List" to create a task or project list
3. Add tasks or projects
4. Try different views (Kanban, List, Calendar)
5. Link tasks to projects and watch progress auto-update!

## Need More Help?

- **Architecture**: See ARCHITECTURE.md
- **Setup Guide**: See SETUP.md
- **Quick Reference**: See QUICKSTART.md
- **Full Docs**: See README.md

---

🎉 **You're all set! Enjoy using FlowSpace!**
