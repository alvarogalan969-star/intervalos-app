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
    : "Sin rutina seleccionada";

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

  const showCountdown = timerState.countdownActive;
  const countdownValue = timerState.countdownValue || 0;

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
      <div class="w-full max-w-md mt-8 p-6 rounded-2xl card ${shadow} timer-card space-y-6 backdrop-blur-sm transition-colors duration-500">
        
        <h1 class="text-xl font-semibold text-center tracking-wide">
          Timer
        </h1>

        <div class="space-y-1 text-center">
          <div class="flex items-center justify-center gap-2">
            <div id="timer-preset-name" class="text-sm text-muted font-medium">
              ${presetName}
            </div>

            ${
              next0
                ? `
                  <span class="px-2 py-0.5 rounded-full text-xs card-soft">
                    ${formatIntervalLabel(next0)}
                  </span>
                `
                : ""
            }
          </div>

          <div id="timer-status-message" class="text-xs text-muted min-h-[1rem]">
            ${message}
          </div>
        </div>

        <!-- CÍRCULO DEL TIMER -->
        <div class="flex justify-center">
          <div class="relative w-64 h-64 rounded-full shadow-lg">
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
              <div class="text-[11px] uppercase tracking-wide text-muted text-center">
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
              class="flex items-center justify-between px-3 py-2 rounded-lg card-soft"
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
              class="flex items-center justify-between px-3 py-2 rounded-lg card-soft opacity-60 scale-95 text-xs"
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
            class="btn-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 w-full sm:w-auto"
          >
            Stop
          </button>

          <button
            id="timer-reset"
            class="btn-secondary px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 w-full sm:w-auto"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Overlay de cuenta atrás -->
      ${
        showCountdown
          ? `
          <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
            <div class="w-full max-w-md px-8">
              <div class="overflow-hidden">
                <div
                  class="countdown-number text-7xl md:text-8xl font-bold text-slate-100 text-center"
                >
                  ${countdownValue}
                </div>
              </div>
            </div>
          </div>
        `
          : ""
      }
    </div>
  `;
}
