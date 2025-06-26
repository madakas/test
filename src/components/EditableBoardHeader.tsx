'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function EditableBoardHeader({ initialTitle, initialDescription, createdAt }: { initialTitle: string, initialDescription?: string | null, createdAt: Date }) {
  const [title, setTitle] = useState(initialTitle)
  const [desc, setDesc] = useState(initialDescription || '')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descInputRef = useRef<HTMLInputElement>(null)

  const saveTitle = () => {
    setEditingTitle(false)
    // TODO: Persist to DB
  }
  const saveDesc = () => {
    setEditingDesc(false)
    // TODO: Persist to DB
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          {editingTitle ? (
            <Input
              ref={titleInputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle() }}
              className="text-2xl font-bold mb-1 px-0 border-none shadow-none focus:ring-0 focus:border-primary"
              autoFocus
            />
          ) : (
            <h1
              className="text-2xl font-bold mb-1 cursor-pointer hover:underline"
              onClick={() => setEditingTitle(true)}
            >
              {title}
            </h1>
          )}
          {editingDesc ? (
            <Input
              ref={descInputRef}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              onBlur={saveDesc}
              onKeyDown={e => { if (e.key === 'Enter') saveDesc() }}
              className="text-muted-foreground mb-1 px-0 border-none shadow-none focus:ring-0 focus:border-primary"
              autoFocus
            />
          ) : (
            <p
              className="text-muted-foreground mb-1 cursor-pointer hover:underline"
              onClick={() => setEditingDesc(true)}
            >
              {desc || 'Add a description...'}
            </p>
          )}
        </div>
        <Badge variant="secondary">
          Created {new Date(createdAt).toLocaleDateString()}
        </Badge>
      </div>
    </div>
  )
} 