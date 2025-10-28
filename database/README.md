# Database Setup

## Prerequisites

Install PostgreSQL on your local machine:

### macOS
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Database Initialization

1. Create the database:
```bash
createdb flowspace
```

2. Run the schema:
```bash
psql -d flowspace -f database/schema.sql
```

## Connection String

Default local connection:
```
postgresql://localhost:5432/flowspace
```

For production or custom setup, create a `.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/flowspace
```

## Resetting the Database

To reset the database completely:
```bash
dropdb flowspace
createdb flowspace
psql -d flowspace -f database/schema.sql
```
