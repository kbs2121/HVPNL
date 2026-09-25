"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsThemeMode } from "@/lib/analytics/analyticsUiTheme";

export function AnalyticsThemeToggle({
  theme,
  onToggle,
  className,
}: {
  theme: AnalyticsThemeMode;
  onToggle: () => void;
  className?: string;
}) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "relative inline-flex h-8 w-[4.25rem] shrink-0 items-center rounded-full border p-0.5 transition-all duration-300",
        isDark
          ? "border-slate-600/70 bg-slate-950/80"
          : "border-slate-300/90 bg-slate-100 shadow-inner shadow-slate-200/80",
        className
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full transition-all duration-300 shadow-sm",
          isDark
            ? "left-0.5 bg-gradient-to-br from-sky-500/40 to-slate-700"
            : "left-[calc(50%+1px)] bg-white ring-1 ring-slate-200/80"
        )}
      />
      <span className="relative z-10 flex w-1/2 items-center justify-center">
        <Moon className={cn("h-3.5 w-3.5", isDark ? "text-sky-300" : "text-slate-400")} />
      </span>
      <span className="relative z-10 flex w-1/2 items-center justify-center">
        <Sun className={cn("h-3.5 w-3.5", !isDark ? "text-amber-500" : "text-slate-500")} />
      </span>
    </button>
  );
}
