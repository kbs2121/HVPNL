"use client";

import { Globe, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import type { MapTheme } from "@/lib/powerGrid/mapThemes";
import { MAP_THEMES } from "@/lib/powerGrid/mapThemes";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  theme: MapTheme;
  onChange: (theme: MapTheme) => void;
  className?: string;
}

const ICONS = {
  dark: Moon,
  light: Sun,
  satellite: Globe,
} as const;

export function ThemeSwitcher({ theme, onChange, className }: ThemeSwitcherProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-1 rounded-xl border border-white/10 bg-surface-900/85 p-1 shadow-inner backdrop-blur-xl",
        className
      )}
    >
      {(Object.keys(MAP_THEMES) as MapTheme[]).map((key) => {
        const Icon = ICONS[key];
        const active = theme === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={`${MAP_THEMES[key].label} basemap`}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors duration-200 z-10",
              active ? "text-cyan-300" : "text-slate-400 hover:text-white"
            )}
          >
            {active && (
              <motion.div
                layoutId="activeMapThemePill"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/40 shadow-sm shadow-cyan-500/25 -z-10"
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10">{MAP_THEMES[key].label}</span>
          </button>
        );
      })}
    </div>
  );
}
