import { X } from 'lucide-react'
import type { SiteStat } from '../types'
import type { SourceStat } from '../hooks/useNewsData'
import { SITE_COLORS, DEFAULT_BADGE_COLOR } from '../utils/constants'

interface SiteFiltersProps {
  siteStats: SiteStat[]
  sourceStats: SourceStat[]
  selectedSite: string
  onSiteChange: (site: string) => void
  selectedSource: string
  onSourceChange: (source: string) => void
}

export function SiteFilters({
  siteStats,
  sourceStats,
  selectedSite,
  onSiteChange,
  selectedSource,
  onSourceChange,
}: SiteFiltersProps) {
  const activeSites = siteStats.filter(site => site.count > 0)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSiteChange('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedSite === 'all'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          全部
        </button>
        {activeSites.map((site) => {
          const colorClass = SITE_COLORS[site.site_id] || DEFAULT_BADGE_COLOR
          const isSelected = selectedSite === site.site_id
          
          return (
            <button
              key={site.site_id}
              onClick={() => onSiteChange(site.site_id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : colorClass + ' hover:opacity-80'
              }`}
            >
              <span>{site.site_name}</span>
              <span className={`text-xs ${isSelected ? 'text-primary-100' : 'opacity-70'}`}>
                {site.count}
              </span>
            </button>
          )
        })}
      </div>
      
      {selectedSite !== 'all' && sourceStats.length > 0 && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">订阅源筛选:</span>
            {selectedSource !== 'all' && (
              <button
                onClick={() => onSourceChange('all')}
                className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-0.5 flex-shrink-0"
              >
                <X className="w-3 h-3" />
                清除
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
            {sourceStats.map((source) => {
              const isSelected = selectedSource === source.source
              
              return (
                <button
                  key={source.source}
                  onClick={() => onSourceChange(source.source)}
                  className={`px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                  title={source.source}
                >
                  <span className="max-w-[120px] truncate inline-block align-bottom">
                    {source.source}
                  </span>
                  <span className={`ml-1 ${isSelected ? 'text-primary-100' : 'opacity-60'}`}>
                    {source.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
