import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'sent' | 'received' | null

    let invitations

    if (type === 'sent') {
      invitations = await db.invitation.findMany({
        where: { senderId: session.user.id },
        include: {
          workspace: { select: { name: true, icon: true } },
          project: { select: { name: true } },
          receiver: { select: { name: true, email: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // Received invitations
      invitations = await db.invitation.findMany({
        where: {
          OR: [
            { email: session.user.email! },
            { receiverId: session.user.id },
          ],
          status: 'PENDING',
        },
        include: {
          workspace: { select: { name: true, icon: true } },
          project: { select: { name: true } },
          sender: { select: { name: true, email: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, type, workspaceId, projectId, role } = body

    if (!email || !type) {
      return NextResponse.json({ error: 'Email and type required' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    // Check if already a member
    if (type === 'WORKSPACE' && workspaceId) {
      if (existingUser) {
        const existingMember = await db.workspaceMember.findUnique({
          where: {
            userId_workspaceId: {
              userId: existingUser.id,
              workspaceId,
            },
          },
        })
        if (existingMember) {
          return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
        }
      }
    } else if (type === 'PROJECT' && projectId) {
      if (existingUser) {
        const existingMember = await db.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: existingUser.id,
              projectId,
            },
          },
        })
        if (existingMember) {
          return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
        }
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        status: 'PENDING',
        ...(workspaceId && { workspaceId }),
        ...(projectId && { projectId }),
      },
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent' }, { status: 400 })
    }

    // Create invitation
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const invitation = await db.invitation.create({
      data: {
        email,
        token,
        type,
        role: role || 'EDITOR',
        senderId: session.user.id,
        receiverId: existingUser?.id,
        workspaceId,
        projectId,
        expiresAt,
      },
      include: {
        workspace: { select: { name: true, icon: true } },
        project: { select: { name: true } },
        sender: { select: { name: true, email: true, image: true } },
      },
    })

    // Create notification for receiver if they exist
    if (existingUser) {
      await db.notification.create({
        data: {
          userId: existingUser.id,
          type: type === 'WORKSPACE' ? 'WORKSPACE_INVITE' : 'INVITATION',
          title: `Invitation to ${type === 'WORKSPACE' ? invitation.workspace?.name : invitation.project?.name}`,
          message: `${session.user.name} invited you to join`,
          link: `/invitations/${invitation.id}`,
          metadata: { invitationId: invitation.id },
        },
      })
    }

    // TODO: Send email notification

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Failed to create invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
