import { 
  getPresets,
  getStats,
  saveStats 
} from "./storage.js";


const TICK_MS = 1000;

const listeners = [];

export function subscribeToTimer(listener) {
  listeners.push(listener);
}

function notifyTimerListeners() {
  for (const fn of listeners) {
    try {
      fn(timerState);
    } catch (e) {
      console.error("Error en listener de timer", e);
    }
  }
}

function getSessionActiveMs() {
  return timerState.intervals.reduce((total, interval) => {
    if (interval.modo === "descanso") return total;
    return total + getIntervalDurationMs(interval);
  }, 0);
}

function getTodayKey() {
  // "2025-11-20"
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(dayA, dayB) {
  const a = new Date(dayA + "T00:00:00");
  const b = new Date(dayB + "T00:00:00");
  const diffMs = b - a;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function recordSessionStats() {
  const stats = getStats();
  const today = getTodayKey();
  const activeMs = getSessionActiveMs();

  // byDay
  if (!stats.byDay[today]) {
    stats.byDay[today] = { totalMs: 0, sessions: 0 };
  }

  stats.byDay[today].totalMs += activeMs;
  stats.byDay[today].sessions += 1;

  // streak
  const streak = stats.streak;
  if (!streak.lastDay) {
    streak.current = 1;
    streak.best = 1;
    streak.lastDay = today;
  } else {
    const diff = daysBetween(streak.lastDay, today);

    if (diff === 0) {
      // mismo día → no cambia la racha, solo sumamos sesiones
    } else if (diff === 1) {
      // día siguiente → continua la racha
      streak.current += 1;
      if (streak.current > streak.best) streak.best = streak.current;
      streak.lastDay = today;
    } else if (diff > 1) {
      // rompemos racha
      streak.current = 1;
      if (streak.current > streak.best) streak.best = streak.current;
      streak.lastDay = today;
    }
  }

  saveStats(stats);
}

export const timerState = {
  currentPresetId: null,      // id del preset en uso
  intervals: [],              // lista de intervalos del preset
  currentIntervalIndex: 0,    // posición del intervalo actual
  remainingMs: 0,             // tiempo restante en milisegundos
  status: "idle",             // 'idle' | 'running' | 'paused' | 'finished'
  timerId: null,
  baseMode: null,
};

export function loadPresetToTimer(presetId) {
  const presets = getPresets();
  const preset = presets.find((p) => p.id === presetId);

  if (!preset) {
    console.warn("Preset no encontrado", presetId);
    return;
  }

  // Guardamos qué preset se está usando
  timerState.currentPresetId = preset.id;
  timerState.baseMode = preset.tipo; 

  // Intervalos del preset
  timerState.intervals = preset.intervalos || [];
  timerState.currentIntervalIndex = 0;

  const firstInterval = timerState.intervals[0];

    if (!firstInterval) {
        console.warn("Preset sin intervalos", presetId);
        timerState.remainingMs = 0;
        timerState.status = "idle";
        return;
    }

    resetRemainingFromCurrentInterval();
    timerState.status = "idle";
    notifyTimerListeners();
}

function getCurrentInterval() {
  return timerState.intervals[timerState.currentIntervalIndex] || null;
}

function getIntervalDurationMs(interval) {
  if (!interval) return 0;

  switch (interval.unidad) {
    case "seconds":
      return interval.duracion * 1000;
    case "minutes":
      return interval.duracion * 60 * 1000;
    case "hours":
      return interval.duracion * 60 * 60 * 1000;
    default:
      console.warn("Unidad desconocida:", interval.unidad);
      return 0;
  }
}

function resetRemainingFromCurrentInterval() {
  const current = getCurrentInterval();
  const ms = getIntervalDurationMs(current);
  timerState.remainingMs = ms;
}

function goToNextIntervalOrFinish() {
  timerState.currentIntervalIndex += 1;

  if (timerState.currentIntervalIndex >= timerState.intervals.length) {
    // No hay más intervalos → fin del preset
    clearInterval(timerState.timerId);
    timerState.timerId = null;
    timerState.status = "finished";
    timerState.intervals = [];
    timerState.baseMode = null;
    recordSessionStats();
    notifyTimerListeners();
    return;
  }

  // Pasamos al siguiente intervalo
  resetRemainingFromCurrentInterval();
  notifyTimerListeners();
}

export function startTimer() {
  // Si ya está corriendo, no hacemos nada
  if (timerState.status === "running") return;

  // Si no hay intervalo actual, salimos
  const current = getCurrentInterval();
  if (!current) {
    console.warn("No hay intervalo actual");
    return;
  }

  // Si el tiempo restante es 0, reiniciamos desde el intervalo actual
  if (timerState.remainingMs <= 0) {
    resetRemainingFromCurrentInterval();
  }

  timerState.status = "running";

  // Por si hubiera un intervalo anterior
  if (timerState.timerId) {
    clearInterval(timerState.timerId);
  }

  timerState.timerId = setInterval(() => {
    timerState.remainingMs -= TICK_MS;

    if (timerState.remainingMs <= 0) {
      // Evitamos números negativos
      timerState.remainingMs = 0;
      goToNextIntervalOrFinish();
    }

    notifyTimerListeners();

  }, TICK_MS);
}

export function stopTimer() {
  if (timerState.timerId) {
    clearInterval(timerState.timerId);
    timerState.timerId = null;
  }

  timerState.status = "paused";
  notifyTimerListeners();
}

export function resetTimer() {
  // Paramos si estaba activo
  if (timerState.timerId) {
    clearInterval(timerState.timerId);
    timerState.timerId = null;
  }

  timerState.currentIntervalIndex = 0;
  resetRemainingFromCurrentInterval();
  timerState.status = "idle";
  notifyTimerListeners();
}