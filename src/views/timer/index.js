import { getAccentClasses } from "../../core/modeStyle.js";

const { bg, shadow } = getAccentClasses();

export function TimerView() {
  return `
    <div class="text-center space-y-6">
      <h1 class="text-2xl font-semibold">Timer</h1>

      <div class="text-6xl font-mono tracking-widest ${shadow}">00:00</div>

      <div class="flex justify-center gap-3">
        <button class="px-4 py-2 bg-slate-700 ${bg} ${shadow} rounded">
          Start
        </button>
        <button class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">
          Stop
        </button>
        <button class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">
          Reset
        </button>
      </div>
    </div>
  `;
}