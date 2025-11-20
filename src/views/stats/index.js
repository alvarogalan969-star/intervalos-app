import { getStats } from "../../core/storage.js";
import { getAccentClasses } from "../../core/modeStyle.js";

function formatMsToHuman(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  // 0 total
  if (ms <= 0) return "0 min";

  // Solo minutos
  if (days === 0 && hours === 0) {
    return `${minutes} min`;
  }

  // Horas y minutos
  if (days === 0) {
    return `${hours} h ${minutes} min`;
  }

  // Días, horas y minutos
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
    <div class="space-y-6 transition-colors duration-500">
      <h1 class="text-2xl font-semibold text-center">Estadísticas</h1>

      <div class="grid gap-4 md:grid-cols-3">

        <div class="p-4 bg-slate-900 rounded ${shadow}">
          <div class="text-sm text-slate-400">Tiempo total de actividad</div>
          <div class="mt-2 text-2xl font-mono">
            ${formatMsToHuman(totalMs)}
          </div>
        </div>

        <div class="p-4 bg-slate-900 rounded ${shadow}">
          <div class="text-sm text-slate-400">Sesiones completadas</div>
          <div class="mt-2 text-2xl font-mono">
            ${totalSessions}
          </div>
        </div>

        <div class="p-4 bg-slate-900 rounded ${shadow}">
          <div class="text-sm text-slate-400">Racha</div>
          <div class="mt-2 text-lg font-mono">
            Actual: ${streakCurrent} días<br/>
            Mejor: ${streakBest} días
          </div>
        </div>

      </div>

      <div class="pt-2">
        <button
          id="stats-reset"
          class="px-4 py-2 bg-transparent border border-slate-600 hover:bg-slate-700 text-sm rounded"
        >
          Reiniciar estadísticas
        </button>
      </div>
    </div>
  `;
}
