'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, X, User, Edit2, Save, X as CloseIcon, MoreVertical, Trash2, Split } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Card {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  isEditing?: boolean
  mergedFrom?: Array<{
    content: string
    authorId: string
    authorName: string
    createdAt: Date
  }>
}

interface Column {
  id: string
  name: string
  order: number
  cards: Card[]
}

interface KanbanBoardProps {
  columns: Column[]
  boardId: string
}

// Helper to recursively flatten mergedFrom
function flattenMergedCards(card: Card | any): Card[] {
  const ensureId = (c: any): Card => ({
    ...c,
    id: c.id || uuidv4(),
    mergedFrom: c.mergedFrom || [],
  })
  if (!card.mergedFrom || card.mergedFrom.length === 0) return [ensureId(card)]
  return card.mergedFrom.flatMap((c: any) => flattenMergedCards(ensureId(c)))
}

export default function KanbanBoard({ columns: initialColumns, boardId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [newColumnName, setNewColumnName] = useState('')
  const [showNewColumn, setShowNewColumn] = useState(false)
  const [newCardContent, setNewCardContent] = useState<{ [key: string]: string }>({})
  const [draggedCard, setDraggedCard] = useState<{ card: Card; sourceColumnId: string } | null>(null)
  const [editingCard, setEditingCard] = useState<{ cardId: string; content: string } | null>(null)
  const [editingColumn, setEditingColumn] = useState<{ columnId: string; name: string } | null>(null)
  const [mergeTarget, setMergeTarget] = useState<string | null>(null)
  const [mergeDialog, setMergeDialog] = useState<{
    sourceCardId: string | null
    targetCardId: string | null
    open: boolean
  }>({ sourceCardId: null, targetCardId: null, open: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    columnId: string | null
    cardId: string | null
  }>({ open: false, columnId: null, cardId: null })
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    columnId: string | null
    card: Card | null
  }>({ open: false, columnId: null, card: null })

  // Default columns if none exist
  const defaultColumns: Column[] = [
    {
      id: '1',
      name: 'Went Well',
      order: 1,
      cards: []
    },
    {
      id: '2',
      name: 'To Improve',
      order: 2,
      cards: []
    },
    {
      id: '3',
      name: 'Action Items',
      order: 3,
      cards: []
    }
  ]

  // Load board state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(`board-${boardId}`)
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        // Convert date strings back to Date objects
        const columnsWithDates = parsedState.map((col: any) => ({
          ...col,
          cards: col.cards.map((card: any) => ({
            ...card,
            createdAt: new Date(card.createdAt)
          }))
        }))
        setColumns(columnsWithDates)
      } catch (error) {
        console.error('Error loading board state:', error)
        setColumns(defaultColumns)
      }
    } else if (initialColumns.length === 0) {
      setColumns(defaultColumns)
    }
  }, [boardId, initialColumns])

  // Save board state to localStorage whenever columns change
  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem(`board-${boardId}`, JSON.stringify(columns))
    }
  }, [columns, boardId])

  const addColumn = () => {
    if (!newColumnName.trim()) return
    
    const newColumn: Column = {
      id: uuidv4(),
      name: newColumnName,
      order: columns.length + 1,
      cards: []
    }
    
    setColumns([...columns, newColumn])
    setNewColumnName('')
    setShowNewColumn(false)
  }

  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId))
  }

  const updateColumnName = (columnId: string, newName: string) => {
    if (!newName.trim()) return
    
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, name: newName.trim() } : col
    ))
    setEditingColumn(null)
  }

  const addCard = (columnId: string) => {
    const content = newCardContent[columnId]
    if (!content?.trim()) return

    const newCard: Card = {
      id: uuidv4(),
      content: content,
      authorId: 'current-user',
      authorName: 'You',
      createdAt: new Date()
    }

    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    ))
    
    setNewCardContent({ ...newCardContent, [columnId]: '' })
  }

  const deleteCard = (columnId: string, cardId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
        : col
    ))
  }

  const updateCardContent = (columnId: string, cardId: string, newContent: string) => {
    if (!newContent.trim()) return
    
    setColumns(columns.map(col => 
      col.id === columnId 
        ? { 
            ...col, 
            cards: col.cards.map(card => 
              card.id === cardId 
                ? { ...card, content: newContent.trim() }
                : card
            )
          }
        : col
    ))
    setEditingCard(null)
  }

  const startEditingCard = (card: Card) => {
    setEditingCard({ cardId: card.id, content: card.content })
  }

  const startEditingColumn = (column: Column) => {
    setEditingColumn({ columnId: column.id, name: column.name })
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, card: Card, columnId: string) => {
    setDraggedCard({ card, sourceColumnId: columnId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    if (!draggedCard) return
    // If dropping on a card, handled separately
    if (mergeTarget) {
      handleMergeCards(draggedCard.card.id, mergeTarget)
      setDraggedCard(null)
      return
    }
    const { card, sourceColumnId } = draggedCard
    if (sourceColumnId === targetColumnId) {
      setDraggedCard(null)
      return
    }
    // Remove card from source column
    const updatedColumns = columns.map(col =>
      col.id === sourceColumnId
        ? { ...col, cards: col.cards.filter(c => c.id !== card.id) }
        : col
    )
    // Add card to target column
    setColumns(
      updatedColumns.map(col =>
        col.id === targetColumnId
          ? { ...col, cards: [...col.cards, card] }
          : col
      )
    )
    setDraggedCard(null)
  }

  // Card merging functionality (now with confirmation)
  const handleMergeCards = (sourceCardId: string, targetCardId: string) => {
    setMergeDialog({ sourceCardId, targetCardId, open: true })
  }

  const confirmMerge = () => {
    const { sourceCardId, targetCardId } = mergeDialog
    if (!sourceCardId || !targetCardId) return
    const sourceColumn = columns.find(col => col.cards.some(card => card.id === sourceCardId))
    const targetColumn = columns.find(col => col.cards.some(card => card.id === targetCardId))
    if (!sourceColumn || !targetColumn) return
    const sourceCard = sourceColumn.cards.find(card => card.id === sourceCardId)
    const targetCard = targetColumn.cards.find(card => card.id === targetCardId)
    if (!sourceCard || !targetCard) return
    // Merge content with separator, preserve full merge history
    const mergedContent = `${targetCard.content}\n---\n${sourceCard.content}`
    const mergedFrom = [
      ...flattenMergedCards(targetCard),
      ...flattenMergedCards(sourceCard),
    ]
    const updatedColumns = columns.map(col =>
      col.id === targetColumn.id
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === targetCardId
                ? { ...card, content: mergedContent, mergedFrom }
                : card
            ),
          }
        : col
    )
    setColumns(
      updatedColumns.map(col =>
        col.id === sourceColumn.id
          ? { ...col, cards: col.cards.filter(card => card.id !== sourceCardId) }
          : col
      )
    )
    setMergeDialog({ sourceCardId: null, targetCardId: null, open: false })
    setMergeTarget(null)
  }

  const cancelMerge = () => {
    setMergeDialog({ sourceCardId: null, targetCardId: null, open: false })
    setMergeTarget(null)
  }

  const handleDragOverCard = (e: React.DragEvent, cardId: string) => {
    e.preventDefault()
    if (draggedCard && draggedCard.card.id !== cardId) {
      setMergeTarget(cardId)
    }
  }

  const handleDragLeave = () => {
    setMergeTarget(null)
  }

  // Unmerge logic (recursive)
  const handleUnmerge = (columnId: string, card: Card) => {
    if (!card.mergedFrom || card.mergedFrom.length === 0) return
    // Recursively flatten all mergedFrom cards
    const originals = card.mergedFrom.flatMap(flattenMergedCards)
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: [
              ...col.cards.filter(c => c.id !== card.id),
              ...originals.map(orig => ({ ...orig, id: uuidv4() })),
            ],
          }
        : col
    ))
  }

  // Delete logic
  const handleDelete = (columnId: string, cardId: string) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
        : col
    ))
    setDeleteDialog({ open: false, columnId: null, cardId: null })
  }

  // Edit logic
  const handleEdit = (columnId: string, card: Card, newContent: string) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(c =>
              c.id === card.id ? { ...c, content: newContent } : c
            ),
          }
        : col
    ))
    setEditDialog({ open: false, columnId: null, card: null })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Removed: <h2 className="text-lg font-semibold text-foreground">Board</h2> */}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {editingColumn?.columnId === column.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editingColumn.name}
                        onChange={(e) => setEditingColumn({ ...editingColumn, name: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateColumnName(column.id, editingColumn.name)
                          }
                        }}
                        className="h-6 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => updateColumnName(column.id, editingColumn.name)}
                        className="h-6 px-2"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingColumn(null)}
                        className="h-6 px-2"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <CardTitle 
                      className="text-sm font-medium cursor-pointer hover:text-primary"
                      onClick={() => startEditingColumn(column)}
                    >
                      {column.name}
                    </CardTitle>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteColumn(column.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Cards */}
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, column.id)}
                    onDragOver={(e) => handleDragOverCard(e, card.id)}
                    onDragLeave={handleDragLeave}
                    className={`p-3 bg-muted rounded-lg border relative group cursor-move transition-all ${
                      mergeTarget === card.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {/* Card menu button */}
                    <div className="absolute top-2 right-2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white shadow-lg rounded-md p-1 min-w-[160px]">
                          <DropdownMenuItem onClick={() => setEditDialog({ open: true, columnId: column.id, card })}>
                            <Edit2 className="h-4 w-4 mr-2 text-muted-foreground" /> Edit
                          </DropdownMenuItem>
                          {card.mergedFrom && card.mergedFrom.length > 0 && (
                            <DropdownMenuItem onClick={() => handleUnmerge(column.id, card)}>
                              <Split className="h-4 w-4 mr-2 text-muted-foreground" /> Unmerge
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, columnId: column.id, cardId: card.id })} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {editingCard?.cardId === card.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingCard.content}
                          onChange={(e) => setEditingCard({ ...editingCard, content: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateCardContent(column.id, card.id, editingCard.content)
                            }
                          }}
                          className="text-sm"
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            onClick={() => updateCardContent(column.id, card.id, editingCard.content)}
                            className="h-6 px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCard(null)}
                            className="h-6 px-2"
                          >
                            <CloseIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">{card.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{card.authorName}</span>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingCard(card)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCard(column.id, card.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add Card Input */}
                <div className="space-y-2">
                  <Input
                    placeholder="Add a card..."
                    value={newCardContent[column.id] || ''}
                    onChange={(e) => setNewCardContent({
                      ...newCardContent,
                      [column.id]: e.target.value
                    })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCard(column.id)
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCard(column.id)}
                    disabled={!newCardContent[column.id]?.trim()}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Add Column */}
        <div className="flex-shrink-0 w-80">
          {showNewColumn ? (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Input
                  placeholder="Column name..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addColumn()
                    }
                  }}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={addColumn}
                    disabled={!newColumnName.trim()}
                  >
                    Add Column
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewColumn(false)
                      setNewColumnName('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outline"
              className="w-full h-32 border-dashed"
              onClick={() => setShowNewColumn(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Merging */}
      <Dialog open={mergeDialog.open} onOpenChange={cancelMerge}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-2">⚠️</span>
                Are you sure you want to merge the cards?
              </div>
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-center gap-4 mt-4">
            <Button onClick={confirmMerge} variant="default">
              Yes, merge it!
            </Button>
            <Button onClick={cancelMerge} variant="outline">
              No, keep it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Modal */}
      <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, columnId: null, card: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={editDialog.card?.content || ''}
              onChange={e => setEditDialog(editDialog => ({ ...editDialog, card: editDialog.card ? { ...editDialog.card, content: e.target.value } : null }))}
              className="mb-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => editDialog.card && editDialog.columnId && handleEdit(editDialog.columnId, editDialog.card, editDialog.card.content)}
              disabled={!editDialog.card?.content?.trim()}
            >
              Save
            </Button>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, columnId: null, card: null })}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, columnId: null, cardId: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
          </DialogHeader>
          <div className="py-2">Are you sure you want to delete this card? This action cannot be undone.</div>
          <DialogFooter>
            <Button
              onClick={() => deleteDialog.columnId && deleteDialog.cardId && handleDelete(deleteDialog.columnId, deleteDialog.cardId)}
              variant="destructive"
            >
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, columnId: null, cardId: null })}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 