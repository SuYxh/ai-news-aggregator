import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ai-news-visited-links'
const MAX_LINKS = 1000

interface VisitedLinksState {
  links: Record<string, number>
}

function getStoredLinks(): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed: VisitedLinksState = JSON.parse(stored)
      return parsed.links || {}
    }
  } catch {
    console.warn('Failed to parse visited links from localStorage')
  }
  return {}
}

function saveLinks(links: Record<string, number>) {
  try {
    const entries = Object.entries(links)
    if (entries.length > MAX_LINKS) {
      const sorted = entries.sort((a, b) => a[1] - b[1])
      const trimmed = sorted.slice(entries.length - MAX_LINKS)
      links = Object.fromEntries(trimmed)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links }))
  } catch {
    console.warn('Failed to save visited links to localStorage')
  }
}

export function useVisitedLinks() {
  const [visitedLinks, setVisitedLinks] = useState<Record<string, number>>(() => getStoredLinks())

  useEffect(() => {
    saveLinks(visitedLinks)
  }, [visitedLinks])

  const markAsVisited = useCallback((url: string) => {
    setVisitedLinks(prev => ({
      ...prev,
      [url]: Date.now()
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
