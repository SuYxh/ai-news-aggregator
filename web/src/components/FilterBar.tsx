import { Search } from 'lucide-react'
import type { SiteStat } from '../types'
import type { SourceStat } from '../hooks/useNewsData'
import { SiteFilters } from './SiteFilters'

interface FilterBarProps {
  siteStats: SiteStat[]
  sourceStats: SourceStat[]
  selectedSite: string
  onSiteChange: (site: string) => void
  selectedSource: string
  onSourceChange: (source: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function FilterBar({
  siteStats,
  sourceStats,
  selectedSite,
  onSiteChange,
  selectedSource,
  onSourceChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="card p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          id="search-input"
          type="text"
          placeholder="搜索资讯标题、来源..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input pl-10"
        />
      </div>
      
      <SiteFilters
        siteStats={siteStats}
        sourceStats={sourceStats}
        selectedSite={selectedSite}
        onSiteChange={onSiteChange}
        selectedSource={selectedSource}
        onSourceChange={onSourceChange}
      />
    </div>
  )
}
