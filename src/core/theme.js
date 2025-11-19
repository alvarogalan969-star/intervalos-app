import { getSettings, saveSettings } from "./storage.js";

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

export function applyInitialTheme() {
  const settings = getSettings();
  const theme = settings.theme || "dark";
  const mode = settings.activeMode || "neutral";
  applyThemeToDocument(theme);
  applyModeToDocument(mode);
}

export function updateTheme(theme) {
  const settings = getSettings();
  const newSettings = { ...settings, theme };
  saveSettings(newSettings);
  applyThemeToDocument(theme);
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
