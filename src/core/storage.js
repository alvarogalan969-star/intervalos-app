const PRESETS_KEY = "intervalos_presets";
const SETTINGS_KEY = "intervalos_settings";
const STATS_KEY = "intervalos_stats";

const DEFAULT_PRESETS = [
  {
    id: 1,
    nombre: "Pomodoro clásico",
    tipo: "trabajo",
    intervalos: [
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 5, modo: "descanso", unidad: "minutes" },
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 5, modo: "descanso", unidad: "minutes" },
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 5, modo: "descanso", unidad: "minutes" },
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 15, modo: "descanso", unidad: "minutes" },
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 5, modo: "descanso", unidad: "minutes" },
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 5, modo: "descanso", unidad: "minutes" },
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 5, modo: "descanso", unidad: "minutes" },
      { duracion: 25, modo: "trabajo", unidad: "minutes" },
      { duracion: 15, modo: "descanso", unidad: "minutes" }
    ],
  },
  {
    id: 2,
    nombre: "Estudio intenso",
    tipo: "estudio",
    intervalos: [
      { duracion: 50, modo: "estudio", unidad: "minutes" },
      { duracion: 10, modo: "descanso", unidad: "minutes" },
      { duracion: 50, modo: "estudio", unidad: "minutes" },
      { duracion: 10, modo: "descanso", unidad: "minutes" },
      { duracion: 50, modo: "estudio", unidad: "minutes" }
    ],
  },
  {
    id: 3,
    nombre: "HIIT básico",
    tipo: "deporte",
    intervalos: [
      { duracion: 30, modo: "deporte", unidad: "seconds" },
      { duracion: 15, modo: "descanso", unidad: "seconds" },
      { duracion: 30, modo: "deporte", unidad: "seconds" },
      { duracion: 15, modo: "descanso", unidad: "seconds" },
      { duracion: 30, modo: "deporte", unidad: "seconds" },
      { duracion: 15, modo: "descanso", unidad: "seconds" },
      { duracion: 30, modo: "deporte", unidad: "seconds" },
      { duracion: 15, modo: "descanso", unidad: "seconds" },
      { duracion: 30, modo: "deporte", unidad: "seconds" },
      { duracion: 15, modo: "descanso", unidad: "seconds" },
      { duracion: 30, modo: "deporte", unidad: "seconds" },
      { duracion: 15, modo: "descanso", unidad: "seconds" },
    ],
  },
];

const DEFAULT_SETTINGS = {
  activeMode: "neutral",
  soundsEnabled: true,
  notificationsEnabled: true,
  timeUnit: "minutes",
  sounds: {
    trabajo: {
      start: "chime-alert-demo-309545",
      end: "winfantasia-6912",
    },
    estudio: {
      start: "bell-sound-370341",
      end: "winfantasia-6912",
    },
    deporte: {
      start: "alarm-clock-90867",
      end: "winfantasia-6912",
    }, 
    volume: 0.8,
    muted: false,
    repeatIntervalSound: false,
    autoAdvanceIntervals: false, 
  },
};

const DEFAULT_STATS = {
  byDay: {
    // "2025-11-20": { totalMs: 0, sessions: 0 }
  },
  streak: {
    current: 0,
    best: 0,
    lastDay: null, // "2025-11-20"
  },
  modes: {
    trabajo: { totalMs: 0, sessions: 0 },
    estudio: { totalMs: 0, sessions: 0 },
    deporte: { totalMs: 0, sessions: 0 },
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

function updateStreak(stats, today) {
  const last = stats.streak.lastDay;

  if (!last) {
    stats.streak.current = 1;
    stats.streak.best = 1;
    stats.streak.lastDay = today;
    return;
  }

  const diff = daysBetween(last, today);

  if (diff === 1) {
    stats.streak.current += 1;
  } else if (diff > 1) {
    stats.streak.current = 1;
  }

  if (stats.streak.current > stats.streak.best) {
    stats.streak.best = stats.streak.current;
  }

  stats.streak.lastDay = today;
}

function daysBetween(d1, d2) {
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
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

export function getStats() {
  return loadJSON(STATS_KEY, DEFAULT_STATS);
}

export function saveStats(stats) {
  saveJSON(STATS_KEY, stats);
}

export function resetStats() {
  saveJSON(STATS_KEY, DEFAULT_STATS);
}

export function addSessionStats(totalMs) {
  const stats = getStats();

  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  // Crear entrada si no existe
  if (!stats.byDay[today]) {
    stats.byDay[today] = {
      totalMs: 0,
      sessions: 0,
    };
  }

  // Añadir datos
  stats.byDay[today].totalMs += totalMs;
  stats.byDay[today].sessions += 1;

  // Actualizar racha
  updateStreak(stats, today);

  saveStats(stats);
}

export function getPresetById(id) {
  const presets = getPresets();
  const numericId = Number(id);
  return presets.find((p) => p.id === numericId) || null;
}

export function updatePreset(updated) {
  const presets = getPresets();
  const newPresets = presets.map((p) =>
    p.id === updated.id ? updated : p
  );
  savePresets(newPresets);
}

export function deletePreset(id) {
  const presets = getPresets();
  const newPresets = presets.filter((p) => p.id !== id);
  savePresets(newPresets);
}
