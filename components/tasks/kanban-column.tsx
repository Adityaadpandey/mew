import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { MoreHorizontal, Plus } from 'lucide-react'
import { Task } from './kanban-card'
import { SortableTaskCard } from './sortable-task-card'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  color: string
  onAddTask?: (id: string) => void
  onStatusChange?: (id: string, newStatus: string) => void
}

export function KanbanColumn({ id, title, tasks, color, onAddTask, onStatusChange }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div className="flex-1 flex flex-col min-w-[300px] h-full rounded-2xl bg-secondary/20 border border-white/5 backdrop-blur-sm">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-transparent z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full shadow-lg shadow-current/20", color)} />
          <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-secondary/50 text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center">
           <Button onClick={() => onAddTask?.(id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
             <Plus className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
             <MoreHorizontal className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-hidden px-3 pb-3">
         <ScrollArea className="h-full pr-3">
           <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
             <div ref={setNodeRef} className="flex flex-col gap-1 pb-4 min-h-[150px]">
               {tasks.map((task, index) => (
                 <SortableTaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onStatusChange={onStatusChange}
                 />
               ))}

               <Button
                   onClick={() => onAddTask?.(id)}
                   variant="ghost"
                   className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5 h-10 border border-dashed border-border/50 hover:border-primary/30"
               >
                 <Plus className="mr-2 h-4 w-4" /> Add Task
               </Button>
             </div>
           </SortableContext>
         </ScrollArea>
      </div>
    </div>
  )
}
