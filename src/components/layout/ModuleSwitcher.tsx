"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, LayoutDashboard, Map, Zap, Cable } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const MODULES = [
  {
    id: "transmission-network",
    label: "Transmission Network GIS",
    href: "/dashboard/power-grid",
    icon: Zap,
  },
  {
    id: "substation-gis",
    label: "Substation GIS",
    href: "/dashboard/substation-gis",
    icon: LayoutDashboard,
  },
  /* 
  // Commented out for future release
  {
    id: "corridor",
    label: "Corridor Monitoring",
    href: "/dashboard/transmission-line-monitoring",
    icon: Cable,
  },
  */
  {
    id: "digital-twin",
    label: "Network Digital Twin",
    href: "/digital-twin",
    icon: Map,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];

export function resolveActiveModule(pathname: string): ModuleId {
  if (pathname.startsWith("/dashboard/substation-gis")) return "substation-gis";
  if (pathname.startsWith("/dashboard/substation-monitoring")) return "substation-gis";
  if (pathname.startsWith("/digital-twin")) return "digital-twin";
  if (pathname.startsWith("/dashboard/analytics")) return "analytics";
  if (pathname.startsWith("/dashboard/power-grid") || pathname === "/" || pathname === "") {
    return "transmission-network";
  }
  return "transmission-network";
}

export function ModuleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const resolvedActive = resolveActiveModule(pathname);
  const [optimisticActive, setOptimisticActive] = useState<ModuleId | null>(null);

  const active = optimisticActive ?? resolvedActive;

  // Sync back when pathname changes
  useEffect(() => {
    setOptimisticActive(null);
  }, [pathname]);

  // Pre-warm all module routes in memory for instant switching
  useEffect(() => {
    MODULES.forEach((mod) => {
      try {
        router.prefetch(mod.href);
      } catch {
        /* no-op */
      }
    });
  }, [router]);

  return (
    <div
      className={cn(
        "relative flex items-center gap-1 overflow-x-auto scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-xl border border-border-subtle bg-surface-800/90 p-1 backdrop-blur-md shrink-0 max-w-full z-10",
        className
      )}
      role="tablist"
      aria-label="GIS modules"
    >
      {MODULES.map((mod) => {
        const isActive = active === mod.id;
        return (
          <Link
            key={mod.id}
            href={mod.href}
            prefetch={true}
            role="tab"
            aria-selected={isActive}
            onPointerDown={() => {
              if (pathname !== mod.href) {
                setOptimisticActive(mod.id);
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              if (pathname !== mod.href) {
                setOptimisticActive(mod.id);
                startTransition(() => {
                  router.push(mod.href);
                });
              }
            }}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-150 z-10 cursor-pointer select-none touch-manipulation active:scale-[0.98]",
              isActive
                ? "text-cyan-300"
                : "text-slate-400 hover:bg-surface-600/50 hover:text-slate-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeModuleTabPill"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 shadow-sm shadow-cyan-500/20 -z-10 pointer-events-none"
              />
            )}
            <mod.icon className={cn("h-3.5 w-3.5 relative z-10 pointer-events-none", isActive ? "text-cyan-400" : "text-slate-400")} />
            <span className="whitespace-nowrap relative z-10 pointer-events-none">{mod.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
