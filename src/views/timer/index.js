// src/views/timer/index.js
import { getAccentClasses } from "../../core/modeStyle.js";
import { getPresets } from "../../core/storage.js";
import { timerState } from "../../core/timerState.js";

function formatMsToMMSS(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

export function TimerView() {
  const { bg, shadow } = getAccentClasses();
  const presets = getPresets();

  const currentPreset =
    presets.find((p) => p.id === timerState.currentPresetId) || null;

  const presetName = currentPreset
    ? currentPreset.nombre
    : "Sin preset seleccionado";

  const displayTime =
    timerState.remainingMs > 0
      ? formatMsToMMSS(timerState.remainingMs)
      : "00:00";

  const message = timerState.statusMessage || "";

  const intervals = timerState.intervals || [];
  const idx = timerState.currentIntervalIndex ?? 0;
  const next0 = intervals[idx] || null;
  const next1 = intervals[idx + 1] || null;
  const next2 = intervals[idx + 2] || null;

  function formatIntervalLabel(interval) {
    if (!interval) return "";
    return interval.modo === "descanso" ? "Descanso" : "Actividad";
  }

  function formatIntervalDuration(interval) {
    if (!interval) return "";
    const unit = interval.unidad || "minutes";
    const suf =
      unit === "seconds" ? "s" :
      unit === "hours" ? "h" :
      "m";
    return `${interval.duracion}${suf}`;
  }

  return `
    <div class="flex justify-center px-4">
      <div class="w-full max-w-md mt-8 p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 ${shadow} space-y-6 backdrop-blur-sm transition-colors duration-500">
        <h1 class="text-xl font-semibold text-center tracking-wide">
          Timer
        </h1>

        <div class="space-y-1 text-center">
          <div class="flex items-center justify-center gap-2">
            <div id="timer-preset-name" class="text-sm text-slate-300 font-medium">
              ${presetName}
            </div>

            ${
              next0
                ? `
                  <span class="px-2 py-0.5 rounded-full text-xs bg-slate-800/70 border border-slate-700 text-slate-200">
                    ${formatIntervalLabel(next0)}
                  </span>
                `
                : ""
            }
          </div>
          <div id="timer-status-message" class="text-xs text-slate-400 min-h-[1rem]">
            ${message}
          </div>
        </div>

        <!-- CÍRCULO DEL TIMER (lo pinta ProgressBar.js) -->
        <div class="flex justify-center">
          <div class="relative w-64 h-64 rounded-full bg-slate-950/70 border border-slate-800 shadow-lg shadow-black/40">
            <div id="timer-circle" class="w-64 h-64"></div>

            <div
              id="timer-display"
              class="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-mono tracking-widest"
            >
              ${displayTime}
            </div>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          ${
            next1
              ? `
              <div class="text-[11px] uppercase tracking-wide text-slate-500 text-center">
                Siguientes intervalos
              </div>
            `
              : ""
          }

          ${
            next1
              ? `
            <div 
              id="next-interval-1"
              class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-s"
            >
              <div class="font-semibold">
                ${formatIntervalLabel(next1)}
              </div>
              <div class="font-mono">
                ${formatIntervalDuration(next1)}
              </div>
            </div>
          `
              : ""
          }

          ${
            next2
              ? `
            <div 
              id="next-interval-2"
              class="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs opacity-60 scale-95"
            >
              <div>
                ${formatIntervalLabel(next2)}
              </div>
              <div class="font-mono">
                ${formatIntervalDuration(next2)}
              </div>
            </div>
          `
              : ""
          }
        </div>

        <div class="flex flex-wrap justify-center gap-3 pt-2">
          <button
            id="timer-start"
            class="px-4 py-2 rounded-lg text-sm font-medium ${bg} ${shadow} transition-colors duration-300 w-full sm:w-auto"
          >
            Start
          </button>
          <button
            id="timer-stop"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors duration-300 w-full sm:w-auto"
          >
            Stop
          </button>
          <button
            id="timer-reset"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors duration-300 w-full sm:w-auto"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  `;
}
