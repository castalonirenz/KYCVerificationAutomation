import create from "zustand";

type Theme = "light" | "dark";

interface UIStore {
  sidebarCollapsed: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved as Theme;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarCollapsed: false,
  theme: readInitialTheme(),

  toggleSidebar() {
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
  },

  setSidebarCollapsed(v) {
    set({ sidebarCollapsed: v });
  },

  toggleTheme() {
    const next = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    try {
      localStorage.setItem("theme", next);
    } catch {}
    applyTheme(next);
  },

  setTheme(t) {
    set({ theme: t });
    try {
      localStorage.setItem("theme", t);
    } catch {}
    applyTheme(t);
  },
}));

// apply initial theme on module load
applyTheme(readInitialTheme());

export default useUIStore;
