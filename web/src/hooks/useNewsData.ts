import { useState, useEffect, useMemo, useCallback } from 'react'
import type { NewsData, NewsItem, SiteStat } from '../types'

export interface SourceStat {
  source: string
  count: number
}

export type TimeRange = '24h' | '7d'

interface UseNewsDataReturn {
  data: NewsData | null
  loading: boolean
  error: string | null
  filteredItems: NewsItem[]
  siteStats: SiteStat[]
  sourceStats: SourceStat[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedSite: string
  setSelectedSite: (site: string) => void
  selectedSource: string
  setSelectedSource: (source: string) => void
  loadMore: () => void
  hasMore: boolean
  displayCount: number
  refresh: () => void
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
}

const PAGE_SIZE = 50

export function useNewsData(): UseNewsDataReturn {
  const [data, setData] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSite, setSelectedSite] = useState('opmlrss')
  const [selectedSource, setSelectedSource] = useState('all')
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')

  const fetchData = useCallback(async (range: TimeRange) => {
    setLoading(true)
    setError(null)
    try {
      const basePath = import.meta.env.BASE_URL || '/'
      const fileName = range === '24h' ? 'latest-24h.json' : 'latest-7d.json'
      const response = await fetch(`${basePath}data/${fileName}`)
      if (!response.ok) {
        throw new Error('数据加载失败')
      }
      const json = await response.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(timeRange)
  }, [timeRange, fetchData])

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range)
    setDisplayCount(PAGE_SIZE)
    setSelectedSite('opmlrss')
    setSelectedSource('all')
    setSearchQuery('')
  }, [])

  const sourceStats = useMemo(() => {
    if (!data?.items || selectedSite === 'all') return []
    
    const sourceMap = new Map<string, number>()
    data.items
      .filter(item => item.site_id === selectedSite)
      .forEach(item => {
        sourceMap.set(item.source, (sourceMap.get(item.source) || 0) + 1)
      })
    
    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
  }, [data, selectedSite])

  const filteredItems = useMemo(() => {
    if (!data?.items) return []
    
    let items = data.items
    
    if (selectedSite !== 'all') {
      items = items.filter(item => item.site_id === selectedSite)
    }

    if (selectedSource !== 'all') {
      items = items.filter(item => item.source === selectedSource)
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        (item.title_zh && item.title_zh.toLowerCase().includes(query))
      )
    }
    
    return items.slice(0, displayCount)
  }, [data, selectedSite, selectedSource, searchQuery, displayCount])

  const totalFiltered = useMemo(() => {
    if (!data?.items) return 0
    
    let items = data.items
    
    if (selectedSite !== 'all') {
      items = items.filter(item => item.site_id === selectedSite)
    }

    if (selectedSource !== 'all') {
      items = items.filter(item => item.source === selectedSource)
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        (item.title_zh && item.title_zh.toLowerCase().includes(query))
      )
    }
    
    return items.length
  }, [data, selectedSite, selectedSource, searchQuery])

  const loadMore = () => {
    setDisplayCount(prev => prev + PAGE_SIZE)
  }

  const hasMore = displayCount < totalFiltered

  const refresh = () => {
    setDisplayCount(PAGE_SIZE)
    fetchData(timeRange)
  }

  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [selectedSite, selectedSource, searchQuery])

  useEffect(() => {
    setSelectedSource('all')
  }, [selectedSite])

  return {
    data,
    loading,
    error,
    filteredItems,
    siteStats: data?.site_stats || [],
    sourceStats,
    searchQuery,
    setSearchQuery,
    selectedSite,
    setSelectedSite,
    selectedSource,
    setSelectedSource,
    loadMore,
    hasMore,
    displayCount,
    refresh,
    timeRange,
    setTimeRange: handleTimeRangeChange
  }
}
