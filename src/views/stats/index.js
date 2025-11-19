export function StatsView() {
  return `
    <div class="space-y-6">
    <h1 class="text-2xl font-semibold text-center">Stats</h1>

    <div class="space-y-3">
      <div class="p-4 bg-slate-800 rounded">
        <div class="text-sm text-slate-400">Tiempo total trabajado</div>
        <div class="text-2xl font-mono">3h 20m</div>
      </div>

      <div class="p-4 bg-slate-800 rounded">
        <div class="text-sm text-slate-400">Sesiones completadas</div>
        <div class="text-2xl font-mono">12</div>
      </div>

      <div class="p-4 bg-slate-800 rounded">
        <div class="text-sm text-slate-400">Racha de días</div>
        <div class="text-2xl font-mono">5</div>
      </div>
    </div>
  </div>
  `;
}