import { 
  getPresets,
  getStats,
  saveStats,
  addSessionStats ,
  getSettings,
} from "./storage.js";
import { playSound } from "./sound.js";
import { showNotification } from "./notifications.js";

const listeners = [];

let tickId = null;
let repeatSoundLoopId = null;

function scheduleTick() {
  if (tickId) return;
  tickId = setInterval(tick, 100); // 1 vez por segundo
}

function clearTick() {
  if (!tickId) return;
  clearInterval(tickId);
  tickId = null;
}

function tick() {
  if (timerState.status !== "running" || timerState.endTimestamp == null) {
    return;
  }

  const now = Date.now();
  const remaining = timerState.endTimestamp - now;

  timerState.remainingMs = Math.max(remaining, 0);

  if (remaining <= 0) {
    timerState.remainingMs = 0;
    clearTick();
    goToNextIntervalOrFinish(); // esta función ya la tienes más abajo
    return;
  }

  notifyTimerListeners();
}

function skipToNextIntervalInternal() {
  if (!timerState.intervals || timerState.intervals.length === 0) return;

  // cancelar cuenta atrás si la hubiera
  if (timerState.countdownTimerId) {
    clearInterval(timerState.countdownTimerId);
    timerState.countdownTimerId = null;
    timerState.countdownActive = false;
    timerState.countdownValue = 0;
  }

  // forzamos fin del intervalo actual
  timerState.remainingMs = 0;
  goToNextIntervalOrFinish();
}

export function skipToNextInterval() {
  skipToNextIntervalInternal();
}

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

function startRepeatSoundLoop(soundKey) {
  stopRepeatSoundLoop();

  const settings = getSettings();
  if (!settings.repeatIntervalSound) return;
  if (!soundKey) return;

  // ya haces un playSound() al final del intervalo,
  // aquí solo dejamos el loop cada 3s
  repeatSoundLoopId = setInterval(() => {
    playSound(soundKey);
  }, 3000);
}

function stopRepeatSoundLoop() {
  if (repeatSoundLoopId) {
    clearInterval(repeatSoundLoopId);
    repeatSoundLoopId = null;
  }
}

export const timerState = {
  currentPresetId: null,
  intervals: [],
  currentIntervalIndex: 0,
  remainingMs: 0,
  status: "idle",
  endTimestamp: null,
  pausedAt: null,
  baseMode: null,        // ya lo usas en otros sitios
  statusMessage: "",
  countdownActive: false,
  countdownValue: 0,
  countdownTimerId: null,
  originalTotalMs: 0,
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

  timerState.originalTotalMs = preset.intervalos.reduce((acc, itv) => {
  const unit = itv.unidad || "minutes";
  const base =
    unit === "seconds" ? 1000 :
    unit === "hours" ? 3600 * 1000 :
    60 * 1000;
  return acc + itv.duracion * base;
}, 0);

  resetRemainingFromCurrentInterval();
  timerState.status = "idle";
  timerState.statusMessage = "Pulsa Start para comenzar.";
  notifyTimerListeners();

  timerState.endTimestamp = null;
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
  const settings = getSettings();

  stopRepeatSoundLoop();

  // avanzar al siguiente intervalo
  timerState.currentIntervalIndex += 1;

  // 👉 Caso 1: se han terminado TODOS los intervalos
  if (timerState.currentIntervalIndex >= timerState.intervals.length) {
    // 🔊 sonido fin de preset
    const finalMode = timerState.baseMode || "trabajo";
    const finalSound = settings.sounds[finalMode]?.end;
    if (finalSound) playSound(finalSound);

    // 🔔 notificación fin de rutina
    if (settings.notificationsEnabled) {
      showNotification(
        "Rutina completada",
        "Enhorabuena, ¡has acabado tu rutina!"
      );
    }

    if (typeof confetti === "function") {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0 },
        ticks: 300,
      });
    }

    const stats = getStats();
    const today = new Date().toISOString().slice(0, 10);

    if (!stats.byDay[today]) {
      stats.byDay[today] = { totalMs: 0, sessions: 0 };
    }

    const sessionMs = timerState.originalTotalMs || 0;
    stats.byDay[today].totalMs += sessionMs;
    stats.byDay[today].sessions += 1;

    const mode = timerState.baseMode || "trabajo";
    if (!stats.modes) stats.modes = {};
    if (!stats.modes[mode]) {
      stats.modes[mode] = { totalMs: 0, sessions: 0 };
    }
    stats.modes[mode].totalMs += sessionMs;
    stats.modes[mode].sessions += 1;

    saveStats(stats);
    clearTick();

    timerState.endTimestamp = null;
    timerState.status = "finished";
    timerState.remainingMs = 0;
    timerState.intervals = [];
    timerState.baseMode = null;

    timerState.statusMessage = "Preset completado.";
    notifyTimerListeners();

    document.dispatchEvent(new CustomEvent("presetFinished"));

    return;
  }

  // 👉 Caso 2: hay más intervalos → sonar inicio del SIGUIENTE y pausar
  const next = timerState.intervals[timerState.currentIntervalIndex];
  if (next) {
    const modeForNext =
      next.modo === "descanso"
        ? (timerState.baseMode || "trabajo")
        : next.modo;

    const startSound = settings.sounds[modeForNext]?.start;
    if (startSound) {
      playSound(startSound);

      // aquí SÍ podemos repetir en bucle hasta que pulse un botón
      if (settings.repeatIntervalSound && !settings.autoAdvanceIntervals) {
        startRepeatSoundLoop(startSound);
      }
    }
  }

  const prevIndex = timerState.currentIntervalIndex - 1;
  const prev = timerState.intervals[prevIndex];

  // 🔔 notificación fin de intervalo
  if (settings.notificationsEnabled && prev) {
    const tipo = prev.modo === "descanso" ? "Descanso" : "Actividad";
    showNotification(
      "Intervalo finalizado",
      `El intervalo de ${tipo} ha terminado. Pulsa Start para continuar con el siguiente.`
    );
  }

  clearTick();

  resetRemainingFromCurrentInterval();
  timerState.endTimestamp = null;

  if (settings.autoAdvanceIntervals) {
    // seguir automáticamente con el siguiente intervalo
    timerState.status = "running";
    timerState.statusMessage = "";

    const now = Date.now();
    timerState.endTimestamp = now + timerState.remainingMs;
    scheduleTick();
  } else {
    // comportamiento actual: se queda pausado esperando Start
    timerState.status = "paused";
    timerState.statusMessage =
      "Intervalo completado. Pulsa Start para continuar.";
  }

  notifyTimerListeners();;
}

export function startTimer() {
  if (timerState.status === "running") return;

  if (!timerState.intervals || timerState.intervals.length === 0) {
    timerState.statusMessage = "Selecciona un preset para comenzar.";
    notifyTimerListeners();
    return;
  }

  const current = getCurrentInterval();
  if (!current) {
    console.warn("No hay intervalo actual");
    return;
  }

  // Si el tiempo restante es 0 (primer inicio o hemos llegado a 0)
  if (timerState.remainingMs <= 0) {
    resetRemainingFromCurrentInterval();
  }

  const now = Date.now();
  timerState.endTimestamp = now + timerState.remainingMs;
  timerState.status = "running";
  timerState.statusMessage = "";

  scheduleTick();
  stopRepeatSoundLoop();
  notifyTimerListeners();
}

export function stopTimer() {
  if (!timerState.intervals || timerState.intervals.length === 0) {
    timerState.statusMessage = "Selecciona un preset para comenzar.";
    notifyTimerListeners();
    return;
  }

  clearTick();

  timerState.status = "paused";
  timerState.endTimestamp = null;
  timerState.statusMessage = "Pausado. Pulsa Start para continuar.";
  stopRepeatSoundLoop();
  notifyTimerListeners();
}

export function resetTimer() {
  if (!timerState.intervals || timerState.intervals.length === 0) {
    timerState.statusMessage = "Selecciona un preset para comenzar.";
    notifyTimerListeners();
    return;
  }

  clearTick();

  timerState.currentIntervalIndex = 0;
  resetRemainingFromCurrentInterval();
  timerState.status = "idle";
  timerState.endTimestamp = null;
  timerState.statusMessage = "Timer reseteado. Pulsa Start para continuar.";
  stopRepeatSoundLoop();
  notifyTimerListeners();
}

export function startCountdownThenStartTimer() {
  if (!timerState.intervals || timerState.intervals.length === 0) return;
  if (timerState.countdownActive) return;

  // Estado inicial cuenta atrás
  timerState.countdownActive = true;
  timerState.countdownValue = 3;
  timerState.statusMessage = "Preparado...";
  notifyTimerListeners();

  // 🔊 primer beep (3)
  playSound("ui/countdown_beep");

  if (timerState.countdownTimerId) {
    clearInterval(timerState.countdownTimerId);
    timerState.countdownTimerId = null;
  }

  let ticks = 0;
  timerState.countdownTimerId = setInterval(() => {
    ticks += 1;
    const value = 3 - ticks;

    if (value > 0) {
      // 2, luego 1
      timerState.countdownValue = value;
      notifyTimerListeners();

      // 🔊 beep en 2 y en 1
      if (value === 2 || value === 1) {
        playSound("ui/countdown_beep");
      }

      return;
    }

    // Fin de la cuenta atrás
    clearInterval(timerState.countdownTimerId);
    timerState.countdownTimerId = null;
    timerState.countdownActive = false;
    timerState.countdownValue = 0;
    notifyTimerListeners();

    // 🔊 sonido GO
    playSound("ui/countdown_go");

    // Arrancar el timer real (primer intervalo)
    startTimer();
  }, 1000);
}

