import { Sun, Moon, Bot, Clock, Info, Github } from 'lucide-react'
import { formatDateTime } from '../utils/formatDate'
import type { TimeRange } from '../hooks/useNewsData'

interface HeaderProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  onRefresh: () => void
  loading?: boolean
  generatedAt?: string | null
  windowHours?: number
  onShowSources?: () => void
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
}

export function Header({ 
  theme, 
  toggleTheme,
  generatedAt, 
  windowHours, 
  onShowSources,
  timeRange,
  onTimeRangeChange 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <button 
                onClick={onShowSources}
                className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  AI 资讯聚合
                </h1>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTimeRangeChange('24h')
                    }}
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition-all ${
                      timeRange === '24h'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    近 24 小时
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTimeRangeChange('7d')
                    }}
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition-all ${
                      timeRange === '7d'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    近 7 天
                  </button>
                </div>
                <Info className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                实时追踪 AI 领域最新动态
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {generatedAt && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>自动更新于 {formatDateTime(generatedAt)}</span>
                {windowHours && (
                  <span className="text-slate-400 dark:text-slate-500">· {windowHours}h</span>
                )}
              </div>
            )}
            <a
              href="https://github.com/SuYxh/ai-news-aggregator"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost p-2 rounded-lg"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <button
              onClick={toggleTheme}
              className="btn btn-ghost p-2 rounded-lg"
              title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
