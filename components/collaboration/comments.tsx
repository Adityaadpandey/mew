'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AtSign,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Reply,
  Send,
  Smile,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: Comment[]
  parentId?: string | null
  mentions?: string[]
}

interface CommentsProps {
  targetType: 'task' | 'document' | 'project'
  targetId: string
  currentUserId: string
}

export function Comments({ targetType, targetId, currentUserId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    fetchComments()
  }, [targetType, targetId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (parentId?: string) => {
    const content = parentId ? newComment : newComment.trim()
    if (!content) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          content,
          parentId,
        }),
      })

      if (res.ok) {
        setNewComment('')
        setReplyingTo(null)
        fetchComments()
        toast.success('Comment added')
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })

      if (res.ok) {
        setEditingId(null)
        setEditContent('')
        fetchComments()
        toast.success('Comment updated')
      } else {
        toast.error('Failed to update comment')
      }
    } catch (error) {
      toast.error('Failed to update comment')
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchComments()
        toast.success('Comment deleted')
      } else {
        toast.error('Failed to delete comment')
      }
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwner = comment.user.id === currentUserId
    const isEditing = editingId === comment.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'group',
          isReply && 'ml-10 pl-4 border-l-2',
          isReply && (isDark ? 'border-zinc-800' : 'border-slate-200')
        )}
      >
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.user.image || undefined} />
            <AvatarFallback className={isDark ? 'bg-zinc-700' : 'bg-slate-200'}>
              {comment.user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  {comment.user.name || 'Anonymous'}
                </span>
                <span className={cn(
                  'text-xs',
                  isDark ? 'text-zinc-500' : 'text-slate-400'
                )}>
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.updatedAt !== comment.createdAt && (
                  <span className={cn(
                    'text-xs',
                    isDark ? 'text-zinc-600' : 'text-slate-400'
                  )}>
                    (edited)
                  </span>
                )}
              </div>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                        isDark ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                      )}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={isDark ? 'bg-zinc-900 border-zinc-800' : ''}>
                    <DropdownMenuItem onClick={() => startEdit(comment)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={cn(
                    'min-h-[80px] resize-none',
                    isDark ? 'bg-zinc-800 border-zinc-700' : ''
                  )}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(comment.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null)
                      setEditContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className={cn(
                  'text-sm mt-1 whitespace-pre-wrap',
                  isDark ? 'text-zinc-300' : 'text-slate-600'
                )}>
                  {comment.content}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className={cn(
                      'flex items-center gap-1 text-xs transition-colors',
                      isDark
                        ? 'text-zinc-500 hover:text-zinc-300'
                        : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    <Reply className="h-3 w-3" />
                    Reply
                  </button>
                </div>
              </>
            )}

            {/* Reply input */}
            <AnimatePresence>
              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={`Reply to ${comment.user.name}...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className={cn(
                        'min-h-[60px] resize-none flex-1',
                        isDark ? 'bg-zinc-800 border-zinc-700' : ''
                      )}
                    />
                    <Button
                      size="icon"
                      onClick={() => handleSubmit(comment.id)}
                      disabled={!newComment.trim() || isSubmitting}
                      className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002]"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Card className={cn(
      'overflow-hidden',
      isDark ? 'bg-zinc-900/50 border-zinc-800' : ''
    )}>
      <CardHeader className={cn(
        'pb-3 border-b',
        isDark ? 'border-zinc-800' : 'border-slate-100'
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-lg',
            isDark ? 'bg-orange-500/10' : 'bg-orange-50'
          )}>
            <MessageCircle className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Discussion</CardTitle>
            <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* New comment input */}
        <div className={cn('p-4 border-b', isDark ? 'border-zinc-800' : 'border-slate-100')}>
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              placeholder="Write a comment... Use @ to mention someone"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit()
                }
              }}
              className={cn(
                'min-h-[80px] resize-none flex-1',
                isDark ? 'bg-zinc-800 border-zinc-700' : ''
              )}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <AtSign className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => handleSubmit()}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Comment
            </Button>
          </div>
        </div>

        {/* Comments list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className={cn('h-10 w-10 mb-2', isDark ? 'text-zinc-700' : 'text-slate-300')} />
            <p className={cn('text-sm font-medium', isDark ? 'text-zinc-400' : 'text-slate-500')}>
              No comments yet
            </p>
            <p className={cn('text-xs mt-1', isDark ? 'text-zinc-600' : 'text-slate-400')}>
              Be the first to start the discussion
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="p-4 space-y-4">
              {comments.filter(c => !c.parentId).map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
