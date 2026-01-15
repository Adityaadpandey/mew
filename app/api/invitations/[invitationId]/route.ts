import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invitationId } = await params
    const body = await request.json()
    const { action } = body // 'accept' or 'decline'

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: {
        workspace: true,
        project: true,
        sender: { select: { name: true } },
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if user is the recipient
    if (invitation.email !== session.user.email && invitation.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      await db.invitation.update({
        where: { id: invitationId },
        data: { status: 'EXPIRED' },
      })
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 })
    }

    // Check if already processed
    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation already processed' }, { status: 400 })
    }

    if (action === 'accept') {
      // Accept invitation
      if (invitation.type === 'WORKSPACE' && invitation.workspaceId) {
        // Add user to workspace
        await db.workspaceMember.create({
          data: {
            userId: session.user.id,
            workspaceId: invitation.workspaceId,
            role: invitation.role,
          },
        })

        // Create notification for sender
        await db.notification.create({
          data: {
            userId: invitation.senderId,
            type: 'WORKSPACE_INVITE',
            title: 'Invitation Accepted',
            message: `${session.user.name} accepted your invitation to ${invitation.workspace?.name}`,
            link: `/workspaces/${invitation.workspaceId}`,
          },
        })
      } else if (invitation.type === 'PROJECT' && invitation.projectId) {
        console.log('[Invitation] Accepting project invitation:', {
          userId: session.user.id,
          projectId: invitation.projectId,
        })

        // Get the project to find its workspace
        const project = await db.project.findUnique({
          where: { id: invitation.projectId },
          select: { workspaceId: true },
        })

        console.log('[Invitation] Project workspace:', project?.workspaceId)

        if (project) {
          // Check if user is already a workspace member
          const existingWorkspaceMember = await db.workspaceMember.findUnique({
            where: {
              userId_workspaceId: {
                userId: session.user.id,
                workspaceId: project.workspaceId,
              },
            },
          })

          console.log('[Invitation] Existing workspace member:', !!existingWorkspaceMember)

          // If not a workspace member, add them as VIEWER
          if (!existingWorkspaceMember) {
            await db.workspaceMember.create({
              data: {
                userId: session.user.id,
                workspaceId: project.workspaceId,
                role: 'VIEWER', // Default workspace role for project members
              },
            })
            console.log('[Invitation] Added user to workspace as VIEWER')
          }

          // Add user to project
          await db.projectMember.create({
            data: {
              userId: session.user.id,
              projectId: invitation.projectId,
              role: 'MEMBER',
            },
          })
          console.log('[Invitation] Added user to project as MEMBER')

          // Create notification for sender
          await db.notification.create({
            data: {
              userId: invitation.senderId,
              type: 'PROJECT_UPDATE',
              title: 'Invitation Accepted',
              message: `${session.user.name} accepted your invitation to ${invitation.project?.name}`,
              link: `/projects/${invitation.projectId}`,
            },
          })
        }
      }

      // Update invitation status
      await db.invitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      })

      return NextResponse.json({ message: 'Invitation accepted' })
    } else if (action === 'decline') {
      // Decline invitation
      await db.invitation.update({
        where: { id: invitationId },
        data: { status: 'DECLINED' },
      })

      // Create notification for sender
      await db.notification.create({
        data: {
          userId: invitation.senderId,
          type: invitation.type === 'WORKSPACE' ? 'WORKSPACE_INVITE' : 'INVITATION',
          title: 'Invitation Declined',
          message: `${session.user.name} declined your invitation`,
        },
      })

      return NextResponse.json({ message: 'Invitation declined' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to process invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invitationId } = await params

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Only sender can delete
    if (invitation.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await db.invitation.delete({
      where: { id: invitationId },
    })

    return NextResponse.json({ message: 'Invitation deleted' })
  } catch (error) {
    console.error('Failed to delete invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
