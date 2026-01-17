import { auth } from '@/lib/auth'
import { cache, cacheKeys } from '@/lib/cache'
import { db } from '@/lib/db'
import { notifyTaskAssigned, notifyTaskCompleted } from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    let body;
    try {
      body = await request.json()
    } catch (e) {
      console.error('Failed to parse JSON body:', e)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log(`[PATCH Task] Updating task ${taskId}`, body)


    const { title, description, priority, status, assigneeId, dueDate, tags, position, recurrence, recurrenceInterval } = body



    // First get the task to get projectId for cache invalidation and track changes
    const existingTask = await db.task.findUnique({
      where: { id: taskId },
      select: {
        projectId: true,
        assigneeId: true,
        status: true,
        title: true,
        description: true,
        priority: true,
        dueDate: true,
        tags: true,
        recurrence: true,
        recurrenceInterval: true
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    console.log('[PATCH Task] Existing task found:', existingTask)

    let task;
    try {
      task = await db.$transaction(async (tx) => {
        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(priority !== undefined && { priority }),
            ...(status !== undefined && { status }),
            ...(assigneeId !== undefined && { assigneeId }),
            ...(dueDate !== undefined && { dueDate: dueDate === null ? null : new Date(dueDate) }),
            ...(tags !== undefined && { tags }),
            ...(position !== undefined && { position }),
            ...(recurrence !== undefined && { recurrence }),
            ...(recurrenceInterval !== undefined && { recurrenceInterval }),
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        })
        return updatedTask
      }, {
        timeout: 10000,
        maxWait: 5000
      })
      console.log('[PATCH Task] Task updated in DB')
    } catch (dbError) {
      console.error('[PATCH Task] DB Update Failed:', dbError)
      return NextResponse.json({
        error: 'Failed to update task in database',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 })
    }

    // Send notifications for task changes
    try {
      // Notify if task is newly assigned to someone
      if (assigneeId && assigneeId !== existingTask.assigneeId && assigneeId !== session.user.id) {
        const assignerName = session.user.name || 'Someone'
        await notifyTaskAssigned(taskId, assigneeId, assignerName)
      }

      // Notify if task is completed
      if (status === 'DONE' && existingTask.status !== 'DONE') {
        const completedByName = session.user.name || 'Someone'
        await notifyTaskCompleted(taskId, completedByName)
      }
    } catch (notifyError) {
      console.error('Failed to send task notification:', notifyError)
      // Don't fail the request if notification fails
    }

    // Invalidate cache
    try {
      if (existingTask.projectId) {
        // Validate cacheKeys exists
        if (cacheKeys && typeof cacheKeys.tasks === 'function') {
          cache.delete(cacheKeys.tasks(existingTask.projectId))
        } else {
          console.warn('[PATCH Task] cacheKeys.tasks is not available')
        }
      }
    } catch (cacheError) {
      console.error('[PATCH Task] Cache validation failed:', cacheError)
    }


    // Handle Recurrence: If task is completed and has recurrence, create the next instance
    if (status === 'DONE' && existingTask.status !== 'DONE' && existingTask.recurrence && existingTask.recurrence !== 'NONE') {
      try {
        console.log('[PATCH Task] Processing recurrence')
        const nextDueDate = new Date(existingTask.dueDate || new Date())
        const interval = existingTask.recurrenceInterval || 1

        if (existingTask.recurrence === 'DAILY') nextDueDate.setDate(nextDueDate.getDate() + interval)
        else if (existingTask.recurrence === 'WEEKLY') nextDueDate.setDate(nextDueDate.getDate() + (interval * 7))
        else if (existingTask.recurrence === 'MONTHLY') nextDueDate.setMonth(nextDueDate.getMonth() + interval)
        else if (existingTask.recurrence === 'YEARLY') nextDueDate.setFullYear(nextDueDate.getFullYear() + interval)

        console.log('[PATCH Task] Creating recurring task with due date:', nextDueDate)

        // Create next task
        await db.task.create({
          data: {
            title: existingTask.title,
            description: existingTask.description,
            priority: existingTask.priority,
            status: 'TODO',
            projectId: existingTask.projectId,
            assigneeId: existingTask.assigneeId,
            dueDate: nextDueDate,
            tags: existingTask.tags,
            recurrence: existingTask.recurrence,
            recurrenceInterval: existingTask.recurrenceInterval,
            position: 0, // Top of list
          }
        })
        console.log('[PATCH Task] Recurring task created')
      } catch (err) {
        console.error('Failed to create recurring task:', err)
      }
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to update task (Outer Catch):', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    await db.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
