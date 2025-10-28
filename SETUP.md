# FlowSpace Setup Guide

This guide will help you set up and run FlowSpace locally.

## System Requirements

- **Node.js**: 18.0 or higher
- **PostgreSQL**: 14.0 or higher
- **npm**: 9.0 or higher (comes with Node.js)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19
- TanStack Router & Query
- Tailwind CSS 4
- shadcn/ui components
- @dnd-kit for drag-and-drop
- react-big-calendar
- pg (PostgreSQL client)

### 2. Install PostgreSQL

If you don't have PostgreSQL installed:

**macOS (via Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from: https://www.postgresql.org/download/windows/

### 3. Create Database

```bash
createdb flowspace
```

If you get a permission error, you may need to create a PostgreSQL user first:
```bash
# Login to PostgreSQL
psql postgres

# Create user (replace 'youruser' with your username)
CREATE USER youruser WITH PASSWORD 'yourpassword';
ALTER USER youruser CREATEDB;

# Exit
\q

# Now try creating the database again
createdb -U youruser flowspace
```

### 4. Run Database Migrations

```bash
psql -d flowspace -f database/schema.sql
```

This will:
- Create all tables (spaces, lists, tasks, projects)
- Set up relationships and foreign keys
- Add indexes for performance
- Create triggers for auto-updating timestamps and project progress
- Insert sample data (2 spaces, 2 lists)

### 5. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and update with your database credentials:
```env
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=flowspace
VITE_DB_USER=your_username
VITE_DB_PASSWORD=your_password
```

**Note:** If you're using the default PostgreSQL setup on macOS/Linux, you can often leave the username as your system username and password blank.

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## Verification

After starting the server, you should see:
1. ✅ Connected to PostgreSQL database (in terminal)
2. Welcome page with existing spaces (Personal, Work)
3. Ability to create new spaces, lists, tasks, and projects

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Make sure PostgreSQL is running: `brew services list` (macOS) or `systemctl status postgresql` (Linux)
- Check that the port in `.env` matches your PostgreSQL port (default: 5432)

**Error: "Role does not exist"**
- Create the PostgreSQL user as shown in step 3
- Or use the default `postgres` superuser

**Error: "Database does not exist"**
- Run `createdb flowspace` to create the database
- Make sure you're connected to the right host

### Build Warnings

The Node.js module warnings (events, net, fs, etc.) are expected when using `pg` in a browser environment. These are harmless as they're externalized by Vite and won't affect functionality.

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill

# Or change the port in package.json
"dev": "vite --port 3001"
```

## Database Reset

To reset the database completely:

```bash
dropdb flowspace
createdb flowspace
psql -d flowspace -f database/schema.sql
```

## Production Build

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run serve
```

## Next Steps

1. Create your first space
2. Add lists (Task or Project lists)
3. Start adding tasks or projects
4. Try different views (Kanban, List, Calendar)
5. Link tasks to projects to see auto-calculated progress

## Support

For issues:
1. Check this setup guide
2. Review the database/README.md for database-specific help
3. Check the main README.md for feature documentation
