import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("mplad_theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark"; // Default to Apple Liquid Glass dark mode
  });

  const [glassIntensity, setGlassIntensity] = useState(() => {
    const saved = localStorage.getItem("mplad_glass_intensity");
    return saved ? Number(saved) : 85; // 85% default liquid glass
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("mplad_theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const factor = glassIntensity / 100;
    const blurPx = Math.round(12 + factor * 24); // 12px to 36px blur
    const opacityLight = (0.35 + factor * 0.35).toFixed(2);
    const opacityDark = (0.45 + factor * 0.35).toFixed(2);

    root.style.setProperty("--glass-intensity", factor.toString());
    root.style.setProperty("--glass-blur", `${blurPx}px`);
    root.style.setProperty("--liquid-glass-opacity-light", opacityLight);
    root.style.setProperty("--liquid-glass-opacity-dark", opacityDark);

    localStorage.setItem("mplad_glass_intensity", glassIntensity.toString());
  }, [glassIntensity]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      isDark: theme === "dark",
      glassIntensity,
      setGlassIntensity 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark",
      isDark: true,
      toggleTheme: () => {},
      setTheme: () => {},
      glassIntensity: 85,
      setGlassIntensity: () => {}
    };
  }
  return ctx;
};
