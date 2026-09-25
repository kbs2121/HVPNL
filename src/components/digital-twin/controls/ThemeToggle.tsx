"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Monitor } from "lucide-react";
import { useDigitalTwinStore, hydrateThemeStore } from "@/hooks/useDigitalTwinStore";
import type { ThemeMode } from "@/lib/types/digitalTwin";
import { basemapForTheme } from "@/lib/digitalTwin/basemaps";
import { cn } from "@/lib/utils";

const MODES: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: "light", icon: Sun, label: "Light" },
  { mode: "dark", icon: Moon, label: "Dark" },
  { mode: "auto", icon: Monitor, label: "Auto" },
];

export function ThemeToggle() {
  const { themeMode, setThemeMode, setBasemap, basemapId } = useDigitalTwinStore();

  useEffect(() => {
    hydrateThemeStore();
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      if (useDigitalTwinStore.getState().themeMode === "auto") {
        const resolved = mq.matches ? "light" : "dark";
        useDigitalTwinStore.setState({ resolvedTheme: resolved });
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cycle = () => {
    const idx = MODES.findIndex((m) => m.mode === themeMode);
    const next = MODES[(idx + 1) % MODES.length];
    setThemeMode(next.mode);
    const resolved = next.mode === "auto"
      ? window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
      : next.mode;
    useDigitalTwinStore.setState({ resolvedTheme: resolved });
    // Sync basemap unless on satellite
    if (basemapId !== "esri-satellite" && basemapId !== "mapbox-satellite") {
      setBasemap(basemapForTheme(resolved));
    }
  };

  const current = MODES.find((m) => m.mode === themeMode) ?? MODES[1];
  const Icon = current.icon;

  return (
    <button
      onClick={cycle}
      title={`Theme: ${current.label}`}
      className="group relative flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-white/10"
    >
      <motion.div
        key={themeMode}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Icon className="h-4 w-4 text-text-secondary group-hover:text-cyan-400" />
      </motion.div>
    </button>
  );
}

/** Full theme selector for settings panel */
export function ThemeSelector() {
  const { themeMode, setThemeMode, setBasemap, basemapId } = useDigitalTwinStore();

  return (
    <div className="flex gap-1 rounded-xl bg-white/5 p-1">
      {MODES.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => {
            setThemeMode(mode);
            const resolved =
              mode === "auto"
                ? window.matchMedia("(prefers-color-scheme: light)").matches
                  ? "light"
                  : "dark"
                : mode;
            useDigitalTwinStore.setState({ resolvedTheme: resolved });
            if (basemapId !== "esri-satellite" && basemapId !== "mapbox-satellite") {
              setBasemap(basemapForTheme(resolved));
            }
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-medium transition-all",
            themeMode === mode
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
