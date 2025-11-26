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

function getModeStats(stats) {
  const modes = stats.modes || {};

  function safeMode(name) {
    return modes[name] || { totalMs: 0, sessions: 0 };
  }

  return {
    trabajo: safeMode("trabajo"),
    estudio: safeMode("estudio"),
    deporte: safeMode("deporte"),
  };
}

export function StatsView() {
  const { bg, shadow } = getAccentClasses();
  const stats = getStats();
  const { totalMs, totalSessions } = getTotals(stats);

  const streakCurrent = stats.streak.current || 0;
  const streakBest = stats.streak.best || 0;

  const modeStats = getModeStats(stats);
  const tTrabajo = modeStats.trabajo;
  const tEstudio = modeStats.estudio;
  const tDeporte = modeStats.deporte;

  return `
    <div class="space-y-10 max-w-xl mx-auto transition-colors duration-500">

      <!-- TÍTULO -->
      <h1 class="text-2xl font-semibold text-center">Estadísticas</h1>

      <!-- 🎯 RESUMEN GENERAL -->
      <section class="space-y-4 stats-section">
        <h2 class="text-sm text-muted uppercase tracking-wide pl-1">Resumen</h2>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <!-- Tiempo total -->
          <div class="p-4 rounded-xl card ${shadow} min-h-[110px] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
            <div class="text-sm text-muted flex items-center gap-2">
              <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v6l4 2"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Tiempo total
            </div>
            <div class="text-xl mt-1 font-mono tracking-tight">${formatMsToHuman(totalMs)}</div>
          </div>

          <!-- Completadas -->
          <div class="p-4 rounded-xl card ${shadow} min-h-[110px] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
            <div class="text-sm text-muted flex items-center gap-2">
              <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 3v18l7-5 7 5V3z"></path>
              </svg>
              Completados
            </div>
            <div class="text-xl mt-1 font-mono tracking-tight">${totalSessions}</div>
          </div>

          <!-- Racha -->
          <div class="p-4 rounded-xl card ${shadow} min-h-[110px] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
            <div class="text-sm text-muted flex items-center gap-2">
              <svg class="w-4 h-4 opacity-80" fill="none" stroke="currentColor" stroke-width="2"
                viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C9 5 9 7.5 10 9.5C8.5 10 7 11.5 7 13.5C7 16 9 18 12 18C15 18 17 16 17 13.5C17 11.5 15.5 10 14 9.5C15 7.5 15 5 12 2Z"></path>
              </svg>
              Racha
            </div>
            <div class="text-sm mt-1 font-mono leading-tight">
              Actual: ${streakCurrent} días<br/>
              Mejor: ${streakBest} días
            </div>
          </div>

        </div>
      </section>

      <!-- 🟦 POR TIPO DE PRESET -->
      <section class="space-y-4 stats-section">
        <h2 class="text-sm text-muted uppercase tracking-wide pl-1">Por tipo de preset</h2>

        <div class="grid gap-4 sm:grid-cols-3">

          <!-- Trabajo -->
          <div class="p-4 rounded-xl preset-card preset-card-trabajo transition-transform duration-200 hover:-translate-y-0.5">
            <div class="preset-label preset-label-trabajo">Trabajo</div>
            <div class="text-base mt-1 font-mono">${formatMsToHuman(tTrabajo.totalMs)}</div>
            <div class="text-[11px] text-muted">${tTrabajo.sessions} Rutinas</div>
          </div>

          <!-- Estudio -->
          <div class="p-4 rounded-xl preset-card preset-card-estudio transition-transform duration-200 hover:-translate-y-0.5">
            <div class="preset-label preset-label-estudio">Estudio</div>
            <div class="text-base mt-1 font-mono">${formatMsToHuman(tEstudio.totalMs)}</div>
            <div class="text-[11px] text-muted">${tEstudio.sessions} Rutinas</div>
          </div>

          <!-- Deporte -->
          <div class="p-4 rounded-xl preset-card preset-card-deporte transition-transform duration-200 hover:-translate-y-0.5">
            <div class="preset-label preset-label-deporte">Deporte</div>
            <div class="text-base mt-1 font-mono">${formatMsToHuman(tDeporte.totalMs)}</div>
            <div class="text-[11px] text-muted">${tDeporte.sessions} Rutinas</div>
          </div>

        </div>
      </section>

      <!-- 📊 ÚLTIMOS 7 DÍAS -->
      <section class="space-y-4 stats-section">
        <h2 class="text-sm text-muted uppercase tracking-wide pl-1">Últimos 7 días</h2>

        <div class="p-4 rounded-xl card ${shadow}">
          <div id="stats-chart-7d" class="h-48 w-full"></div>
        </div>
      </section>

      <!-- ⚠️ RESET -->
      <section class="pt-2 text-center">
        <button
          id="stats-reset"
          class="btn-danger px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Reiniciar estadísticas
        </button>
      </section>

    </div>
  `;


}
