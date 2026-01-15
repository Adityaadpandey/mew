'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    closestCorners,
    defaultDropAnimationSideEffects,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Filter, SlidersHorizontal, UserPlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CreateTaskDialog } from './create-task-dialog'
import { KanbanCard, Task } from './kanban-card'
import { KanbanColumn } from './kanban-column'

export function KanbanBoard({ projectId }: { projectId: string }) {
  // Define columns order with BLOCKED added
  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-slate-500' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-500' },
    { id: 'DONE', title: 'Done', color: 'bg-green-500' },
  ]

  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    TODO: [],
    IN_PROGRESS: [],
    BLOCKED: [],
    DONE: []
  })

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [newTaskStatus, setNewTaskStatus] = useState('TODO')

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchTasks = useCallback(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/tasks`)
        if (res.ok) {
          const data: any[] = await res.json()

          // Group tasks by status
          const grouped: Record<string, Task[]> = {
            TODO: [],
            IN_PROGRESS: [],
            BLOCKED: [],
            DONE: []
          }

          data.forEach((task) => {
            // Map keys
            const mappedTask: Task = {
              id: task.id,
              title: task.title,
              priority: task.priority.toLowerCase(),
              tags: task.tags,
              assignees: task.assignee ? [task.assignee.name || 'U'] : [],
              dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined,
              completed: task.status === 'DONE'
            }

            if (grouped[task.status]) {
              grouped[task.status].push(mappedTask)
            } else {
              // Fallback for unknown status
              grouped.TODO.push(mappedTask)
            }
          })

          // Sort by position implied by array order from API if available, or just append
          // The API returns ordered by createdAt usually unless specified
          setTasks(grouped)
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAddTask = (status: string) => {
    setNewTaskStatus(status)
    setIsTaskDialogOpen(true)
  }

  const findContainer = (id: string) => {
    if (tasks[id]) return id
    return Object.keys(tasks).find((key) => tasks[key].find((t) => t.id === id))
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    const overId = over?.id

    if (!overId || active.id === overId) return

    const activeContainer = findContainer(active.id as string)
    const overContainer = findContainer(overId as string)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    setTasks((prev) => {
      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]
      const activeIndex = activeItems.findIndex((i) => i.id === active.id)
      const overIndex = overItems.findIndex((i) => i.id === overId)

      let newIndex
      if (overItems.find(i => i.id === overId)) {
        newIndex = overItems.length + 1
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.id !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex, overItems.length),
        ],
      }
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    const activeContainer = findContainer(active.id as string)
    const overContainer = findContainer(over?.id as string)

    if (
      !activeContainer ||
      !overContainer ||
      (activeContainer === overContainer && active.id === over?.id)
    ) {
      setActiveId(null)
      return
    }

    const activeItem = tasks[activeContainer].find(t => t.id === active.id)

    // Update State Locally
    setTasks((prev) => {
        const activeItems = prev[activeContainer]
        const overItems = prev[overContainer]
        const activeIndex = activeItems.findIndex((i) => i.id === active.id)
        const overIndex = overItems.findIndex((i) => i.id === over?.id)

        if (activeContainer === overContainer) {
             return {
                ...prev,
                [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex)
             }
        }

        // Handling moving between containers was partially handled by DragOver,
        // but DragEnd finalizes it.
        // Actually DragOver handles visual movement across containers.
        // DragEnd handles reordering within the same container if DragOver didn't catch it
        // Or confirming the drop.

        // Since DragOver handles cross-container movement, we just need to ensure state is clean
        return prev
    })

    setActiveId(null)

    // Persist to Backend
    // Calculate new position if needed (for now just updating status)
    if (activeContainer !== overContainer && activeItem) {
        try {
            await fetch(`/api/tasks/${active.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: overContainer,
                    // In a real app we'd also send the new numeric position index
                })
            })
        } catch (error) {
            console.error("Failed to update task status", error)
            // Revert state if needed (omitted for brevity)
        }
    }
  }

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
      // Find task and current status
      const currentContainer = findContainer(taskId)
      if (!currentContainer || currentContainer === newStatus) return

      const task = tasks[currentContainer]?.find(t => t.id === taskId)
      if (!task) return

      // Optimistic update
      setTasks(prev => ({
          ...prev,
          [currentContainer]: prev[currentContainer].filter(t => t.id !== taskId),
          [newStatus]: [...prev[newStatus], { ...task }] // Add to end
      }))

      try {
          await fetch(`/api/tasks/${taskId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          })
      } catch (error) {
          console.error("Failed to update status manually", error)
          fetchTasks() // Revert/Refresh
      }
  }

  const activeTask = activeId ? (
      Object.keys(tasks).flatMap(k => tasks[k]).find(t => t.id === activeId)
  ) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Board Toolbar */}
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-2 bg-background/50">
                 <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-2 bg-background/50">
                 <SlidersHorizontal className="h-3.5 w-3.5" /> Group by
              </Button>
               <div className="h-6 w-px bg-border mx-2" />
               <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                   <Avatar key={i} className="h-7 w-7 border-2 border-background">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                   </Avatar>
                 ))}
                 <button className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center hover:bg-muted/80 transition-colors">
                    <UserPlus className="h-3.5 w-3.5" />
                 </button>
               </div>
           </div>

           <Button onClick={() => handleAddTask('TODO')} size="sm" className="gap-2 shadow-lg shadow-primary/20">
             <UserPlus className="h-4 w-4" /> New Task
           </Button>
        </div>

        {/* Columns */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
           {columns.map(col => (
             <div key={col.id} className="h-full flex flex-col">
                <KanbanColumn
                  id={col.id}
                  title={col.title}
                  tasks={tasks[col.id] || []}
                  color={col.color}
                  onAddTask={handleAddTask}
                  onStatusChange={handleStatusUpdate}
                />
                 {/* Trigger for specific column */}
                 <Button
                   variant="ghost"
                   className="mt-2 text-muted-foreground hover:bg-secondary/50 border border-transparent hover:border-white/5 border-dashed"
                   onClick={() => handleAddTask(col.id)}
                 >
                   + Add to {col.title}
                 </Button>
             </div>
           ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
        {activeTask ? <KanbanCard task={activeTask} index={0} /> : null}
      </DragOverlay>

      <CreateTaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        projectId={projectId}
        defaultStatus={newTaskStatus}
        onTaskCreated={fetchTasks}
      />
    </DndContext>
  )
}
