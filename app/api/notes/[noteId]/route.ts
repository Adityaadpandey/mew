import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { noteId } = await params
    const { content, color, position } = await req.json()

    const note = await db.note.update({
      where: { id: noteId },
      data: {
        ...(content !== undefined && { content }),
        ...(color !== undefined && { color }),
        ...(position !== undefined && { position }),
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Failed to update note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { noteId } = await params

    await db.note.delete({
      where: { id: noteId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
