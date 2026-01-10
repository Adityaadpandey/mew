'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  History,
  RotateCcw,
  Eye,
  GitCompare,
  ChevronRight,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Version {
  id: string
  createdAt: Date
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
  description?: string
  changes: number
}

const mockVersions: Version[] = [
  {
    id: 'v1',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    createdBy: { id: '1', name: 'You' },
    description: 'Added authentication flow',
    changes: 5,
  },
  {
    id: 'v2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdBy: { id: '2', name: 'Alice Chen' },
    description: 'Updated database schema',
    changes: 3,
  },
  {
    id: 'v3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    createdBy: { id: '1', name: 'You' },
    description: 'Refactored API endpoints',
    changes: 8,
  },
  {
    id: 'v4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdBy: { id: '3', name: 'Bob Smith' },
    description: 'Initial diagram',
    changes: 12,
  },
  {
    id: 'v5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    createdBy: { id: '2', name: 'Alice Chen' },
    description: 'Created document',
    changes: 1,
  },
]

interface VersionHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestore?: (versionId: string) => void
}

export function VersionHistory({ open, onOpenChange, onRestore }: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareVersions, setCompareVersions] = useState<string[]>([])

  const handleVersionClick = (versionId: string) => {
    if (compareMode) {
      if (compareVersions.includes(versionId)) {
        setCompareVersions(compareVersions.filter((v) => v !== versionId))
      } else if (compareVersions.length < 2) {
        setCompareVersions([...compareVersions, versionId])
      }
    } else {
      setSelectedVersion(versionId === selectedVersion ? null : versionId)
    }
  }

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore?.(selectedVersion)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[500px] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </DialogTitle>
              <DialogDescription>
                View and restore previous versions of this document
              </DialogDescription>
            </div>
            <Button
              variant={compareMode ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode)
                setCompareVersions([])
              }}
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(500px-80px)]">
          {/* Version list */}
          <ScrollArea className="w-80 border-r">
            <div className="p-4 space-y-1">
              {mockVersions.map((version, index) => {
                const isSelected = selectedVersion === version.id
                const isComparing = compareVersions.includes(version.id)

                return (
                  <button
                    key={version.id}
                    onClick={() => handleVersionClick(version.id)}
                    className={cn(
                      'w-full rounded-lg p-3 text-left transition-colors hover:bg-muted',
                      (isSelected || isComparing) && 'bg-muted'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={version.createdBy.avatar} />
                          <AvatarFallback>
                            {version.createdBy.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {index < mockVersions.length - 1 && (
                          <div className="absolute left-1/2 top-10 h-8 w-px -translate-x-1/2 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {version.createdBy.name}
                          </span>
                          {compareMode && isComparing && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2B5CE6] text-xs text-white">
                              {compareVersions.indexOf(version.id) + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {version.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                          </span>
                          <span>•</span>
                          <span>{version.changes} changes</span>
                        </div>
                      </div>
                      {!compareMode && (
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            isSelected && 'rotate-90'
                          )}
                        />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>

          {/* Preview panel */}
          <div className="flex-1 flex flex-col">
            {selectedVersion && !compareMode ? (
              <>
                <div className="flex-1 p-4">
                  <div className="h-full rounded-lg border bg-muted/30 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Eye className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">Version preview</p>
                      <p className="text-xs">
                        {mockVersions.find((v) => v.id === selectedVersion)?.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t p-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedVersion(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRestore} className="bg-[#2B5CE6] hover:bg-[#1E42B8]">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore this version
                  </Button>
                </div>
              </>
            ) : compareMode && compareVersions.length === 2 ? (
              <>
                <div className="flex-1 p-4">
                  <div className="h-full rounded-lg border bg-muted/30 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <GitCompare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">Comparing versions</p>
                      <p className="text-xs">
                        {mockVersions.find((v) => v.id === compareVersions[0])?.description}
                        {' vs '}
                        {mockVersions.find((v) => v.id === compareVersions[1])?.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t p-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setCompareVersions([])}
                  >
                    Clear selection
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  {compareMode ? (
                    <>
                      <GitCompare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">Select two versions to compare</p>
                      <p className="text-xs">
                        {compareVersions.length}/2 selected
                      </p>
                    </>
                  ) : (
                    <>
                      <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">Select a version to preview</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
