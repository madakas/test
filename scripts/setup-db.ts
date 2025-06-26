import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../src/lib/db/schema'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// This script will create the database tables
async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.log('Please add DATABASE_URL to your .env.local file')
    console.log('Current env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
    process.exit(1)
  }

  try {
    console.log('🔌 Connecting to database...')
    console.log('📡 Using connection string:', connectionString.substring(0, 50) + '...')
    
    const client = postgres(connectionString, { prepare: false })
    const db = drizzle(client, { schema })

    console.log('📋 Creating tables...')
    
    // Create tables using Drizzle
    await db.execute(`
      CREATE TABLE IF NOT EXISTS boards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        user_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS columns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `)

    console.log('✅ Database tables created successfully!')
    console.log('🚀 You can now run the app with: npm run dev')
    
    await client.end()
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase() 