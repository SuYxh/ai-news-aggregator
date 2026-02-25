import { Sun, Moon, Bot, RefreshCw, Clock, Info } from 'lucide-react'
import { formatDateTime } from '../utils/formatDate'

interface HeaderProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  onRefresh: () => void
  loading?: boolean
  generatedAt?: string | null
  windowHours?: number
  onShowSources?: () => void
}

export function Header({ theme, toggleTheme, onRefresh, loading, generatedAt, windowHours, onShowSources }: HeaderProps) {
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
                {windowHours && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-sm">
                    近 {windowHours} 小时
                  </span>
                )}
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
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn btn-ghost p-2 rounded-lg"
              title="刷新数据"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
