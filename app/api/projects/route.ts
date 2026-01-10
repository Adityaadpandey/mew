
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
        return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 })
    }

    // Verify access
    const member = await db.workspaceMember.findFirst({
        where: {
            workspaceId,
            userId: session.user.id,
        },
    })

    if (!member) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const projects = await db.project.findMany({
        where: {
            workspaceId,
        },
        include: {
            _count: {
                select: { documents: true, tasks: true },
            },
        },
        orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, workspaceId } = body

    if (!name || !workspaceId) {
        return NextResponse.json(
            { error: 'Name and workspaceId are required' },
            { status: 400 }
        )
    }

    // Verify access
    const member = await db.workspaceMember.findFirst({
        where: {
            workspaceId,
            userId: session.user.id,
            role: { in: ['ADMIN', 'EDITOR'] }, // Only admins/editors can create projects
        },
    })

    if (!member) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const project = await db.project.create({
        data: {
            name,
            description,
            workspaceId,
        },
        include: {
            _count: {
                select: { documents: true, tasks: true },
            },
        },
    })

    // Log activity
    await db.activity.create({
        data: {
            userId: session.user.id,
            action: 'created',
            targetType: 'project',
            targetId: project.id,
            metadata: { name },
        },
    })

    return NextResponse.json(project, { status: 201 })
}
