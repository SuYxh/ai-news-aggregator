import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ai-news-visited-links'
const MAX_LINKS = 1000

export interface VisitedLinkInfo {
  timestamp: number
  title: string
}

function getStoredLinks(): Record<string, VisitedLinkInfo> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.links) {
        const firstValue = Object.values(parsed.links)[0]
        if (typeof firstValue === 'number') {
          const migrated: Record<string, VisitedLinkInfo> = {}
          for (const [url, timestamp] of Object.entries(parsed.links)) {
            migrated[url] = { timestamp: timestamp as number, title: '' }
          }
          return migrated
        }
        return parsed.links
      }
    }
  } catch {
    console.warn('Failed to parse visited links from localStorage')
  }
  return {}
}

function saveLinks(links: Record<string, VisitedLinkInfo>) {
  try {
    const entries = Object.entries(links)
    if (entries.length > MAX_LINKS) {
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const trimmed = sorted.slice(entries.length - MAX_LINKS)
      links = Object.fromEntries(trimmed)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links }))
  } catch {
    console.warn('Failed to save visited links to localStorage')
  }
}

export function useVisitedLinks() {
  const [visitedLinks, setVisitedLinks] = useState<Record<string, VisitedLinkInfo>>(() => getStoredLinks())

  useEffect(() => {
    saveLinks(visitedLinks)
  }, [visitedLinks])

  const markAsVisited = useCallback((url: string, title?: string) => {
    setVisitedLinks(prev => ({
      ...prev,
      [url]: { timestamp: Date.now(), title: title || '' }
    }))
  }, [])

  const isVisited = useCallback((url: string) => {
    return url in visitedLinks
  }, [visitedLinks])

  const clearAll = useCallback(() => {
    setVisitedLinks({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    visitedLinks,
    markAsVisited,
    isVisited,
    clearAll,
    visitedCount: Object.keys(visitedLinks).length
  }
}
