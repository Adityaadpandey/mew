import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')
    const folderId = searchParams.get('folderId')
    const archived = searchParams.get('archived') === 'true'
    const favorites = searchParams.get('favorites') === 'true'
    const projectId = searchParams.get('projectId')

    const diagrams = await db.diagram.findMany({
        where: {
            workspace: {
                members: {
                    some: { userId: session.user.id },
                },
            },
            ...(workspaceId && { workspaceId }),
            ...(folderId && { folderId }),
            ...(projectId && { projectId }),
            isArchived: archived,
            ...(favorites && { isFavorite: true }),
        },
        include: {
            creator: {
                select: { id: true, name: true, avatar: true },
            },
            _count: {
                select: { comments: true, versions: true },
            },
        },
        orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(diagrams)
}

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, workspaceId, folderId, projectId, content } = body

    if (!title || !workspaceId) {
        return NextResponse.json(
            { error: 'Title and workspaceId are required' },
            { status: 400 }
        )
    }

    // Verify user has access to workspace
    const member = await db.workspaceMember.findFirst({
        where: {
            workspaceId,
            userId: session.user.id,
        },
    })

    if (!member) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const diagram = await db.diagram.create({
        data: {
            title,
            content: content || { objects: [], connections: [] },
            workspaceId,
            folderId,
            projectId,
            creatorId: session.user.id,
            publicSlug: nanoid(10),
        },
        include: {
            creator: {
                select: { id: true, name: true, avatar: true },
            },
        },
    })

    // Create initial version
    await db.version.create({
        data: {
            diagramId: diagram.id,
            content: diagram.content || {},
            createdBy: session.user.id,
            description: 'Initial version',
        },
    })

    // Log activity
    await db.activity.create({
        data: {
            userId: session.user.id,
            action: 'created',
            targetType: 'diagram',
            targetId: diagram.id,
            metadata: { title },
        },
    })

    return NextResponse.json(diagram, { status: 201 })
}
