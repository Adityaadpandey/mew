import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// POST /api/tasks/bulk - Bulk operations on tasks (n8n friendly)
// ============================================================================
// Actions:
// - update: Update multiple tasks at once
// - delete: Delete multiple tasks
// - move: Move tasks to different status/project
// ============================================================================
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, taskIds, data } = body

    if (!action || !taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({
        error: 'action and taskIds array are required',
        code: 'INVALID_REQUEST'
      }, { status: 400 })
    }

    // Verify access to all tasks
    const tasks = await db.task.findMany({
      where: { id: { in: taskIds } },
      include: {
        project: {
          include: { workspace: { include: { members: true } } }
        }
      }
    })

    // Check that user has access to all tasks
    for (const task of tasks) {
      const member = task.project.workspace.members.find(m => m.userId === session.user.id)
      if (!member || !['ADMIN', 'EDITOR'].includes(member.role)) {
        return NextResponse.json({
          error: `Access denied to task ${task.id}`,
          code: 'FORBIDDEN'
        }, { status: 403 })
      }
    }

    let result: { success: boolean; affected: number; data?: unknown }

    switch (action) {
      case 'update': {
        if (!data) {
          return NextResponse.json({ error: 'data is required for update', code: 'MISSING_DATA' }, { status: 400 })
        }

        const updateData: Record<string, unknown> = {}
        if (data.status) updateData.status = data.status
        if (data.priority) updateData.priority = data.priority
        if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId
        if (data.tags) updateData.tags = data.tags
        if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null

        const updated = await db.task.updateMany({
          where: { id: { in: taskIds } },
          data: updateData
        })

        result = { success: true, affected: updated.count }
        break
      }

      case 'delete': {
        const deleted = await db.task.deleteMany({
          where: { id: { in: taskIds } }
        })

        result = { success: true, affected: deleted.count }
        break
      }

      case 'move': {
        if (!data?.projectId && !data?.status) {
          return NextResponse.json({
            error: 'projectId or status is required for move',
            code: 'MISSING_DATA'
          }, { status: 400 })
        }

        const moveData: Record<string, unknown> = {}
        if (data.projectId) moveData.projectId = data.projectId
        if (data.status) moveData.status = data.status

        const moved = await db.task.updateMany({
          where: { id: { in: taskIds } },
          data: moveData
        })

        result = { success: true, affected: moved.count }
        break
      }

      default:
        return NextResponse.json({
          error: `Unknown action: ${action}. Valid actions: update, delete, move`,
          code: 'INVALID_ACTION'
        }, { status: 400 })
    }

    // Log activity
    await db.activity.create({
      data: {
        userId: session.user.id,
        action: `bulk_${action}_tasks`,
        targetType: 'task',
        targetId: taskIds[0],
        metadata: { taskIds, action, affected: result.affected }
      }
    })

    return NextResponse.json({
      success: true,
      action,
      affected: result.affected,
      message: `Successfully ${action}d ${result.affected} tasks`
    })
  } catch (error) {
    console.error('Error in bulk task operation:', error)
    return NextResponse.json({ error: 'Bulk operation failed', code: 'BULK_ERROR' }, { status: 500 })
  }
}
