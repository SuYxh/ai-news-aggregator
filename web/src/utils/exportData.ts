export interface ExportItem {
  url: string
  title: string
  timestamp: number
  time: string
}

export interface ExportData {
  exportType: 'favorites' | 'reading-history'
  exportTime: string
  count: number
  data: ExportItem[]
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}

export function exportToJson(
  data: Record<string, { timestamp: number; title: string }>,
  type: 'favorites' | 'reading-history'
) {
  const items: ExportItem[] = Object.entries(data)
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .map(([url, info]) => ({
      url,
      title: info.title || '',
      timestamp: info.timestamp,
      time: formatTime(info.timestamp)
    }))

  const exportData: ExportData = {
    exportType: type,
    exportTime: new Date().toISOString(),
    count: items.length,
    data: items
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `ai-news-${type}-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
