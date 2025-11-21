import { getStats } from "../../core/storage.js";
import { getAccentClasses } from "../../core/modeStyle.js";

function formatMsToHuman(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (ms <= 0) return "0 min";
  if (days === 0 && hours === 0) return `${minutes} min`;
  if (days === 0) return `${hours} h ${minutes} min`;
  return `${days} d ${hours} h ${minutes} min`;
}

function getTotals(stats) {
  let totalMs = 0;
  let totalSessions = 0;

  Object.values(stats.byDay).forEach((day) => {
    totalMs += day.totalMs || 0;
    totalSessions += day.sessions || 0;
  });

  return { totalMs, totalSessions };
}

export function StatsView() {
  const { bg, shadow } = getAccentClasses();
  const stats = getStats();
  const { totalMs, totalSessions } = getTotals(stats);

  const streakCurrent = stats.streak.current || 0;
  const streakBest = stats.streak.best || 0;

  return `
    <div class="space-y-8 max-w-xl mx-auto transition-colors duration-500">

      <!-- Título -->
      <h1 class="text-2xl font-semibold text-center">Estadísticas</h1>

      <!-- Tarjetas -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <!-- Total tiempo -->
        <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${shadow}">
          <div class="text-sm text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v6l4 2"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Tiempo total
          </div>
          <div class="mt-2 text-2xl font-mono">${formatMsToHuman(totalMs)}</div>
        </div>

        <!-- Total sesiones -->
        <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${shadow}">
          <div class="text-sm text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 3v18l7-5 7 5V3z"></path>
            </svg>
            Completadas
          </div>
          <div class="mt-2 text-2xl font-mono">${totalSessions}</div>
        </div>

        <!-- Racha -->
        <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${shadow}">
          <div class="text-sm text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12h18M12 3v18"></path>
            </svg>
            Racha
          </div>
          <div class="mt-2 text-lg font-mono leading-tight">
            Actual: ${streakCurrent} días<br/>
            Mejor: ${streakBest} días
          </div>
        </div>

      </div>

      <!-- Botón reset -->
      <div class="pt-4 text-center">
        <button
          id="stats-reset"
          class="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          Reiniciar estadísticas
        </button>
      </div>

    </div>
  `;
}
