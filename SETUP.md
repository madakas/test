# Database Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=your-database-connection-string
```

## Database Connection Options

### Option 1: Use Supabase Database
If you're using Supabase, get your connection string from:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Copy the **Connection string** (URI format)

### Option 2: Use Neon Database
If you prefer Neon:
1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

## Database Schema Setup

The app uses Drizzle ORM with the following schema:

```sql
-- Boards table
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Columns table
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Running the App

1. Set up your environment variables
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000`
4. Sign up/login and start creating boards!

## Troubleshooting

### "Database connection failed"
- Check your `DATABASE_URL` in `.env.local`
- Ensure your database is running and accessible
- Verify your connection string format

### "Board creation failed"
- Make sure you're logged in
- Check the browser console for error messages
- Verify your Supabase auth is working

### Import errors
- Restart the development server: `npm run dev`
- Clear Next.js cache: `rm -rf .next`
- Check that all files are saved properly 