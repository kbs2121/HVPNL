"use client";

import { useEffect } from "react";
import { useDigitalTwinStore, hydrateThemeStore } from "@/hooks/useDigitalTwinStore";
import { API_BASE } from "@/lib/digitalTwin/constants";
import { DigitalTwinHeader, KpiRibbon } from "./controls/DigitalTwinHeader";
import { DigitalTwinMap } from "./map/DigitalTwinMap";
import { LayerControl } from "./controls/LayerControl";
import { MapLegend } from "./controls/MapLegend";
import { StatusBar } from "./controls/StatusBar";
import { LiveDashboard } from "./dashboard/LiveDashboard";
import { LoadingScreen } from "./LoadingScreen";

export function DigitalTwinLayout() {
  const { showLoading, setShowLoading, setConnected, refreshDashboard } = useDigitalTwinStore();

  useEffect(() => {
    hydrateThemeStore();
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    const connect = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        setConnected(res.ok);
      } catch {
        setConnected(false);
      }
      try {
        ws = new WebSocket(`${API_BASE.replace("http", "ws")}/ws`);
        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onmessage = () => refreshDashboard();
      } catch { /* optional */ }
    };
    connect();
    const interval = setInterval(refreshDashboard, 10000);
    return () => { ws?.close(); clearInterval(interval); };
  }, [setConnected, refreshDashboard]);

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  return (
    <div className="dt-theme-dark relative h-screen w-screen overflow-hidden bg-[#0a0f1a]">
      <DigitalTwinMap />
      <DigitalTwinHeader />
      <LiveDashboard />
      <KpiRibbon />
      <LayerControl />
      <MapLegend />
      <StatusBar />
    </div>
  );
}
