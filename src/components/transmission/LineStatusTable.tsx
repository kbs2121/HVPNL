"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransmissionLineStore } from "@/hooks/useTransmissionLineStore";
import { cn, getHealthBadgeClasses } from "@/lib/utils";

const PAGE_SIZE = 8;

export function LineStatusTable() {
  const [page, setPage] = useState(0);
  const getFilteredLines = useTransmissionLineStore((s) => s.getFilteredLines);
  const setSelectedLine = useTransmissionLineStore((s) => s.setSelectedLine);
  const selectedLine = useTransmissionLineStore((s) => s.selectedLine);
  const hierarchyFilters = useTransmissionLineStore((s) => s.hierarchyFilters);
  const filters = useTransmissionLineStore((s) => s.filters);

  const filtered = useMemo(
    () => getFilteredLines(),
    [getFilteredLines, hierarchyFilters, filters]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="line-status-table shrink-0 border-t border-border-subtle bg-surface-800/80">
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-xs font-semibold text-text-primary">Line Status Table</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-text-muted">{filtered.length} corridors</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-surface-600 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] text-text-muted">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-surface-600 disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="h-[calc(var(--table-height)-40px)] overflow-auto scrollbar-thin">
        <table className="w-full text-left text-[11px]">
          <thead className="sticky top-0 z-10 bg-surface-700 text-[10px] uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Line ID</th>
              <th className="px-4 py-2 font-semibold">Line Name</th>
              <th className="px-4 py-2 font-semibold">Voltage</th>
              <th className="px-4 py-2 font-semibold">Length</th>
              <th className="px-4 py-2 font-semibold">Health</th>
              <th className="px-4 py-2 font-semibold">Load</th>
              <th className="px-4 py-2 font-semibold">Issues</th>
              <th className="px-4 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((line) => (
              <tr
                key={line.line_id}
                onClick={() => setSelectedLine(line)}
                className={cn(
                  "cursor-pointer border-t border-border-subtle transition-colors hover:bg-surface-700/50",
                  selectedLine?.line_id === line.line_id && "bg-cyan-500/10"
                )}
              >
                <td className="px-4 py-2 font-mono text-cyan-400">{line.line_id}</td>
                <td className="max-w-[200px] truncate px-4 py-2 text-text-primary">
                  {line.line_name}
                </td>
                <td className="px-4 py-2 text-text-secondary">{line.voltage}</td>
                <td className="px-4 py-2 text-text-secondary">{line.length_km} km</td>
                <td className="px-4 py-2">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      getHealthBadgeClasses(line.health_score)
                    )}
                  >
                    {line.health_score}%
                  </span>
                </td>
                <td className="px-4 py-2 text-text-secondary">
                  {line.load_mw}/{line.capacity_mw} MW
                </td>
                <td className="px-4 py-2 text-text-secondary">{line.issues.length}</td>
                <td className="px-4 py-2">
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      line.status === "Optimal" && "text-emerald-400",
                      line.status === "Warning" && "text-amber-400",
                      line.status === "Critical" && "text-red-400",
                      line.status === "Shutdown" && "text-orange-400"
                    )}
                  >
                    {line.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
