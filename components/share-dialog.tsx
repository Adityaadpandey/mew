'use client'

import { useState } from 'react'
import {
  Copy,
  Link,
  Mail,
  Globe,
  Lock,
  Users,
  Check,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SharedUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'editor' | 'commenter' | 'viewer'
}

const mockSharedUsers: SharedUser[] = [
  { id: '1', name: 'You', email: 'you@example.com', role: 'owner' },
  { id: '2', name: 'Alice Chen', email: 'alice@example.com', role: 'editor' },
  { id: '3', name: 'Bob Smith', email: 'bob@example.com', role: 'viewer' },
]

const roleLabels = {
  owner: 'Owner',
  editor: 'Can edit',
  commenter: 'Can comment',
  viewer: 'Can view',
}

interface ShareDialogProps {
  children: React.ReactNode
}

export function ShareDialog({ children }: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [visibility, setVisibility] = useState<'private' | 'workspace' | 'public'>('private')

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = () => {
    if (email) {
      // Handle invite logic
      setEmail('')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>
            Invite people to collaborate or share a link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite by email */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleInvite} disabled={!email}>
              <Mail className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>

          {/* Shared users list */}
          <div className="space-y-2">
            <p className="text-sm font-medium">People with access</p>
            <div className="space-y-2">
              {mockSharedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'owner' ? (
                    <span className="text-sm text-muted-foreground">Owner</span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          {roleLabels[user.role]}
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Can edit</DropdownMenuItem>
                        <DropdownMenuItem>Can comment</DropdownMenuItem>
                        <DropdownMenuItem>Can view</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Visibility settings */}
          <div className="space-y-2">
            <p className="text-sm font-medium">General access</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  {visibility === 'private' && <Lock className="h-4 w-4" />}
                  {visibility === 'workspace' && <Users className="h-4 w-4" />}
                  {visibility === 'public' && <Globe className="h-4 w-4" />}
                  <span className="flex-1 text-left">
                    {visibility === 'private' && 'Only people with access'}
                    {visibility === 'workspace' && 'Anyone in workspace'}
                    {visibility === 'public' && 'Anyone with the link'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuItem onClick={() => setVisibility('private')}>
                  <Lock className="mr-2 h-4 w-4" />
                  <div>
                    <p className="font-medium">Restricted</p>
                    <p className="text-xs text-muted-foreground">
                      Only people with access can open
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVisibility('workspace')}>
                  <Users className="mr-2 h-4 w-4" />
                  <div>
                    <p className="font-medium">Workspace</p>
                    <p className="text-xs text-muted-foreground">
                      Anyone in the workspace can access
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVisibility('public')}>
                  <Globe className="mr-2 h-4 w-4" />
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-xs text-muted-foreground">
                      Anyone with the link can view
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator />

          {/* Copy link */}
          <div className="flex gap-2">
            <Input
              value={typeof window !== 'undefined' ? window.location.href : ''}
              readOnly
              className="flex-1 text-sm"
            />
            <Button variant="outline" onClick={handleCopyLink}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
