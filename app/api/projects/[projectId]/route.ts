
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

    const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
            workspace: {
                include: {
                    members: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
            _count: {
                select: { documents: true, tasks: true },
            },
        },
    })

    if (!project) return new NextResponse('Project not found', { status: 404 })

    // Verify access
    const hasAccess = project.workspace.members.some(m => m.userId === session.user.id)
    if (!hasAccess) return new NextResponse('Forbidden', { status: 403 })

    return NextResponse.json(project)
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

    const { projectId } = await params
    const body = await req.json()
    const { name, description } = body

    const project = await db.project.findUnique({
        where: { id: projectId },
        include: { workspace: { include: { members: true } } },
    })

    if (!project) return new NextResponse('Project not found', { status: 404 })

    // Verify access (only admins/editors)
    const member = project.workspace.members.find(m => m.userId === session.user.id)
    if (!member || !['ADMIN', 'EDITOR'].includes(member.role)) {
        return new NextResponse('Forbidden', { status: 403 })
    }

    const updatedProject = await db.project.update({
        where: { id: projectId },
        data: {
            name,
            description,
        },
    })

    return NextResponse.json(updatedProject)
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

    const { projectId } = await params

    const project = await db.project.findUnique({
        where: { id: projectId },
        include: { workspace: { include: { members: true } } },
    })

    if (!project) return new NextResponse('Project not found', { status: 404 })

    // Verify access (only admins)
    const member = project.workspace.members.find(m => m.userId === session.user.id)
    if (!member || member.role !== 'ADMIN') {
        return new NextResponse('Forbidden', { status: 403 })
    }

    await db.project.delete({
        where: { id: projectId },
    })

    return new NextResponse(null, { status: 204 })
}
