import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { commentId } = await params
    const { content, resolved } = await req.json()

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Verify ownership for content edits
    if (content !== undefined) {
      const existingComment = await db.comment.findUnique({
        where: { id: commentId },
      })
      if (!existingComment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
      }
      if (existingComment.userId !== user.id) {
        return NextResponse.json({ error: 'Not authorized to edit this comment' }, { status: 403 })
      }
    }

    const comment = await db.comment.update({
      where: { id: commentId },
      data: {
        ...(content !== undefined && { content }),
        ...(resolved !== undefined && { resolved }),
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { commentId } = await params

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Verify ownership
    const existingComment = await db.comment.findUnique({
      where: { id: commentId },
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (existingComment.userId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 })
    }

    // Delete replies first (cascade), then the comment
    await db.comment.deleteMany({
      where: { parentId: commentId },
    })

    await db.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
