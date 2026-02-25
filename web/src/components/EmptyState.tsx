import { SearchX } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <SearchX className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        没有找到相关资讯
      </h3>
      <p className="text-slate-500 dark:text-slate-400">
        尝试调整筛选条件或搜索关键词
      </p>
    </div>
  )
}
