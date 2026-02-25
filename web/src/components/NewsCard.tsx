import { ExternalLink, Clock } from 'lucide-react'
import type { NewsItem } from '../types'
import { SourceBadge } from './SourceBadge'
import { formatDateTime } from '../utils/formatDate'

interface NewsCardProps {
  item: NewsItem
  index: number
}

export function NewsCard({ item, index }: NewsCardProps) {
  const displayTitle = item.title_zh || item.title

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover p-4 block animate-slide-up group"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <SourceBadge siteId={item.site_id} siteName={item.site_name} />
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              {item.source}
            </span>
          </div>
          
          <h3 className="text-base font-medium text-slate-900 dark:text-white leading-relaxed group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            {displayTitle}
          </h3>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDateTime(item.published_at || item.first_seen_at)}
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </a>
  )
}
