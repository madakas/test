import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { boards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Board name is required' }, { status: 400 })
    }

    // Create the board in the database
    const [newBoard] = await db.insert(boards).values({
      name: name.trim(),
      description: description?.trim() || null,
      userId: user.id,
    }).returning()

    return NextResponse.json(newBoard)
  } catch (error) {
    console.error('Error creating board:', error)
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all boards for the user
    const userBoards = await db.select().from(boards).where(eq(boards.userId, user.id))

    return NextResponse.json(userBoards)
  } catch (error) {
    console.error('Error fetching boards:', error)
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 })
  }
} 