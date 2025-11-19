const PRESETS_KEY = "intervalos_presets";
const SETTINGS_KEY = "intervalos_settings";

const DEFAULT_PRESETS = [
  {
    id: 1,
    nombre: "Pomodoro clásico",
    tipo: "trabajo",
    intervalos: [
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 5, modo: "descanso", unidad: "minutes" },
    ],
  },
  {
    id: 2,
    nombre: "Estudio intenso",
    tipo: "estudio",
    intervalos: [
      { duracion: 50, modo: "estudio", unidad: "minutes" },
      { duracion: 10, modo: "descanso", unidad: "minutes" },
    ],
  },
  {
    id: 3,
    nombre: "HIIT básico",
    tipo: "deporte",
    intervalos: [
      { duracion: 30, modo: "deporte", unidad: "seconds" },
      { duracion: 15, modo: "descanso", unidad: "seconds" },
    ],
  },
];

const DEFAULT_SETTINGS = {
  theme: "dark",
  soundsEnabled: true,
  notificationsEnabled: false,
  defaultMode: "trabajo",
  timeUnit: "minutes",
  sounds: {
    trabajo: "work_beep_1",
    estudio: "study_chime_1",
    deporte: "sport_whistle_1",
    descanso: "break_bell_1",
    volume: 0.8,
    muted: false,
  },
};

function loadJSON(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error leyendo", key, e);
    return defaultValue;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error guardando", key, e);
  }
}

export function getPresets() {
  return loadJSON(PRESETS_KEY, DEFAULT_PRESETS);
}

export function savePresets(presets) {
  saveJSON(PRESETS_KEY, presets);
}

export function getSettings() {
  return loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings) {
  saveJSON(SETTINGS_KEY, settings);
}
