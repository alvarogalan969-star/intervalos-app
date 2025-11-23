import { getSettings, saveSettings } from "./storage.js";

// Caché interna de sonidos cargados
const soundCache = {};

// Carga un sonido por nombre (si existe en assets/sounds/)
export function loadSound(filename) {
  if (soundCache[filename]) return soundCache[filename];

  const howl = new Howl({
    src: [`/assets/sounds/${filename}.mp3`],
    volume: Howler.volume(),
  });

  soundCache[filename] = howl;
  return howl;
}

// Reproduce un sonido (start o end)
export function playSound(filename) {
  const settings = getSettings();

  if (!settings.soundsEnabled || settings.sounds.muted) return;

  const sound = loadSound(filename);
  sound.play();
}

// Actualizar volumen global
export function setGlobalVolume(v) {
  Howler.volume(v);

  const settings = getSettings();
  settings.sounds.volume = v;
  saveSettings(settings);
}

// Mute global
export function setMuted(state) {
  Howler.mute(state);

  const settings = getSettings();
  settings.sounds.muted = state;
  saveSettings(settings);
}
