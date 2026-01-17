'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  Mail,
  Shield,
  Users,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Building2,
  FolderKanban
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
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
  workspace?: { id: string; name: string; icon: string | null }
  project?: { id: string; name: string; description: string | null }
  sender?: { name: string | null; email: string | null; image: string | null }
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const invitationId = params.invitationId as string
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { refreshWorkspaces, refreshDocuments } = useApp()

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await fetch(`/api/invitations/${invitationId}`)
        if (res.ok) {
          const data = await res.json()
          setInvitation(data)
        } else {
          toast.error('Invitation not found')
          router.push('/invitations')
        }
      } catch (error) {
        console.error('Failed to fetch invitation:', error)
        toast.error('Failed to load invitation')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitation()
  }, [invitationId, router])

  const handleAccept = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })

      if (res.ok) {
        toast.success('Invitation accepted! Redirecting...')
        await refreshWorkspaces()
        await refreshDocuments()
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to accept invitation')
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      toast.error('Failed to accept invitation')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      })

      if (res.ok) {
        toast.success('Invitation declined')
        router.push('/invitations')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to decline invitation')
      }
    } catch (error) {
      console.error('Failed to decline invitation:', error)
      toast.error('Failed to decline invitation')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("flex h-screen items-center justify-center relative overflow-hidden", isDark ? "bg-black" : "bg-slate-50")}>
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#E85002]/20 to-[#F16001]/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#C10801]/20 to-[#E85002]/20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <Loader2 className="h-12 w-12 animate-spin text-[#E85002]" />
        </motion.div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className={cn("flex h-screen items-center justify-center relative overflow-hidden", isDark ? "bg-black" : "bg-slate-50")}>
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#E85002]/10 to-[#F16001]/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <AlertCircle className={cn("h-20 w-20 mx-auto mb-6", isDark ? "text-neutral-700" : "text-slate-300")} />
          </motion.div>
          <h2 className={cn("text-2xl font-bold mb-3", isDark ? "text-white" : "text-slate-900")}>
            Invitation not found
          </h2>
          <p className={cn("text-sm mb-6", isDark ? "text-neutral-400" : "text-slate-600")}>
            This invitation may have been removed or expired
          </p>
          <Button 
            onClick={() => router.push('/invitations')} 
            className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]"
          >
            View all invitations
          </Button>
        </motion.div>
      </div>
    )
  }

  const isExpired = new Date(invitation.expiresAt) < new Date()
  const canRespond = invitation.status === 'PENDING' && !isExpired

  return (
    <div className={cn("min-h-screen relative overflow-hidden", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#E85002]/10 to-[#F16001]/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#C10801]/10 to-[#E85002]/10 blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Header */}
      <div className={cn(
        "border-b px-6 py-4 backdrop-blur-sm relative z-10",
        isDark ? "bg-neutral-950/80 border-neutral-800" : "bg-white/80 border-slate-200"
      )}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/invitations')}
            className="gap-2 hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to invitations
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className={cn(
            "overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300",
            isDark ? "bg-neutral-900/90 border-neutral-800 backdrop-blur-xl" : "bg-white/90 border-slate-200 backdrop-blur-xl"
          )}>
            {/* Header with gradient and animated elements */}
            <div className="h-40 bg-gradient-to-br from-[#C10801] via-[#E85002] to-[#F16001] relative overflow-hidden">
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Floating particles */}
              <motion.div
                className="absolute top-4 right-8 w-2 h-2 rounded-full bg-white/40"
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-12 right-20 w-1.5 h-1.5 rounded-full bg-white/30"
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute top-8 right-32 w-1 h-1 rounded-full bg-white/50"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 0.9, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />

              <div className="absolute inset-0 bg-black/5" />
              <div className="absolute bottom-6 left-6 right-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg"
                  >
                    {invitation.type === 'WORKSPACE' ? (
                      <Building2 className="h-10 w-10 text-white" />
                    ) : (
                      <FolderKanban className="h-10 w-10 text-white" />
                    )}
                  </motion.div>
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 mb-1"
                    >
                      <Sparkles className="h-4 w-4 text-white/80" />
                      <span className="text-sm font-medium text-white/90">
                        You've been invited!
                      </span>
                    </motion.div>
                    <motion.h1
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-bold text-white drop-shadow-lg"
                    >
                      {invitation.type === 'WORKSPACE' ? 'Workspace' : 'Project'} Invitation
                    </motion.h1>
                  </div>
                </motion.div>
              </div>
            </div>

            <CardContent className="p-8">
              {/* Status Badge */}
              <AnimatePresence mode="wait">
                {invitation.status !== 'PENDING' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
                    {invitation.status === 'ACCEPTED' && (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-3 text-green-500 bg-green-500/10 px-5 py-3 rounded-xl border border-green-500/20"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">Invitation Accepted</span>
                      </motion.div>
                    )}
                    {invitation.status === 'DECLINED' && (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-3 text-red-500 bg-red-500/10 px-5 py-3 rounded-xl border border-red-500/20"
                      >
                        <X className="h-5 w-5" />
                        <span className="font-semibold">Invitation Declined</span>
                      </motion.div>
                    )}
                    {invitation.status === 'EXPIRED' && (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-3 text-orange-500 bg-orange-500/10 px-5 py-3 rounded-xl border border-orange-500/20"
                      >
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">Invitation Expired</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {isExpired && invitation.status === 'PENDING' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-3 text-red-500 bg-red-500/10 px-5 py-3 rounded-xl border border-red-500/20"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">This invitation has expired</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Invitation Details */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className={cn("text-3xl font-bold mb-2 bg-gradient-to-r from-[#C10801] to-[#F16001] bg-clip-text text-transparent", isDark ? "" : "")}>
                    {invitation.type === 'WORKSPACE'
                      ? invitation.workspace?.name
                      : invitation.project?.name}
                  </h2>
                  {invitation.project?.description && (
                    <p className={cn("text-base leading-relaxed", isDark ? "text-neutral-400" : "text-slate-600")}>
                      {invitation.project.description}
                    </p>
                  )}
                </motion.div>

                <div className="grid gap-3">
                  {/* Sender */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-xl border transition-all duration-200",
                      isDark 
                        ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800/70 hover:border-neutral-600" 
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center",
                      isDark ? "bg-neutral-700/50" : "bg-white"
                    )}>
                      {invitation.sender?.image ? (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={invitation.sender.image} />
                          <AvatarFallback className="bg-gradient-to-br from-[#E85002] to-[#F16001] text-white">
                            {invitation.sender?.name?.[0] || invitation.sender?.email?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Users className={cn("h-6 w-6", isDark ? "text-neutral-400" : "text-slate-500")} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-xs font-medium uppercase tracking-wider mb-1", isDark ? "text-neutral-400" : "text-slate-500")}>
                        Invited by
                      </p>
                      <p className={cn("text-base font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {invitation.sender?.name || invitation.sender?.email}
                      </p>
                    </div>
                  </motion.div>

                  {/* Role */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-xl border transition-all duration-200",
                      isDark 
                        ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800/70 hover:border-neutral-600" 
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center",
                      "bg-gradient-to-br from-[#E85002]/10 to-[#F16001]/10 border",
                      isDark ? "border-[#E85002]/20" : "border-[#E85002]/20"
                    )}>
                      <Shield className="h-6 w-6 text-[#E85002]" />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-xs font-medium uppercase tracking-wider mb-1", isDark ? "text-neutral-400" : "text-slate-500")}>
                        Role
                      </p>
                      <p className={cn("text-base font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {invitation.role}
                      </p>
                    </div>
                  </motion.div>

              

                  {/* Timing */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-xl border transition-all duration-200",
                      isDark 
                        ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800/70 hover:border-neutral-600" 
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center",
                      "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border",
                      isDark ? "border-amber-500/20" : "border-amber-500/20"
                    )}>
                      <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-xs font-medium uppercase tracking-wider mb-1", isDark ? "text-neutral-400" : "text-slate-500")}>
                        Sent
                      </p>
                      <p className={cn("text-base font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Actions */}
                {canRespond && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex gap-4 pt-6"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        onClick={handleDecline}
                        disabled={isProcessing}
                        className={cn(
                          "w-full gap-2 h-12 text-base font-semibold transition-all duration-200",
                          isDark 
                            ? "border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600" 
                            : "hover:bg-slate-100 hover:border-slate-400"
                        )}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                        Decline
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={handleAccept}
                        disabled={isProcessing}
                        className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Check className="h-5 w-5" />
                        )}
                        Accept Invitation
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {!canRespond && invitation.status === 'PENDING' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="pt-6"
                  >
                    <Button
                      variant="outline"
                      onClick={() => router.push('/invitations')}
                      className="w-full h-12 text-base font-semibold"
                    >
                      View all invitations
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
