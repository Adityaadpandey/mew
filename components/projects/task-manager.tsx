
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { GripVertical, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Task {
    id: string
    title: string
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    projectId: string
}

export function TaskManager({ projectId }: { projectId: string }) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState('')
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'

    useEffect(() => {
        loadTasks()
    }, [projectId])

    const loadTasks = async () => {
        const res = await fetch(`/api/projects/${projectId}/tasks`)
        if (res.ok) {
            setTasks(await res.json())
        }
    }

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTask.trim()) return

        const res = await fetch(`/api/projects/${projectId}/tasks`, {
            method: 'POST',
            body: JSON.stringify({ title: newTask, projectId })
        })

        if (res.ok) {
            setNewTask('')
            loadTasks()
        }
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Tasks</h2>
                <form onSubmit={handleCreateTask} className="flex gap-2">
                    <Input
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        placeholder="Add a task..."
                        className="w-64"
                    />
                    <Button type="submit" size="sm">
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border",
                        isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-slate-200"
                    )}>
                        <GripVertical className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                            <p className={cn("font-medium", task.status === 'DONE' && "line-through text-slate-500")}>
                                {task.title}
                            </p>
                        </div>
                        <div className={cn("px-2 py-1 text-xs rounded",
                            task.status === 'DONE' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                        )}>
                            {task.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
