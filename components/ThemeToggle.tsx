"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Cycle through the three modes to match your Settings logic
  const toggleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
      aria-label="Toggle Theme"
      title={`Current Theme: ${theme}`}
    >
      {theme === "light" && <Sun size={20} className="text-blue-600" />}
      {theme === "dark" && <Moon size={20} className="text-blue-400" />}
      {theme === "system" && <Monitor size={20} className="text-gray-500 dark:text-gray-400" />}
    </button>
  );
}