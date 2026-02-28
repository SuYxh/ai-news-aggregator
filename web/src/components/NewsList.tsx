import type { NewsItem } from '../types'
import type { VisitedLinkInfo } from '../hooks/useVisitedLinks'
import { NewsCard } from './NewsCard'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ChevronDown } from 'lucide-react'
import { Analytics } from '../utils/analytics'

interface NewsListProps {
  items: NewsItem[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  visitedLinks: Record<string, VisitedLinkInfo>
  onVisit: (url: string, title?: string) => void
  isFavorite?: (url: string) => boolean
  onToggleFavorite?: (url: string, title: string) => void
}

export function NewsList({ items, loading, error, hasMore, onLoadMore, visitedLinks, onVisit, isFavorite, onToggleFavorite }: NewsListProps) {
  const isVisited = (url: string) => url in visitedLinks
  const visitedCount = Object.keys(visitedLinks).length

  if (loading && items.length === 0) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="text-red-500 dark:text-red-400 mb-2">⚠️ 加载失败</div>
        <p className="text-slate-600 dark:text-slate-300">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyState />
  }

  const visitedInList = items.filter(item => isVisited(item.url)).length

  return (
    <div className="space-y-3">
      {visitedCount > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>当前列表已读 {visitedInList}/{items.length} 条</span>
        </div>
      )}
      {items.map((item, index) => (
        <NewsCard 
          key={item.id} 
          item={item} 
          index={index}
          isVisited={isVisited(item.url)}
          isFavorite={isFavorite?.(item.url)}
          onVisit={onVisit}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              Analytics.trackLoadMore()
              onLoadMore()
            }}
            className="btn btn-ghost flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <span>加载更多</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
