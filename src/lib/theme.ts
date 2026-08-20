import { ThemeName } from "../types";

export interface ThemeColors {
  primary: string;
  bg: string;
  muted: string;
  faint: string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  navy: { primary: "#131B3A", bg: "#EEF1F6", muted: "#4A5170", faint: "#9AA1BD" },
  forest: { primary: "#1F5C4F", bg: "#F0F4F1", muted: "#3D5A50", faint: "#9AB5AC" },
  coral: { primary: "#A13D2F", bg: "#F7F0ED", muted: "#7A5048", faint: "#C9A79E" },
  plum: { primary: "#4B2E58", bg: "#F3EEF5", muted: "#6B5473", faint: "#B9A6C2" },
  dark: { primary: "#1E293B", bg: "#0F172A", muted: "#94A3B8", faint: "#64748B" },
};

export function applyTheme(themeName: ThemeName) {
  const theme = THEMES[themeName] || THEMES.navy;
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--faint", theme.faint);

  if (themeName === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

