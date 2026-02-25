import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '未知时间'
  
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return '未知时间'
    
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: zhCN 
    })
  } catch {
    return '未知时间'
  }
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '未知时间'
  
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return '未知时间'
    
    return format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN })
  } catch {
    return '未知时间'
  }
}

export function formatTime(dateString: string | null): string {
  if (!dateString) return ''
  
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return ''
    
    return format(date, 'HH:mm', { locale: zhCN })
  } catch {
    return ''
  }
}
