'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowUpRight, FileText, Layout, MoreHorizontal, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  id: string
  title: string
  description?: string
  lastEdited: string
  memberCount: number
  isFavorite?: boolean
  type: 'doc' | 'board' | 'hybrid'
  color?: string
  index?: number
}

export function ProjectCard({
  id,
  title,
  description,
  lastEdited,
  memberCount,
  isFavorite,
  type,
  color = 'bg-blue-500',
  index = 0
}: ProjectCardProps) {
  const router = useRouter()

  const getTypeIcon = () => {
    switch (type) {
      case 'doc': return <FileText className="h-4 w-4" />
      case 'board': return <Layout className="h-4 w-4" />
      default: return <Layout className="h-4 w-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={cn(
          "group relative h-48 overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 hover:shadow-lg dark:hover:shadow-primary/5 cursor-pointer",
          "flex flex-col justify-between p-5"
        )}
        onClick={() => router.push(`/projects/${id}`)}
      >
        {/* Gradient Background Effect on Hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10",
          color
        )} />

        <div className="flex justify-between items-start relative z-10">
          <div className="flex gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-white/10 to-white/5 shadow-inner border border-white/10",
              "text-white"
            )}>
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Last edited {lastEdited}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative z-10 space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description || "No description provided for this project."}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
               <div className="flex -space-x-2">
                {[...Array(Math.min(memberCount, 3))].map((_, i) => (
                  <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center text-[10px] text-white">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {memberCount > 3 && (
                  <div className="h-6 w-6 rounded-full border-2 border-background bg-zinc-900 flex items-center justify-center text-[8px] text-white">
                    +{memberCount - 3}
                  </div>
                )}
               </div>
               {isFavorite && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
            >
              Open <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
