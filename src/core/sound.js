// src/core/sound.js
import { getSettings } from "./storage.js";

const audioCache = new Map();

function getAudio(name) {
  if (!name) return null;

  if (audioCache.has(name)) {
    return audioCache.get(name);
  }

  // Ajusta la ruta cuando tengas clara la carpeta de sonidos
  const audio = new Audio(`../assets/sounds/${name}.mp3`);
  audioCache.set(name, audio);
  return audio;
}

/**
 * modo: "trabajo" | "estudio" | "deporte" | "descanso"
 */
export function playIntervalSound(modo) {
  const settings = getSettings();

  // Ajuste global de sonido
  if (!settings.soundsEnabled) return;

  const soundSettings = settings.sounds || {};

  // Silencio total desde ajustes
  if (soundSettings.muted) return;

  const key = modo; // mismo nombre que en settings.sounds
  const soundName = soundSettings[key];
  if (!soundName) return;

  const audio = getAudio(soundName);
  if (!audio) return;

  const volume =
    typeof soundSettings.volume === "number" ? soundSettings.volume : 0.8;

  audio.volume = Math.max(0, Math.min(1, volume));
  audio.currentTime = 0;

  audio.play().catch((err) => {
    console.warn("No se pudo reproducir el sonido:", err);
  });
}

/**
 * Sonidos de cuenta atrás (no dependen del modo de trabajo/estudio/deporte)
 * Usamos rutas "ui/..." → ../assets/sounds/ui/countdown_beep.mp3, etc.
 */
export function playCountdownBeep() {
  const settings = getSettings();
  if (!settings.soundsEnabled) return;
  if (settings.sounds?.muted) return;

  const audio = getAudio("ui/countdown_beep");
  if (!audio) return;

  const volume =
    typeof settings.sounds?.volume === "number"
      ? settings.sounds.volume
      : 0.8;

  audio.volume = Math.max(0, Math.min(1, volume));
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function playCountdownGo() {
  const settings = getSettings();
  if (!settings.soundsEnabled) return;
  if (settings.sounds?.muted) return;

  const audio = getAudio("ui/countdown_go");
  if (!audio) return;

  const volume =
    typeof settings.sounds?.volume === "number"
      ? settings.sounds.volume
      : 0.8;

  audio.volume = Math.max(0, Math.min(1, volume));
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function stopAllSounds() {
  for (const audio of audioCache.values()) {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {
      // ignoramos errores
    }
  }
}

export function playFinishSound() {
  const settings = getSettings();
  if (!settings.soundsEnabled) return;

  const soundSettings = settings.sounds || {};
  if (soundSettings.muted) return;

  const soundName = soundSettings.finish || "winfantasia-6912";
  const audio = getAudio(soundName);
  if (!audio) return;

  const volume =
    typeof soundSettings.volume === "number"
      ? soundSettings.volume
      : 0.8;

  audio.volume = Math.max(0, Math.min(1, volume));
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
