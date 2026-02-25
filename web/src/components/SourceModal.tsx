import { X, Rss, Globe, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { SiteStat } from '../types'

interface SourceModalProps {
  isOpen: boolean
  onClose: () => void
  siteStats: SiteStat[]
  sourceCount: number
  windowHours: number
}

interface SourceStatus {
  generated_at: string
  sites: {
    site_id: string
    site_name: string
    ok: boolean
    item_count: number
    duration_ms: number
    error: string | null
  }[]
  successful_sites: number
  failed_sites: string[]
}

interface OpmlGroup {
  name: string
  feeds: {
    name: string
    url: string
  }[]
}

const SITE_INFO: Record<string, { description: string; url: string }> = {
  aihot: {
    description: 'AI 热点聚合，收集各大平台 AI 相关热门内容',
    url: 'https://www.aihot.cn/',
  },
  techurls: {
    description: '技术链接聚合，汇集 Hacker News、Reddit 等技术社区热门文章',
    url: 'https://techurls.com/',
  },
  newsnow: {
    description: '新闻聚合平台，实时追踪全球科技新闻',
    url: 'https://newsnow.co/',
  },
  tophub: {
    description: '今日热榜，聚合微博、知乎、B站等 50+ 平台热门内容',
    url: 'https://tophub.today/',
  },
  buzzing: {
    description: '热门话题聚合，收集 Reddit、HN、Twitter 等平台讨论',
    url: 'https://www.buzzing.cc/',
  },
  opmlrss: {
    description: '自定义 RSS 订阅源，包含 Twitter/X 博主、AI 公司官方账号等',
    url: '',
  },
  iris: {
    description: 'Info Flow RSS 信息流，精选科技博客和资讯',
    url: 'https://info-flow.codelife.cc/',
  },
  zeli: {
    description: 'Hacker News 24 小时热榜精选',
    url: 'https://zeli.app/',
  },
  aihubtoday: {
    description: 'AI 资讯日报，每日精选 AI 领域重要动态',
    url: 'https://aihubtoday.com/',
  },
  aibase: {
    description: 'AI 产品数据库，收录最新 AI 工具和应用',
    url: 'https://www.aibase.com/',
  },
  bestblogs: {
    description: '优质博客周刊，精选技术博客文章',
    url: 'https://bestblogs.dev/',
  },
}

export function SourceModal({ isOpen, onClose, siteStats, sourceCount, windowHours }: SourceModalProps) {
  const [sourceStatus, setSourceStatus] = useState<SourceStatus | null>(null)
  const [opmlGroups, setOpmlGroups] = useState<OpmlGroup[]>([])

  useEffect(() => {
    if (isOpen) {
      const basePath = import.meta.env.BASE_URL || '/'
      fetch(`${basePath}data/source-status.json`)
        .then(res => res.json())
        .then(data => setSourceStatus(data))
        .catch(() => {})
      
      fetch(`${basePath}data/opml-feeds.json`)
        .then(res => res.json())
        .then(data => setOpmlGroups(data))
        .catch(() => {})
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const totalRawItems = siteStats.reduce((sum, s) => sum + s.raw_count, 0)
  const totalFilteredItems = siteStats.reduce((sum, s) => sum + s.count, 0)
  const allOpmlFeeds = opmlGroups.flatMap(g => g.feeds)
  
  const sortedSiteStats = [...siteStats].sort((a, b) => {
    if (a.site_id === 'opmlrss') return 1
    if (b.site_id === 'opmlrss') return -1
    return 0
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden animate-fade-in">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Rss className="w-5 h-5 text-primary-500" />
              数据源概览
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              聚合 {siteStats.length} 个平台 · {sourceCount} 个订阅源
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{siteStats.length}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">数据平台</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{sourceCount}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">订阅源</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalRawItems.toLocaleString()}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">原始资讯</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span>最近 <strong className="text-slate-900 dark:text-white">{windowHours} 小时</strong> 内，从 <strong className="text-slate-900 dark:text-white">{totalRawItems.toLocaleString()}</strong> 条原始资讯中智能筛选出 <strong className="text-slate-900 dark:text-white">{totalFilteredItems.toLocaleString()}</strong> 条 AI 相关内容</span>
            </div>
          </div>

          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            数据平台详情
          </h3>
          
          <div className="space-y-3">
            {sortedSiteStats.map((stat) => {
              const siteInfo = sourceStatus?.sites.find(s => s.site_id === stat.site_id)
              const isOk = siteInfo?.ok !== false
              const info = SITE_INFO[stat.site_id]
              const isOpml = stat.site_id === 'opmlrss'
              
              return (
                <div key={stat.site_id} className="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      {isOk ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <div className="text-left">
                        <span className="font-medium text-slate-900 dark:text-white">{stat.site_name}</span>
                        {isOpml && (
                          <span className="ml-2 text-xs text-slate-500">({allOpmlFeeds.length} 个订阅)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        原始: <span className="text-slate-700 dark:text-slate-300">{stat.raw_count}</span>
                      </span>
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        AI: {stat.count}
                      </span>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-4 pt-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-600">
                    {info && (
                      <div className="mb-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{info.description}</p>
                        {info.url && (
                          <a
                            href={info.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {info.url}
                          </a>
                        )}
                      </div>
                    )}
                    
                    {isOpml && allOpmlFeeds.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                        {allOpmlFeeds.map((feed, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-slate-600 dark:text-slate-400 truncate py-1 px-2 bg-white dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-600"
                            title={feed.name}
                          >
                            {feed.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {sourceStatus?.failed_sites && sourceStatus.failed_sites.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">抓取失败的数据源</h4>
              <p className="text-xs text-red-600 dark:text-red-300">
                {sourceStatus.failed_sites.join('、')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
