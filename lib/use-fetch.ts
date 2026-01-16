'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface FetchState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isValidating: boolean
}

interface UseFetchOptions {
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  refreshInterval?: number
  dedupingInterval?: number
  initialData?: unknown
}

// Simple in-memory cache for client-side
const clientCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds
const inflightRequests = new Map<string, Promise<unknown>>()

export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions = {}
): FetchState<T> & { mutate: () => Promise<void> } {
  const {
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval = 0,
    dedupingInterval = 2000,
    initialData,
  } = options

  const [state, setState] = useState<FetchState<T>>({
    data: (initialData as T) || null,
    error: null,
    isLoading: !initialData && !!url,
    isValidating: false,
  })

  const lastFetchTime = useRef<number>(0)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (isRevalidation = false) => {
    if (!url) return

    const now = Date.now()

    // Deduping - don't fetch if we just fetched
    if (now - lastFetchTime.current < dedupingInterval && !isRevalidation) {
      const cached = clientCache.get(url)
      if (cached && now - cached.timestamp < CACHE_TTL) {
        setState(prev => ({ ...prev, data: cached.data as T, isLoading: false }))
        return
      }
    }

    // Check for inflight request
    if (inflightRequests.has(url)) {
      try {
        const data = await inflightRequests.get(url)
        if (mountedRef.current) {
          setState({ data: data as T, error: null, isLoading: false, isValidating: false })
        }
        return
      } catch (error) {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, error: error as Error, isLoading: false, isValidating: false }))
        }
        return
      }
    }

    setState(prev => ({
      ...prev,
      isLoading: !prev.data,
      isValidating: !!prev.data,
    }))

    const fetchPromise = fetch(url).then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })

    inflightRequests.set(url, fetchPromise)

    try {
      const data = await fetchPromise
      lastFetchTime.current = now
      clientCache.set(url, { data, timestamp: now })

      if (mountedRef.current) {
        setState({ data, error: null, isLoading: false, isValidating: false })
      }
    } catch (error) {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: error as Error,
          isLoading: false,
          isValidating: false,
        }))
      }
    } finally {
      inflightRequests.delete(url)
    }
  }, [url, dedupingInterval])

  const mutate = useCallback(async () => {
    if (url) {
      clientCache.delete(url)
      await fetchData(true)
    }
  }, [url, fetchData])

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchData(true)
      }
    }

    document.addEventListener('visibilitychange', onFocus)
    return () => document.removeEventListener('visibilitychange', onFocus)
  }, [fetchData, revalidateOnFocus])

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const onOnline = () => fetchData(true)
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [fetchData, revalidateOnReconnect])

  // Refresh interval
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return

    const interval = setInterval(() => fetchData(true), refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return { ...state, mutate }
}

// Convenience hooks for common data types
export function useProjects(workspaceId?: string) {
  const url = workspaceId
    ? `/api/projects?workspaceId=${workspaceId}`
    : '/api/projects'
  return useFetch<any[]>(url, { refreshInterval: 30000 })
}

export function useTasks(projectId: string) {
  return useFetch<{ data: any[] }>(`/api/tasks?projectId=${projectId}`, {
    refreshInterval: 15000,
  })
}

export function useProject(projectId: string) {
  return useFetch<any>(`/api/projects/${projectId}`, {
    refreshInterval: 60000,
  })
}

export function useDocuments(workspaceId: string) {
  return useFetch<any[]>(`/api/documents?workspaceId=${workspaceId}`, {
    refreshInterval: 30000,
  })
}

export function useActivity(limit = 10) {
  return useFetch<any[]>(`/api/activity?limit=${limit}`, {
    refreshInterval: 30000,
  })
}

export function useNotifications() {
  return useFetch<any[]>('/api/notifications', {
    refreshInterval: 30000,
  })
}

// Prefetch utility
export function prefetch(url: string) {
  if (typeof window === 'undefined') return

  const cached = clientCache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return

  fetch(url)
    .then(res => res.json())
    .then(data => {
      clientCache.set(url, { data, timestamp: Date.now() })
    })
    .catch(() => {})
}

// Clear cache utility
export function clearCache(pattern?: string) {
  if (pattern) {
    const regex = new RegExp(pattern)
    for (const key of clientCache.keys()) {
      if (regex.test(key)) {
        clientCache.delete(key)
      }
    }
  } else {
    clientCache.clear()
  }
}
