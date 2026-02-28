import { Sun, Moon, Bot, Clock, Info, Github, History, Star, Loader2 } from 'lucide-react'
import { formatDateTime } from '../utils/formatDate'
import type { TimeRange } from '../hooks/useNewsData'
import { Analytics } from '../utils/analytics'

interface HeaderProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  onRefresh: () => void
  loading?: boolean
  generatedAt?: string | null
  windowHours?: number
  onShowSources?: () => void
  onShowHistory?: () => void
  onShowFavorites?: () => void
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  isSwitching?: boolean
}

export function Header({ 
  theme, 
  toggleTheme,
  generatedAt, 
  windowHours, 
  onShowSources,
  onShowHistory,
  onShowFavorites,
  timeRange,
  onTimeRangeChange,
  isSwitching = false
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0 cursor-pointer"
              onClick={() => {
                Analytics.trackLogo()
                onShowSources?.()
              }}
            >
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <div 
                  onClick={() => {
                    Analytics.trackLogo()
                    onShowSources?.()
                  }}
                  className="group flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      Analytics.trackLogo()
                      onShowSources?.()
                    }
                  }}
                >
                  <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    AI 资讯聚合
                  </h1>
                  <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
                  <button
                    onClick={() => {
                      Analytics.trackTimeRange('24h')
                      onTimeRangeChange('24h')
                    }}
                    disabled={isSwitching}
                    className={`px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                      timeRange === '24h'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    } ${isSwitching ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSwitching && timeRange === '24h' && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    24h
                  </button>
                  <button
                    onClick={() => {
                      Analytics.trackTimeRange('7d')
                      onTimeRangeChange('7d')
                    }}
                    disabled={isSwitching}
                    className={`px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                      timeRange === '7d'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    } ${isSwitching ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSwitching && timeRange === '7d' && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    7天
                  </button>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                实时追踪 AI 领域最新动态
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {generatedAt && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>更新于 {formatDateTime(generatedAt)}</span>
                {windowHours && (
                  <span className="text-slate-400 dark:text-slate-500">· {windowHours}h</span>
                )}
              </div>
            )}
            <button
              onClick={() => {
                Analytics.trackFavorites()
                onShowFavorites?.()
              }}
              className="btn btn-ghost p-1.5 sm:p-2 rounded-lg"
              title="我的收藏"
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => {
                Analytics.trackHistory()
                onShowHistory?.()
              }}
              className="btn btn-ghost p-1.5 sm:p-2 rounded-lg"
              title="阅读历史"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <a
              href="https://github.com/SuYxh/ai-news-aggregator"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost p-1.5 sm:p-2 rounded-lg"
              title="GitHub"
              onClick={() => Analytics.trackGithub()}
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <button
              onClick={() => {
                Analytics.trackThemeToggle(theme === 'light' ? 'dark' : 'light')
                toggleTheme()
              }}
              className="btn btn-ghost p-1.5 sm:p-2 rounded-lg"
              title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
