import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ diagramId: string }> }
) {
    const session = await auth()
    const { diagramId } = await params

    // Check for public access
    const diagram = await db.diagram.findUnique({
        where: { id: diagramId },
        include: {
            creator: {
                select: { id: true, name: true, avatar: true },
            },
            workspace: {
                select: { id: true, name: true },
            },
            versions: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
            comments: {
                where: { parentId: null },
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true },
                    },
                    replies: {
                        include: {
                            user: {
                                select: { id: true, name: true, avatar: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            collaborators: true,
        },
    })

    if (!diagram) {
        return NextResponse.json({ error: 'Diagram not found' }, { status: 404 })
    }

    // If diagram is public, allow access
    if (diagram.isPublic) {
        return NextResponse.json(diagram)
    }

    // Otherwise, require authentication
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check workspace membership
    const member = await db.workspaceMember.findFirst({
        where: {
            workspaceId: diagram.workspaceId,
            userId: session.user.id,
        },
    })

    if (!member) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(diagram)
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ diagramId: string }> }
) {
    const session = await auth()
    const { diagramId } = await params

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const diagram = await db.diagram.findUnique({
        where: { id: diagramId },
        select: {
            id: true,
            workspaceId: true,
            content: true,
            updatedAt: true,
        },
    })

    if (!diagram) {
        return NextResponse.json({ error: 'Diagram not found' }, { status: 404 })
    }

    // Check workspace membership with edit rights
    const member = await db.workspaceMember.findFirst({
        where: {
            workspaceId: diagram.workspaceId,
            userId: session.user.id,
            role: { in: ['ADMIN', 'EDITOR'] },
        },
    })

    if (!member) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { 
        title, 
        content, 
        isPublic, 
        isFavorite, 
        isArchived, 
        folderId, 
        thumbnail, 
        createVersion,
    } = body

    // Auto-versioning: Create version every 10 minutes or on explicit request
    if (content !== undefined && diagram.content) {
        const lastVersion = await db.version.findFirst({
            where: { diagramId },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
        })

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
        const shouldCreateVersion = createVersion || !lastVersion || lastVersion.createdAt < tenMinutesAgo

        if (shouldCreateVersion) {
            // Create version in background (don't await)
            db.version.create({
                data: {
                    diagramId,
                    content: diagram.content,
                    createdBy: session.user.id,
                    description: createVersion ? 'Manual save' : 'Auto-save',
                },
            }).catch(err => console.error('Version creation failed:', err))
        }
    }

    // Update diagram
    const updatedDiagram = await db.diagram.update({
        where: { id: diagramId },
        data: {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(isPublic !== undefined && { isPublic }),
            ...(isFavorite !== undefined && { isFavorite }),
            ...(isArchived !== undefined && { isArchived }),
            ...(folderId !== undefined && { folderId }),
            ...(thumbnail !== undefined && { thumbnail }),
        },
        select: {
            id: true,
            title: true,
            content: true,
            updatedAt: true,
            isPublic: true,
            isFavorite: true,
            isArchived: true,
        },
    })

    return NextResponse.json(updatedDiagram)
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ diagramId: string }> }
) {
    const session = await auth()
    const { diagramId } = await params

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const diagram = await db.diagram.findUnique({
        where: { id: diagramId },
    })

    if (!diagram) {
        return NextResponse.json({ error: 'Diagram not found' }, { status: 404 })
    }

    // Check workspace membership with admin rights or diagram creator
    const member = await db.workspaceMember.findFirst({
        where: {
            workspaceId: diagram.workspaceId,
            userId: session.user.id,
        },
    })

    if (!member || (member.role !== 'ADMIN' && diagram.creatorId !== session.user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.diagram.delete({
        where: { id: diagramId },
    })

    return NextResponse.json({ success: true })
}
