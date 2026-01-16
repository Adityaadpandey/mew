/**
 * In-memory cache with TTL support for API responses
 * Provides fast caching for frequently accessed data
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Run cleanup every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set<T>(key: string, data: T, ttlMs: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
export const cache = new MemoryCache()

// Cache key generators
export const cacheKeys = {
  projects: (userId: string, workspaceId?: string) =>
    `projects:${userId}:${workspaceId || 'all'}`,

  tasks: (projectId: string) =>
    `tasks:${projectId}`,

  userTasks: (userId: string) =>
    `user-tasks:${userId}`,

  documents: (workspaceId: string) =>
    `documents:${workspaceId}`,

  workspaces: (userId: string) =>
    `workspaces:${userId}`,

  activity: (limit: number) =>
    `activity:${limit}`,

  project: (projectId: string) =>
    `project:${projectId}`,
}

// TTL constants (in milliseconds)
export const TTL = {
  SHORT: 10 * 1000,      // 10 seconds - for frequently changing data
  MEDIUM: 30 * 1000,     // 30 seconds - default
  LONG: 60 * 1000,       // 1 minute - for stable data
  VERY_LONG: 300 * 1000, // 5 minutes - for rarely changing data
}

// Cache invalidation helpers
export function invalidateUserCache(userId: string): void {
  cache.invalidatePattern(`.*:${userId}:.*`)
  cache.invalidatePattern(`.*:${userId}$`)
}

export function invalidateProjectCache(projectId: string): void {
  cache.invalidatePattern(`.*:${projectId}`)
  cache.invalidatePattern(`project:${projectId}`)
  cache.invalidatePattern(`tasks:${projectId}`)
}

export function invalidateWorkspaceCache(workspaceId: string): void {
  cache.invalidatePattern(`.*:${workspaceId}`)
  cache.invalidatePattern(`documents:${workspaceId}`)
}
