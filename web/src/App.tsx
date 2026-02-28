import { useState } from 'react'
import { Header } from './components/Header'
import { StatsCards } from './components/StatsCards'
import { FilterBar } from './components/FilterBar'
import { NewsList } from './components/NewsList'
import { SourceModal } from './components/SourceModal'
import { ReadingHistoryModal } from './components/ReadingHistoryModal'
import { FavoritesModal } from './components/FavoritesModal'
import { SwitchingOverlay } from './components/SwitchingOverlay'
import { useTheme } from './hooks/useTheme'
import { useNewsData } from './hooks/useNewsData'
import { useVisitedLinks } from './hooks/useVisitedLinks'
import { useFavorites } from './hooks/useFavorites'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const { visitedLinks, markAsVisited, clearAll } = useVisitedLinks()
  const { favorites, toggleFavorite, removeFavorite, clearAll: clearAllFavorites, isFavorite } = useFavorites()

  const {
    data,
    loading,
    error,
    filteredItems,
    siteStats,
    sourceStats,
    searchQuery,
    setSearchQuery,
    selectedSite,
    setSelectedSite,
    selectedSource,
    setSelectedSource,
    loadMore,
    hasMore,
    refresh,
    timeRange,
    setTimeRange,
    isSwitching,
  } = useNewsData()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onRefresh={refresh}
        loading={loading}
        generatedAt={data?.generated_at}
        windowHours={data?.window_hours}
        onShowSources={() => setShowSourceModal(true)}
        onShowHistory={() => setShowHistoryModal(true)}
        onShowFavorites={() => setShowFavoritesModal(true)}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        isSwitching={isSwitching}
      />
      
      {isSwitching && <SwitchingOverlay timeRange={timeRange} />}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsCards
          totalItems={data?.total_items || 0}
          sourceCount={data?.source_count || 0}
          windowHours={data?.window_hours || 24}
          siteStats={siteStats}
          onShowSources={() => setShowSourceModal(true)}
        />
        
        <FilterBar
          siteStats={siteStats}
          sourceStats={sourceStats}
          selectedSite={selectedSite}
          onSiteChange={setSelectedSite}
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <NewsList
          items={filteredItems}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          visitedLinks={visitedLinks}
          onVisit={markAsVisited}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-700 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            AI 资讯聚合 · 数据来源于多个 AI 资讯平台
          </p>
        </div>
      </footer>

      <SourceModal
        isOpen={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        siteStats={siteStats}
        sourceCount={data?.source_count || 0}
        windowHours={data?.window_hours || 24}
      />

      <ReadingHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        visitedLinks={visitedLinks}
        onClearAll={clearAll}
      />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        favorites={favorites}
        onRemove={removeFavorite}
        onClearAll={clearAllFavorites}
      />
    </div>
  )
}

export default App
