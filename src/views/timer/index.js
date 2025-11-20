import { getAccentClasses } from "../../core/modeStyle.js";
import { getPresets } from "../../core/storage.js";
import { timerState } from "../../core/timerState.js";

function formatMsToMMSS(ms) {
  const totalSeconds = Math.floor(ms / 1000);
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
    timerState.remainingMs > 0 ? formatMsToMMSS(timerState.remainingMs) : "00:00";

  return `
    <div class="text-center space-y-6 transition-colors duration-500">
      <h1 class="text-2xl font-semibold">Timer</h1>

      <div id="timer-preset-name" class="text-sm text-slate-400">
        ${presetName}
      </div>

      <div
        id="timer-display"
        class="text-6xl font-mono tracking-widest ${shadow}"
      >
        ${displayTime}
      </div>

      <div class="flex justify-center gap-3">
        <button
          id="timer-start"
          class="px-4 py-2 bg-slate-700 ${bg} ${shadow} rounded transition-colors duration-500"
        >
          Start
        </button>
        <button
          id="timer-stop"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors duration-500"
        >
          Stop
        </button>
        <button
          id="timer-reset"
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors duration-500"
        >
          Reset
        </button>
      </div>
    </div>
  `;
}
