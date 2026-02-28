import { Loader2 } from 'lucide-react'
import type { TimeRange } from '../hooks/useNewsData'

interface SwitchingOverlayProps {
  timeRange: TimeRange
}

export function SwitchingOverlay({ timeRange }: SwitchingOverlayProps) {
  const label = timeRange === '24h' ? '24 小时' : '7 天'
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
          <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            正在加载{label}数据...
          </span>
        </div>
      </div>
    </div>
  )
}
