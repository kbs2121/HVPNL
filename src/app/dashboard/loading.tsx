export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center bg-surface-900">
      <div className="flex flex-col items-center gap-2.5">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <p className="text-[11px] font-medium tracking-wide text-slate-400">Loading view…</p>
      </div>
    </div>
  );
}
