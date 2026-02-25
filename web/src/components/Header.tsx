import { Sun, Moon, Bot, RefreshCw } from 'lucide-react'

interface HeaderProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  onRefresh: () => void
  loading?: boolean
}

export function Header({ theme, toggleTheme, onRefresh, loading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                AI 资讯聚合
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                实时追踪 AI 领域最新动态
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
