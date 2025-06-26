import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Kanban } from 'lucide-react'
import Link from 'next/link'
import CreateBoardDialog from '@/components/CreateBoardDialog'
import AppLayout from '@/components/AppLayout'
import { db } from '@/lib/db'
import { boards, type Board } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch real boards from the database
  let userBoards: Board[] = []
  try {
    userBoards = await db.select().from(boards).where(eq(boards.userId, user.id))
  } catch (error) {
    console.error('Error fetching boards:', error)
    // If database is not set up yet, we'll show empty state
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Boards</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your retrospective boards
            </p>
          </div>
          <CreateBoardDialog />
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBoards.map((board) => (
            <Card key={board.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Kanban className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{board.name}</CardTitle>
                </div>
                <CardDescription>{board.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Updated {new Date(board.updatedAt).toLocaleDateString()}
                  </p>
                  <Link href={`/board/${board.id}`}>
                    <Button size="sm">
                      Open Board
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {userBoards.length === 0 && (
          <div className="text-center py-12">
            <Kanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No boards yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first retrospective board to get started
            </p>
            <CreateBoardDialog />
          </div>
        )}
      </div>
    </AppLayout>
  )
} 