import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ai-news-favorites'
const MAX_FAVORITES = 500

export interface FavoriteInfo {
  timestamp: number
  title: string
}

function getStoredFavorites(): Record<string, FavoriteInfo> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.favorites) {
        return parsed.favorites
      }
    }
  } catch {
    console.warn('Failed to parse favorites from localStorage')
  }
  return {}
}

function saveFavorites(favorites: Record<string, FavoriteInfo>) {
  try {
    const entries = Object.entries(favorites)
    if (entries.length > MAX_FAVORITES) {
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const trimmed = sorted.slice(entries.length - MAX_FAVORITES)
      favorites = Object.fromEntries(trimmed)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ favorites }))
  } catch {
    console.warn('Failed to save favorites to localStorage')
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Record<string, FavoriteInfo>>(() => getStoredFavorites())

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const addFavorite = useCallback((url: string, title: string) => {
    setFavorites(prev => ({
      ...prev,
      [url]: { timestamp: Date.now(), title }
    }))
  }, [])

  const removeFavorite = useCallback((url: string) => {
    setFavorites(prev => {
      const next = { ...prev }
      delete next[url]
      return next
    })
  }, [])

  const toggleFavorite = useCallback((url: string, title: string) => {
    setFavorites(prev => {
      if (url in prev) {
        const next = { ...prev }
        delete next[url]
        return next
      } else {
        return {
          ...prev,
          [url]: { timestamp: Date.now(), title }
        }
      }
    })
  }, [])

  const isFavorite = useCallback((url: string) => {
    return url in favorites
  }, [favorites])

  const clearAll = useCallback(() => {
    setFavorites({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearAll,
    favoriteCount: Object.keys(favorites).length
  }
}
