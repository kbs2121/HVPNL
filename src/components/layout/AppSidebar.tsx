"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Cable,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Map,
  Settings,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { useLayoutStore } from "@/hooks/useLayoutStore";
import { resolveActiveModule } from "@/components/layout/ModuleSwitcher";
import { cn } from "@/lib/utils";

const navItems = [
  {
    icon: Zap,
    label: "Transmission Network GIS",
    href: "/dashboard/power-grid",
    moduleId: "transmission-network" as const,
  },
  {
    icon: LayoutDashboard,
    label: "Substation GIS",
    href: "/dashboard/substation-gis",
    moduleId: "substation-gis" as const,
  },
  /*
  {
    icon: Cable,
    label: "Corridor Monitoring",
    href: "/dashboard/transmission-line-monitoring",
    moduleId: "corridor" as const,
  },
  */
  {
    icon: Map,
    label: "Network Digital Twin",
    href: "/digital-twin",
    moduleId: "digital-twin" as const,
  },
  /*
  { icon: Activity, label: "Health Monitor", href: "#" },
  { icon: Wrench, label: "Work Orders", href: "#" },
  { icon: Users, label: "Crew Management", href: "#" },
  */
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
    moduleId: "analytics" as const,
  },
  /*
  { icon: Settings, label: "Settings", href: "#" },
  */
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const resolvedActive = resolveActiveModule(pathname);
  const [optimisticModule, setOptimisticModule] = useState<string | null>(null);

  const isCollapsed = useLayoutStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);

  const activeModule = optimisticModule ?? resolvedActive;

  // Sync back when pathname changes
  useEffect(() => {
    setOptimisticModule(null);
  }, [pathname]);

  // Pre-warm all sidebar routes for instant switching
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.href && item.href !== "#") {
        try {
          router.prefetch(item.href);
        } catch {
          /* no-op */
        }
      }
    });
  }, [router]);

  return (
    <aside
      className={cn(
        "sidebar-container relative z-40 flex h-screen shrink-0 flex-col border-r border-border-subtle bg-surface-800",
        isCollapsed ? "collapsed w-16" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-border-subtle py-4",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20">
            <Zap className="h-5 w-5 text-cyan-400" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-text-primary">Grid SMS</h1>
              <p className="truncate text-[11px] text-text-muted">Unified Monitoring</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-600 hover:text-text-primary"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 scrollbar-thin">
        {!isCollapsed && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Navigation
          </p>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active =
              "moduleId" in item && item.moduleId
                ? activeModule === item.moduleId
                : item.href !== "#" &&
                  (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  prefetch={true}
                  title={isCollapsed ? item.label : undefined}
                  onPointerDown={() => {
                    if (item.href !== "#" && pathname !== item.href && "moduleId" in item && item.moduleId) {
                      setOptimisticModule(item.moduleId);
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.href !== "#" && pathname !== item.href) {
                      if ("moduleId" in item && item.moduleId) {
                        setOptimisticModule(item.moduleId);
                      }
                      startTransition(() => {
                        router.push(item.href);
                      });
                    }
                  }}
                  className={cn(
                    "flex w-full items-center rounded-lg py-2 text-sm transition-colors cursor-pointer select-none touch-manipulation active:scale-[0.98]",
                    isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                    active
                      ? "bg-cyan-500/10 text-cyan-400 font-medium"
                      : "text-text-secondary hover:bg-surface-600 hover:text-text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0 pointer-events-none" />
                  {!isCollapsed && <span className="truncate pointer-events-none">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {isCollapsed && (
        <div className="border-t border-border-subtle p-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg py-2 text-text-muted transition-colors hover:bg-surface-600 hover:text-text-primary"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
