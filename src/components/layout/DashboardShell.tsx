"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ModuleSwitcher } from "@/components/layout/ModuleSwitcher";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  hideSidebar = false,
  className,
}: {
  children: React.ReactNode;
  hideSidebar?: boolean;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-surface-900", className)}>
      {!hideSidebar && <AppSidebar />}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-40 flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-surface-800/80 px-3 py-1.5 sm:px-4 backdrop-blur-md">
          <div className="flex min-w-0 flex-1 items-center">
            <ModuleSwitcher />
          </div>
          <div id="header-right-slot" className="flex items-center gap-2.5 shrink-0" />
        </header>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
