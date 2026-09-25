"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ANALYTICS_THEME_STORAGE_KEY,
  ANALYTICS_UI,
  type AnalyticsThemeMode,
} from "@/lib/analytics/analyticsUiTheme";

export function useAnalyticsTheme() {
  const [theme, setThemeState] = useState<AnalyticsThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ANALYTICS_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }
    setReady(true);
  }, []);

  const setTheme = useCallback((mode: AnalyticsThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(ANALYTICS_THEME_STORAGE_KEY, mode);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return {
    theme,
    setTheme,
    toggle,
    ready,
    ui: ANALYTICS_UI[theme],
  };
}
