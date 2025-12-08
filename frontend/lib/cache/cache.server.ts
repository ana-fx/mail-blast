// Server-side caching helpers for Next.js

export interface CacheOptions {
  revalidate?: number | false
  tags?: string[]
}

export async function fetchWithCache<T>(
  url: string,
  options: RequestInit & CacheOptions = {}
): Promise<T> {
  const { revalidate, tags, ...fetchOptions } = options

  const cacheOptions: RequestInit = {
    ...fetchOptions,
    next: {
      revalidate: revalidate ?? 60, // Default 1 minute
      tags: tags,
    },
  }

  const response = await fetch(url, cacheOptions)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }

  return response.json()
}

// Force cache (for static data)
export async function fetchStatic<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return fetchWithCache<T>(url, {
    ...options,
    revalidate: 3600, // 1 hour
  })
}

// No cache (for dynamic data)
export async function fetchDynamic<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return fetchWithCache<T>(url, {
    ...options,
    revalidate: false,
  })
}

// Revalidate with tags
export async function fetchWithTags<T>(
  url: string,
  tags: string[],
  options: RequestInit = {}
): Promise<T> {
  return fetchWithCache<T>(url, {
    ...options,
    tags,
    revalidate: 60,
  })
}

