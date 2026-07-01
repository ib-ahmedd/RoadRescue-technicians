export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "roadrescue-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem("roadrescue-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){}})();`;
