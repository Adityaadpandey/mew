import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, memberId } = await params
    const body = await request.json()
    const { role } = body

    // Check if requester is admin or owner
    const requesterMember = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    })

    if (!requesterMember || (requesterMember.role !== 'ADMIN' && requesterMember.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const member = await db.projectMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Failed to update project member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, memberId } = await params

    const member = await db.projectMember.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if requester is admin/owner or removing themselves
    const requesterMember = await db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    })

    const isSelf = member.userId === session.user.id
    const hasPermission = requesterMember && (requesterMember.role === 'ADMIN' || requesterMember.role === 'OWNER')

    if (!isSelf && !hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Prevent removing the last owner
    if (member.role === 'OWNER') {
      const ownerCount = await db.projectMember.count({
        where: {
          projectId,
          role: 'OWNER',
        },
      })

      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last owner' }, { status: 400 })
      }
    }

    await db.projectMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ message: 'Member removed' })
  } catch (error) {
    console.error('Failed to remove project member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
