"use client";

import { Moon, Satellite, Sun } from "lucide-react";
import type { MapTheme } from "@/lib/powerGrid/mapThemes";
import { MAP_THEMES } from "@/lib/powerGrid/mapThemes";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  theme: MapTheme;
  onChange: (theme: MapTheme) => void;
  className?: string;
}

const ICONS = { dark: Moon, light: Sun, satellite: Satellite } as const;

export function ThemeSwitcher({ theme, onChange, className }: ThemeSwitcherProps) {
  return (
    <div className={cn("flex items-center gap-1 rounded-xl border border-white/10 bg-black/20 p-1", className)}>
      {(Object.keys(MAP_THEMES) as MapTheme[]).map((key) => {
        const Icon = ICONS[key];
        const active = theme === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={`${MAP_THEMES[key].label} mode`}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all",
              active
                ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                : "text-text-muted hover:bg-white/5 hover:text-text-primary"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {MAP_THEMES[key].label}
          </button>
        );
      })}
    </div>
  );
}
