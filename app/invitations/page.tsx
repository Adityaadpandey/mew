'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { SearchModal } from '@/components/search-modal'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import {
  Check,
  Clock,
  Loader2,
  Mail,
  X,
  Inbox,
  Send,
  Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useApp } from '@/lib/app-context'

interface Invitation {
  id: string
  email: string
  type: 'WORKSPACE' | 'PROJECT'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  role: string
  createdAt: string
  expiresAt: string
  workspace?: { name: string; icon: string | null }
  project?: { name: string }
  sender?: { name: string | null; email: string | null; image: string | null }
  receiver?: { name: string | null; email: string | null; image: string | null }
}

export default function InvitationsPage() {
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([])
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { refreshWorkspaces, refreshDocuments } = useApp()

  const fetchInvitations = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        fetch('/api/invitations?type=received'),
        fetch('/api/invitations?type=sent'),
      ])

      if (receivedRes.ok) {
        const data = await receivedRes.json()
        setReceivedInvitations(data)
      }

      if (sentRes.ok) {
        const data = await sentRes.json()
        setSentInvitations(data)
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId)
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })

      if (res.ok) {
        toast.success('Invitation accepted! Refreshing...')
        // Refresh workspaces to get the new workspace access
        await refreshWorkspaces()
        // Refresh documents and projects
        await refreshDocuments()
        // Small delay to ensure data is loaded
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to accept invitation')
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      toast.error('Failed to accept invitation')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (invitationId: string) => {
    setProcessingId(invitationId)
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      })

      if (res.ok) {
        toast.success('Invitation declined')
        fetchInvitations()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to decline invitation')
      }
    } catch (error) {
      console.error('Failed to decline invitation:', error)
      toast.error('Failed to decline invitation')
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancel = async (invitationId: string) => {
    if (!confirm('Cancel this invitation?')) return

    setProcessingId(invitationId)
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Invitation cancelled')
        fetchInvitations()
      } else {
        toast.error('Failed to cancel invitation')
      }
    } catch (error) {
      console.error('Failed to cancel invitation:', error)
      toast.error('Failed to cancel invitation')
    } finally {
      setProcessingId(null)
    }
  }

  const InvitationCard = ({ invitation, type }: { invitation: Invitation; type: 'received' | 'sent' }) => {
    const isExpired = new Date(invitation.expiresAt) < new Date()
    const isProcessing = processingId === invitation.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-6 rounded-xl border transition-all",
          isDark
            ? "bg-neutral-900/50 border-neutral-800"
            : "bg-white/70 border-slate-200"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                invitation.type === 'WORKSPACE' ? "bg-[#E85002]/10" : "bg-[#F16001]/10"
              )}>
                <Mail className={cn(
                  "h-5 w-5",
                  invitation.type === 'WORKSPACE' ? "text-[#E85002]" : "text-[#F16001]"
                )} />
              </div>
              <div>
                <h3 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>
                  {invitation.type === 'WORKSPACE'
                    ? invitation.workspace?.name
                    : invitation.project?.name}
                </h3>
                <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-500")}>
                  {invitation.type === 'WORKSPACE' ? 'Workspace' : 'Project'} • {invitation.role}
                </p>
              </div>
            </div>

            <p className={cn("text-sm mb-3", isDark ? "text-neutral-400" : "text-slate-600")}>
              {type === 'received' ? (
                <>
                  <span className="font-medium">{invitation.sender?.name || invitation.sender?.email}</span>
                  {' '}invited you to join
                </>
              ) : (
                <>
                  Invited <span className="font-medium">{invitation.receiver?.name || invitation.email}</span>
                </>
              )}
            </p>

            <div className="flex items-center gap-4 text-xs">
              <span className={cn(isDark ? "text-neutral-500" : "text-slate-400")}>
                <Clock className="h-3 w-3 inline mr-1" />
                {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
              </span>
              {isExpired && (
                <span className="text-red-500">
                  Expired
                </span>
              )}
            </div>
          </div>

          {type === 'received' && invitation.status === 'PENDING' && !isExpired && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invitation.id)}
                disabled={isProcessing}
                className={cn(
                  "gap-2",
                  isDark ? "border-neutral-700 hover:bg-neutral-800" : ""
                )}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleAccept(invitation.id)}
                disabled={isProcessing}
                className="gap-2 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Accept
              </Button>
            </div>
          )}

          {type === 'sent' && invitation.status === 'PENDING' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCancel(invitation.id)}
              disabled={isProcessing}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <SearchModal />
      <KeyboardShortcuts />
      <DashboardLayout>
        <div className={cn("flex h-full flex-col", isDark ? "bg-black" : "bg-slate-50")}>
          <div className="px-8 py-6 border-b border-border">
            <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
              Invitations
            </h1>
            <p className={cn("text-sm mt-1", isDark ? "text-neutral-400" : "text-slate-500")}>
              Manage your workspace and project invitations
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="received" className="h-full flex flex-col">
              <div className="px-8 pt-6">
                <TabsList className={cn(isDark ? "bg-neutral-900/50" : "bg-white/70")}>
                  <TabsTrigger value="received" className="gap-2">
                    <Inbox className="h-4 w-4" />
                    Received
                    {receivedInvitations.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#E85002] text-white text-xs">
                        {receivedInvitations.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="gap-2">
                    <Send className="h-4 w-4" />
                    Sent
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="px-8 py-6">
                  <TabsContent value="received" className="m-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : receivedInvitations.length === 0 ? (
                      <div className={cn(
                        "flex flex-col items-center justify-center rounded-2xl py-20",
                        isDark ? "bg-neutral-900/50" : "bg-white/50"
                      )}>
                        <Inbox className={cn("h-16 w-16 mb-4", isDark ? "text-neutral-700" : "text-slate-300")} />
                        <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                          No invitations
                        </h3>
                        <p className={cn("text-sm", isDark ? "text-neutral-500" : "text-slate-500")}>
                          You don&apos;t have any pending invitations
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {receivedInvitations.map((invitation) => (
                          <InvitationCard key={invitation.id} invitation={invitation} type="received" />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sent" className="m-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : sentInvitations.length === 0 ? (
                      <div className={cn(
                        "flex flex-col items-center justify-center rounded-2xl py-20",
                        isDark ? "bg-neutral-900/50" : "bg-white/50"
                      )}>
                        <Send className={cn("h-16 w-16 mb-4", isDark ? "text-neutral-700" : "text-slate-300")} />
                        <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                          No sent invitations
                        </h3>
                        <p className={cn("text-sm", isDark ? "text-neutral-500" : "text-slate-500")}>
                          You haven&apos;t sent any invitations yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentInvitations.map((invitation) => (
                          <InvitationCard key={invitation.id} invitation={invitation} type="sent" />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
