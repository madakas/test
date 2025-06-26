'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

interface BoardHeaderProps {
  board: {
    id: string
    name: string
    description?: string | null
    createdAt: Date
  }
}

export default function BoardHeader({ board }: BoardHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{board.name}</h1>
              {board.description && (
                <p className="text-sm text-muted-foreground">{board.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              Created {board.createdAt.toLocaleDateString()}
            </Badge>
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 