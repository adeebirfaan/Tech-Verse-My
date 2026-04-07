"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-secondary/50 animate-pulse border border-border" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-colors relative overflow-hidden flex items-center justify-center group"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 absolute transition-all duration-300 transform dark:-rotate-90 dark:opacity-0 dark:scale-50 text-yellow-500" />
      <Moon className="h-5 w-5 transition-all duration-300 transform rotate-90 opacity-0 scale-50 dark:rotate-0 dark:opacity-100 dark:scale-100 text-blue-400" />
    </button>
  );
}
