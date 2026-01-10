import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { commentId } = await params
    const { content, resolved } = await req.json()

    const comment = await db.comment.update({
      where: { id: commentId },
      data: {
        ...(content !== undefined && { content }),
        ...(resolved !== undefined && { resolved }),
      },
      include: { user: { select: { id: true, name: true, image: true } }, replies: true },
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

    await db.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
