'use client'

import { NotificationsBell } from '@/components/collaboration/notifications-bell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent,
    DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useApp } from '@/lib/app-context'
import { useDocumentStore, useSidebarStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
    Check,
    ChevronDown,
    Command,
    Loader2,
    LogOut,
    Monitor,
    Moon,
    Plus,
    Search,
    Settings,
    Share2,
    Sparkles,
    Sun,
    User
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'

const WORKSPACE_ICONS = ['🏠', '💼', '🚀', '📁', '🎨', '💡', '⚡', '🔥', '🌟', '📊', '🎯', '🛠️']

export function TopNavigation() {
  const { user, workspaces, currentWorkspace, setCurrentWorkspace, refreshWorkspaces } = useApp()
  const { currentDocument, updateTitle, isSaving } = useDocumentStore()
  const { setRightSidebarTab } = useSidebarStore()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const pathname = usePathname()

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newWorkspaceIcon, setNewWorkspaceIcon] = useState('🏠')
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)

  const isProjectPage = pathname?.startsWith('/projects/')
  const displayTitle = useMemo(() => currentDocument?.title || 'Untitled', [currentDocument?.title])

  const handleTitleSubmit = async () => {
    if (titleValue.trim() && currentDocument?.id && titleValue.trim() !== currentDocument.title) {
      updateTitle(titleValue.trim())
      try {
        await fetch(`/api/documents/${currentDocument.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titleValue.trim() }),
        })
      } catch (error) { console.error('Failed to save title:', error) }
    }
    setEditingTitle(false)
  }

  const startEditing = () => {
    setTitleValue(displayTitle)
    setEditingTitle(true)
  }

  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    setIsCreatingWorkspace(true)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName.trim(), icon: newWorkspaceIcon }),
      })
      if (res.ok) {
        const newWorkspace = await res.json()
        await refreshWorkspaces()
        setCurrentWorkspace(newWorkspace)
        setShowCreateWorkspace(false)
        setNewWorkspaceName('')
        setNewWorkspaceIcon('🏠')
      }
    } catch (error) {
      console.error('Failed to create workspace:', error)
    } finally {
      setIsCreatingWorkspace(false)
    }
  }

  return (
    <TooltipProvider>
      <header className={cn(
        "flex items-center justify-between h-14 px-4 border-b transition-colors",
        isDark ? "bg-background border-border/40" : "bg-white border-slate-200"
      )}>
        {/* Left Section */}
        <div className="flex items-center gap-2">
          {/* Workspace Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("h-9 gap-2 px-2 text-sm font-medium", isDark && "hover:bg-neutral-800")}>
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#C10801] to-[#F16001]">
                    <span className="text-[10px] font-bold text-white">{currentWorkspace?.name?.charAt(0) || 'M'}</span>
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline-block">{currentWorkspace?.name || 'Workspace'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={cn("w-56", isDark && "bg-neutral-900 border-neutral-700")}>
              {workspaces.map((ws) => (
                <DropdownMenuItem key={ws.id} onClick={() => setCurrentWorkspace(ws)}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{ws.icon || '📁'}</span>
                    <span>{ws.name}</span>
                    {ws.id === currentWorkspace?.id && <Check className="h-4 w-4 ml-auto text-orange-500" />}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className={isDark ? "bg-neutral-700" : ""} />
              <DropdownMenuItem onClick={() => setShowCreateWorkspace(true)}><Plus className="mr-2 h-4 w-4" /> Create workspace</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border/50 mx-1 hidden sm:block" />

          {/* Search */}
          <Button variant="ghost" size="sm" className={cn("h-9 gap-2 text-muted-foreground", isDark ? "hover:bg-neutral-800" : "")} onClick={openSearch}>
            <Search className="h-4 w-4" />
            <span className="text-sm hidden md:inline">Search...</span>
            <kbd className={cn(
              "hidden md:flex h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px]",
              isDark ? "border-neutral-700 bg-neutral-800" : "border-slate-200 bg-slate-100"
            )}>
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        </div>

        {/* Center Section - Document Title (Only when viewing document) */}
        {currentDocument && !isProjectPage && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 flex items-center gap-2 hidden lg:flex">
            {editingTitle ? (
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className={cn("h-7 w-48 text-center text-sm font-medium", isDark && "bg-neutral-800 border-neutral-700")}
                autoFocus
              />
            ) : (
              <button
                onClick={startEditing}
                className={cn("rounded px-2 py-1 text-sm font-medium transition-colors max-w-[200px] truncate", isDark ? "hover:bg-neutral-800" : "hover:bg-slate-100")}
              >
                {displayTitle}
              </button>
            )}

            {isSaving && (
              <div className={cn("flex items-center gap-1 text-xs", isDark ? "text-neutral-500" : "text-slate-400")}>
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-1">
          <NotificationsBell />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("h-9 w-9", isDark && "hover:bg-neutral-800")} onClick={() => setRightSidebarTab('ai')}>
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI Assistant</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("h-9 w-9", isDark && "hover:bg-neutral-800")}>
                {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-700" : ""}>
              <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
                <DropdownMenuRadioItem value="light"><Sun className="mr-2 h-4 w-4" /> Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark"><Moon className="mr-2 h-4 w-4" /> Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system"><Monitor className="mr-2 h-4 w-4" /> System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {currentDocument && !isProjectPage && (
            <Button size="sm" className="h-8 gap-1.5 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002] ml-1">
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full ml-1">
                <Avatar className="h-7 w-7 border border-border/50">
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback className="text-xs">{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn("w-56", isDark && "bg-neutral-900 border-neutral-700")}>
              <div className="px-2 py-1.5">
                <p className={cn("text-sm font-medium", isDark && "text-white")}>{user?.name || 'Guest'}</p>
                <p className={cn("text-xs", isDark ? "text-neutral-400" : "text-slate-500")}>{user?.email}</p>
              </div>
              <DropdownMenuSeparator className={isDark ? "bg-neutral-700" : ""} />
              <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
              <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator className={isDark ? "bg-neutral-700" : ""} />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Create Workspace Dialog */}
        <Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
          <DialogContent className={cn("sm:max-w-md", isDark && "bg-neutral-900 border-neutral-700")}>
            <DialogHeader>
              <DialogTitle className={isDark ? "text-white" : ""}>Create Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isDark ? "text-neutral-200" : "text-slate-700")}>
                  Workspace Name
                </label>
                <Input
                  placeholder="My Workspace"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className={isDark ? "bg-neutral-800 border-neutral-700" : ""}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", isDark ? "text-neutral-200" : "text-slate-700")}>
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewWorkspaceIcon(icon)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                        newWorkspaceIcon === icon
                          ? "bg-gradient-to-br from-[#C10801] to-[#F16001] ring-2 ring-orange-500"
                          : isDark ? "bg-neutral-800 hover:bg-neutral-700" : "bg-slate-100 hover:bg-slate-200"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowCreateWorkspace(false)}>Cancel</Button>
              <Button
                onClick={handleCreateWorkspace}
                disabled={!newWorkspaceName.trim() || isCreatingWorkspace}
                className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002]"
              >
                {isCreatingWorkspace ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
    </TooltipProvider>
  )
}
