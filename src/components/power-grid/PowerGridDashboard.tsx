"use client";

import dynamic from "next/dynamic";

const PowerGridMap = dynamic(
  () => import("./PowerGridMap").then((m) => m.PowerGridMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0f1a]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-text-muted">Loading Power Grid GIS...</p>
        </div>
      </div>
    ),
  }
);

export function PowerGridDashboard() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0f1a]">
      <PowerGridMap />
    </div>
  );
}
