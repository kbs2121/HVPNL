"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + Math.random() * 12 + 4;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0f1a]"
      >
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="h-24 w-24 rounded-full border-2 border-cyan-500/20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-10 w-10 text-cyan-400" />
          </div>
        </div>

        <h2 className="mb-1 text-xl font-semibold text-white">HSETCL Digital Twin</h2>
        <p className="mb-6 text-sm text-text-muted">Initializing transmission network...</p>

        <div className="w-64">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-center text-[10px] text-text-muted">
            {progress < 30 && "Loading GIS layers..."}
            {progress >= 30 && progress < 60 && "Connecting substations..."}
            {progress >= 60 && progress < 90 && "Calibrating power flow..."}
            {progress >= 90 && "Ready"}
          </p>
        </div>

        <GridAnimation />
      </motion.div>
    </AnimatePresence>
  );
}

function GridAnimation() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="cyan" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
