import type { NewsItem } from '../types'
import { NewsCard } from './NewsCard'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ChevronDown } from 'lucide-react'

interface NewsListProps {
  items: NewsItem[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
}

export function NewsList({ items, loading, error, hasMore, onLoadMore }: NewsListProps) {
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

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <NewsCard key={item.id} item={item} index={index} />
      ))}
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
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
