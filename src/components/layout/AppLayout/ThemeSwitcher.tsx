"use client";

import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";

const THEMES = [
  { id: "jari", label: "Pastel Light" },
  { id: "jarinight", label: "Pastel Dark" },
];

const STORAGE_KEY = "jari-theme";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("jari");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const pick = (t: string) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  return (
    <div className="dropdown dropdown-end">
      <button tabIndex={0} className="btn btn-ghost btn-sm gap-1">
        <Palette size={16} />
        <span className="hidden sm:inline">
          {THEMES.find((t) => t.id === theme)?.label ?? theme}
        </span>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 border-base-300 rounded-box z-50 mt-2 w-48 border p-2 shadow-lg"
      >
        {THEMES.map((t) => (
          <li key={t.id}>
            <button onClick={() => pick(t.id)} className="justify-between">
              {t.label}
              {theme === t.id && <Check size={14} className="text-primary" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
