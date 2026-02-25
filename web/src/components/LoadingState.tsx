export function LoadingState() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
