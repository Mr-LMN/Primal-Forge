/**
 * PRIMALFORGE — THEME SYSTEM
 * Light/dark palette with React Context.
 * Toggle persisted to AsyncStorage.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "pf_theme_v1";

/* ─── Dark palette (original) ─── */
export const DARK = {
  bg:         "#0a0a0a",
  bg2:        "#111111",
  card:       "#161616",
  cardHi:     "#1e1e1e",
  border:     "#262626",
  borderHi:   "#3a3a3a",
  text:       "#f0f0f0",
  textDim:    "#9a9a9a",
  textMute:   "#555555",
  optimal:    "#22c55e",
  warning:    "#f59e0b",
  penalty:    "#ef4444",
  science:    "#0ea5e9",
  gold:       "#f5b400",
  fire:       "#ff6b2b",
  // Gradient stops for header
  headerGrad: ["#0a0a0a", "#161616"] as [string, string],
  tabBg:      "#111111",
};

/* ─── Light palette ─── */
export const LIGHT = {
  bg:         "#f8f7f5",
  bg2:        "#efefed",
  card:       "#ffffff",
  cardHi:     "#f0efed",
  border:     "#e0dedd",
  borderHi:   "#cccccc",
  text:       "#1a1a1a",
  textDim:    "#5a5a5a",
  textMute:   "#aaaaaa",
  optimal:    "#16a34a",
  warning:    "#d97706",
  penalty:    "#dc2626",
  science:    "#0284c7",
  gold:       "#d97706",
  fire:       "#ea580c",
  headerGrad: ["#ffffff", "#f5f5f3"] as [string, string],
  tabBg:      "#ffffff",
};

export type Palette = typeof DARK;

/* ─── Context ─── */
type ThemeCtx = {
  isDark: boolean;
  toggleTheme: () => void;
  C: Palette;
};

export const ThemeContext = createContext<ThemeCtx>({
  isDark: true,
  toggleTheme: () => {},
  C: DARK,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === "light") setIsDark(false);
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, C: isDark ? DARK : LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
