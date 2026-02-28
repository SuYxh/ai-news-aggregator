import { useState } from 'react'
import { X, Star, Trash2, ExternalLink, AlertTriangle, Download } from 'lucide-react'
import type { FavoriteInfo } from '../hooks/useFavorites'
import { exportToJson } from '../utils/exportData'

interface FavoritesModalProps {
  isOpen: boolean
  onClose: () => void
  favorites: Record<string, FavoriteInfo>
  onRemove: (url: string) => void
  onClearAll: () => void
}

interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  count: number
}

function ConfirmDialog({ isOpen, onConfirm, onCancel, count }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            确认清空
          </h3>
        </div>
        
        <div className="mb-6 text-sm text-slate-600 dark:text-slate-300 space-y-2">
          <p>您确定要清空所有收藏吗？</p>
          <p className="text-slate-500 dark:text-slate-400">
            此操作将删除 <span className="font-medium text-red-600 dark:text-red-400">{count}</span> 条收藏记录，清空后无法恢复。
          </p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            确认清空
          </button>
        </div>
      </div>
    </div>
  )
}

export function FavoritesModal({ 
  isOpen, 
  onClose, 
  favorites,
  onRemove,
  onClearAll 
}: FavoritesModalProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  if (!isOpen) return null

  const sortedFavorites = Object.entries(favorites)
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .map(([url, info]) => ({
      url,
      timestamp: info.timestamp,
      title: info.title,
      displayTime: formatFavoriteTime(info.timestamp)
    }))

  const handleClearAll = () => {
    setShowConfirm(true)
  }

  const handleConfirmClear = () => {
    onClearAll()
    setShowConfirm(false)
  }

  const handleRemove = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove(url)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  我的收藏
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  共 {sortedFavorites.length} 条记录
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {sortedFavorites.length > 0 && (
                <>
                  <button
                    onClick={() => exportToJson(favorites, 'favorites')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    导出
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    清空
                  </button>
                </>
              )}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {sortedFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <Star className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">暂无收藏</p>
                <p className="text-sm mt-1">点击新闻卡片上的星标即可收藏</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedFavorites.map(({ url, title, displayTime }) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                          {title || extractTitle(url)}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate flex-1 min-w-0">
                            {url}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                              {displayTime} 收藏
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRemove(e, url)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                        title="取消收藏"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onConfirm={handleConfirmClear}
        onCancel={() => setShowConfirm(false)}
        count={sortedFavorites.length}
      />
    </div>
  )
}

function formatFavoriteTime(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}

function extractTitle(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace('www.', '')
    
    if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
      const match = url.match(/status\/(\d+)/)
      if (match) return `Twitter/X 推文 #${match[1].slice(-6)}`
    }
    
    if (hostname.includes('github.com')) {
      const parts = urlObj.pathname.split('/').filter(Boolean)
      if (parts.length >= 2) return `GitHub: ${parts[0]}/${parts[1]}`
    }
    
    const pathname = urlObj.pathname
    if (pathname && pathname !== '/') {
      const cleanPath = pathname.replace(/\/$/, '').split('/').pop() || ''
      if (cleanPath) {
        return decodeURIComponent(cleanPath).replace(/[-_]/g, ' ').slice(0, 60)
      }
    }
    
    return hostname
  } catch {
    return url.slice(0, 60)
  }
}
