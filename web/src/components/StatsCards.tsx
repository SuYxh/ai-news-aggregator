import { FileText, Database, Clock, TrendingUp } from 'lucide-react'
import { formatDateTime } from '../utils/formatDate'

interface StatsCardsProps {
  totalItems: number
  sourceCount: number
  generatedAt: string | null
  filteredCount: number
}

export function StatsCards({ totalItems, sourceCount, generatedAt, filteredCount }: StatsCardsProps) {
  const stats = [
    {
      label: '总资讯数',
      value: totalItems.toLocaleString(),
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: '数据源',
      value: sourceCount.toLocaleString(),
      icon: Database,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: '更新时间',
      value: formatDateTime(generatedAt),
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      isTime: true,
    },
    {
      label: '当前筛选',
      value: filteredCount.toLocaleString(),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card p-4 animate-fade-in"
        >
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} 
                style={{ stroke: `url(#${stat.label})` }}
              />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id={stat.label} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('emerald') ? '#10b981' : stat.color.includes('amber') ? '#f59e0b' : '#a855f7'} />
                    <stop offset="100%" stopColor={stat.color.includes('blue') ? '#2563eb' : stat.color.includes('emerald') ? '#059669' : stat.color.includes('amber') ? '#d97706' : '#9333ea'} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={`mt-1 font-semibold ${stat.isTime ? 'text-sm' : 'text-2xl'} text-slate-900 dark:text-white`}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
