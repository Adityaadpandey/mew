'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { Loader2, Mail, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface InviteDialogProps {
  type: 'workspace' | 'project'
  targetId: string
  targetName: string
  onInviteSent?: () => void
}

export function InviteDialog({ type, targetId, targetName, onInviteSent }: InviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('EDITOR')
  const [isInviting, setIsInviting] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const handleInvite = async () => {
    if (!email.trim()) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsInviting(true)
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type: type.toUpperCase(),
          [type === 'workspace' ? 'workspaceId' : 'projectId']: targetId,
          role,
        }),
      })

      if (res.ok) {
        toast.success(`Invitation sent to ${email}`)
        setOpen(false)
        setEmail('')
        setRole('EDITOR')
        onInviteSent?.()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
      toast.error('Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-[500px]", isDark && "bg-neutral-900 border-neutral-800")}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className={isDark ? "text-white" : ""}>
                Invite to {targetName}
              </DialogTitle>
              <DialogDescription>
                Send an invitation to collaborate on this {type}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              className={isDark ? "bg-neutral-800 border-neutral-700" : ""}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className={isDark ? "bg-neutral-800 border-neutral-700" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
                <SelectItem value="ADMIN">Admin - Full access</SelectItem>
                <SelectItem value="EDITOR">Editor - Can edit and comment</SelectItem>
                <SelectItem value="COMMENTER">Commenter - Can only comment</SelectItem>
                <SelectItem value="VIEWER">Viewer - Read-only access</SelectItem>
              </SelectContent>
            </Select>
            <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
              {role === 'ADMIN' && 'Can manage members and settings'}
              {role === 'EDITOR' && 'Can create and edit content'}
              {role === 'COMMENTER' && 'Can view and add comments'}
              {role === 'VIEWER' && 'Can only view content'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isInviting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!email.trim() || isInviting}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {isInviting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
