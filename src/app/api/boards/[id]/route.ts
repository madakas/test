import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { boards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const board = await db.select().from(boards).where(eq(boards.id, params.id)).limit(1)

    if (board.length === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    // Check if the user owns this board
    if (board[0].userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(board[0])
  } catch (error) {
    console.error('Error fetching board:', error)
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 })
  }
} 