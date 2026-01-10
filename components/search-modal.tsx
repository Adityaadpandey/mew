'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  GitBranch,
  Folder,
  Clock,
  Star,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useDebounceValue } from '@/lib/hooks'
import { useDocumentStore } from '@/lib/store'

interface SearchResult {
  id: string
  title: string
  type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
  workspace?: { id: string; name: string }
  creator?: { id: string; name: string; avatar: string | null }
  isFavorite?: boolean
  updatedAt?: string
}

const recentSearches = ['architecture', 'api', 'database']

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounceValue(query, 300)
  const { setCurrentDocument } = useDocumentStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const searchDocuments = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    searchDocuments(debouncedQuery)
  }, [debouncedQuery, searchDocuments])

  const handleSelect = (result: SearchResult) => {
    setCurrentDocument({
      id: result.id,
      title: result.title,
      type: result.type,
      content: {},
    })
    setOpen(false)
    setQuery('')
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'DIAGRAM':
        return <GitBranch className="h-4 w-4 text-blue-500" />
      case 'CANVAS':
        return <Folder className="h-4 w-4 text-amber-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search documents, diagrams, and more..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <CommandEmpty>No results found.</CommandEmpty>

            {!query && (
              <>
                <CommandGroup heading="Recent Searches">
                  {recentSearches.map((search) => (
                    <CommandItem key={search} className="gap-2" onSelect={() => setQuery(search)}>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{search}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {results.length > 0 && (
              <CommandGroup heading="Documents & Diagrams">
                {results.map((result) => (
                  <CommandItem 
                    key={result.id} 
                    className="gap-2"
                    onSelect={() => handleSelect(result)}
                  >
                    {getIcon(result.type)}
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <span className="font-medium">{result.title}</span>
                        {result.workspace && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            in {result.workspace.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.isFavorite && (
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            <CommandGroup heading="Quick Actions">
              <CommandItem className="gap-2">
                <FileText className="h-4 w-4" />
                <span>Create new document</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </CommandItem>
              <CommandItem className="gap-2">
                <GitBranch className="h-4 w-4" />
                <span>Create new diagram</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
