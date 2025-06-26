import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import KanbanBoard from '@/components/KanbanBoard'
import AppLayout from '@/components/AppLayout'
import { db } from '@/lib/db'
import { boards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import EditableBoardHeader from '@/components/EditableBoardHeader'

interface BoardPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch real board data
  let board
  try {
    const boardData = await db.select().from(boards).where(eq(boards.id, id)).limit(1)
    
    if (boardData.length === 0) {
      notFound()
    }

    board = boardData[0]

    // Check if the user owns this board
    if (board.userId !== user.id) {
      redirect('/dashboard')
    }
  } catch (error) {
    console.error('Error fetching board:', error)
    notFound()
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <EditableBoardHeader
          initialTitle={board.name}
          initialDescription={board.description}
          createdAt={board.createdAt}
        />
        <KanbanBoard columns={[]} boardId={id} />
      </div>
    </AppLayout>
  )
} 