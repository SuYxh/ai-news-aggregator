import { SITE_COLORS, DEFAULT_BADGE_COLOR } from '../utils/constants'

interface SourceBadgeProps {
  siteId: string
  siteName: string
}

export function SourceBadge({ siteId, siteName }: SourceBadgeProps) {
  const colorClass = SITE_COLORS[siteId] || DEFAULT_BADGE_COLOR
  
  return (
    <span className={`badge ${colorClass}`}>
      {siteName}
    </span>
  )
}
