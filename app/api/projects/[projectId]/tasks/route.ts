
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

    const { projectId } = await params

    // Verify access to project
    const project = await db.project.findUnique({
        where: { id: projectId },
        include: { workspace: { include: { members: true } } }
    })

    if (!project) return new NextResponse('Project not found', { status: 404 })

    const hasAccess = project.workspace.members.some(m => m.userId === session.user.id)
    if (!hasAccess) return new NextResponse('Forbidden', { status: 403 })

    const tasks = await db.task.findMany({
        where: { projectId },
        orderBy: { position: 'asc' }, // For Kanban
        include: {
            assignee: {
                select: { id: true, name: true, image: true, email: true }
            }
        }
    })

    return NextResponse.json(tasks)
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

    const { projectId } = await params
    const body = await req.json()
    const { title, description, status, priority, assigneeId, dueDate, tags } = body

    if (!title) return new NextResponse('Title required', { status: 400 })

    // Verify access
    const project = await db.project.findUnique({
        where: { id: projectId },
        include: { workspace: { include: { members: true } } }
    })

    if (!project) return new NextResponse('Project not found', { status: 404 })

    const hasAccess = project.workspace.members.some(m => m.userId === session.user.id)
    if (!hasAccess) return new NextResponse('Forbidden', { status: 403 })

    // Get the highest position in the target status column
    const lastTask = await db.task.findFirst({
        where: { projectId, status: status || 'TODO' },
        orderBy: { position: 'desc' },
        select: { position: true }
    })

    const task = await db.task.create({
        data: {
            title,
            description,
            status: status || 'TODO',
            priority: priority || 'MEDIUM',
            projectId,
            assigneeId,
            dueDate: dueDate ? new Date(dueDate) : null,
            tags: tags || [],
            position: lastTask ? lastTask.position + 1 : 0,
            recurrence: body.recurrence || 'NONE',
            recurrenceInterval: body.recurrenceInterval || 1,
        },
        include: {
            assignee: {
                select: { id: true, name: true, image: true, email: true }
            }
        }
    })

    // Log activity
    await db.activity.create({
        data: {
            userId: session.user.id,
            action: 'created_task',
            targetType: 'task',
            targetId: task.id,
            metadata: { title, projectId },
        },
    })

    return NextResponse.json(task)
}
