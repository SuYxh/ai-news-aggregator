declare global {
  interface Window {
    _hmt?: [string, ...unknown[]][]
  }
}

export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
) {
  if (window._hmt) {
    window._hmt.push(['_trackEvent', category, action, label, value])
  }
}

export const Analytics = {
  trackSiteFilter: (siteId: string, siteName: string) => {
    trackEvent('Filter', 'click_site', `${siteName}(${siteId})`)
  },

  trackSourceFilter: (source: string) => {
    trackEvent('Filter', 'click_source', source)
  },

  trackSearch: (query: string) => {
    trackEvent('Search', 'search', query)
  },

  trackTimeRange: (range: string) => {
    trackEvent('Header', 'click_time_range', range)
  },

  trackFavorites: () => {
    trackEvent('Header', 'click_favorites')
  },

  trackHistory: () => {
    trackEvent('Header', 'click_history')
  },

  trackGithub: () => {
    trackEvent('Header', 'click_github')
  },

  trackThemeToggle: (theme: string) => {
    trackEvent('Header', 'click_theme', theme)
  },

  trackLogo: () => {
    trackEvent('Header', 'click_logo')
  },

  trackSourcesDetail: () => {
    trackEvent('Stats', 'click_sources_detail')
  },

  trackNewsClick: (title: string, source: string, siteId: string) => {
    trackEvent('News', 'click_article', `${source}|${siteId}|${title.slice(0, 50)}`)
  },

  trackNewsFavorite: (title: string, action: 'add' | 'remove') => {
    trackEvent('News', action === 'add' ? 'favorite_add' : 'favorite_remove', title.slice(0, 50))
  },

  trackLoadMore: () => {
    trackEvent('News', 'click_load_more')
  },
}
