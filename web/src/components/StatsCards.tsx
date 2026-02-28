import { FileText, Database, Sparkles } from 'lucide-react'
import type { SiteStat } from '../types'
import { Analytics } from '../utils/analytics'

interface StatsCardsProps {
  totalItems: number
  sourceCount: number
  windowHours: number
  siteStats: SiteStat[]
  onShowSources: () => void
}

export function StatsCards({ totalItems, sourceCount, windowHours, siteStats, onShowSources }: StatsCardsProps) {
  const totalRawItems = siteStats.reduce((sum, s) => sum + s.raw_count, 0)
  
  return (
    <div className="card p-3 sm:p-4 animate-fade-in">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-x-6 sm:gap-y-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
          </div>
          <div className="text-xs sm:text-sm min-w-0">
            <span className="text-slate-500 dark:text-slate-400">{windowHours}h</span>
            <span className="mx-1 sm:mx-1.5 font-semibold text-slate-900 dark:text-white">{totalItems.toLocaleString()}</span>
            <span className="text-slate-500 dark:text-slate-400">条</span>
          </div>
        </div>

        <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700" />

        <button 
          onClick={() => {
            Analytics.trackSourcesDetail()
            onShowSources()
          }}
          className="flex items-center gap-1.5 sm:gap-2 hover:opacity-70 transition-opacity"
        >
          <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex-shrink-0">
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
          </div>
          <div className="text-xs sm:text-sm min-w-0">
            <span className="font-semibold text-slate-900 dark:text-white">{siteStats.length}</span>
            <span className="mx-0.5 sm:mx-1 text-slate-500 dark:text-slate-400">平台</span>
            <span className="font-semibold text-slate-900 dark:text-white">{sourceCount}</span>
            <span className="mx-0.5 sm:mx-1 text-slate-500 dark:text-slate-400">源</span>
            <span className="hidden sm:inline ml-1 text-primary-500 text-xs">详情 →</span>
          </div>
        </button>

        <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700" />

        <div className="flex items-center gap-1.5 sm:gap-2 col-span-2 sm:col-span-1">
          <div className="p-1 sm:p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
          </div>
          <div className="text-xs sm:text-sm min-w-0">
            <span className="text-slate-500 dark:text-slate-400">从</span>
            <span className="mx-1 sm:mx-1.5 font-semibold text-slate-900 dark:text-white">{totalRawItems.toLocaleString()}</span>
            <span className="text-slate-500 dark:text-slate-400">条筛选</span>
          </div>
        </div>
      </div>
    </div>
  )
}
