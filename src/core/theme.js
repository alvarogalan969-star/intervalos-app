import { getSettings, saveSettings } from "./storage.js";

const THEME_KEY = "theme";

function applyThemeToDocument(theme) {
  const body = document.body;

  // Quitamos posibles temas anteriores
  body.classList.remove(
    "bg-slate-900",
    "text-slate-100",
    "bg-slate-100",
    "text-slate-900"
  );

  if (theme === "light") {
    body.classList.add("bg-slate-100", "text-slate-900");
  } else {
    // dark por defecto
    body.classList.add("bg-slate-900", "text-slate-100");
  }
}

function applyModeToDocument(mode) {
  const body = document.body;

  body.classList.remove("mode-trabajo", "mode-estudio", "mode-deporte", "mode-neutral");
  body.classList.add(`mode-${mode}`);
}

function setTheme(theme) {
  const body = document.body;

  body.classList.remove(
    "bg-slate-900",
    "text-slate-100",
    "bg-slate-100",
    "text-slate-900"
  );

  if (theme === "dark") {
    body.classList.add("bg-slate-900", "text-slate-100");
  } else {
    body.classList.add("bg-slate-100", "text-slate-900");
  }

  body.dataset.theme = theme;
}

export function applyInitialTheme() {
  const saved = localStorage.getItem("theme");

  // Si existe en localStorage, se usa sin mirar nada más
  if (saved) {
    setTheme(saved);
    return;
  }

  // Si no existe, entonces sí miramos la preferencia del sistema
  const systemPrefersDark =
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  setTheme(systemPrefersDark ? "dark" : "light");
}

export function updateTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  setTheme(theme);
}

export function updateActiveMode(mode) {
  const settings = getSettings();
  const newSettings = { ...settings, activeMode: mode };
  saveSettings(newSettings);
  applyModeToDocument(mode);
}

export function getActiveMode() {
  const settings = getSettings();
  return settings.activeMode || "neutral";
}


