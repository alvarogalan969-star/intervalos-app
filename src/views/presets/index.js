export function PresetsView() {
  return `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-center">Presets</h1>

      <button class="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded">
        Crear preset
      </button>

      <div class="space-y-3">
        <!-- Trabajo (azul) -->
        <div class="flex items-center justify-between p-3 bg-slate-900 rounded">
          <div>
            <div class="font-medium">Pomodoro clásico</div>
            <div class="text-xs text-slate-400">25 trabajo · 5 descanso</div>
          </div>
          <span class="px-2 py-1 text-xs rounded bg-blue-600/20 text-blue-300">
            Trabajo
          </span>
        </div>

        <!-- Estudio (verde) -->
        <div class="flex items-center justify-between p-3 bg-slate-900 rounded">
          <div>
            <div class="font-medium">Estudio intenso</div>
            <div class="text-xs text-slate-400">50 estudio · 10 descanso</div>
          </div>
          <span class="px-2 py-1 text-xs rounded bg-emerald-600/20 text-emerald-300">
            Estudio
          </span>
        </div>

        <!-- Deporte (rojo/naranja) -->
        <div class="flex items-center justify-between p-3 bg-slate-900 rounded">
          <div>
            <div class="font-medium">HIIT corto</div>
            <div class="text-xs text-slate-400">30s esfuerzo · 15s descanso</div>
          </div>
          <span class="px-2 py-1 text-xs rounded bg-red-600/20 text-orange-300">
            Deporte
          </span>
        </div>
      </div>
    </div>
  `;
}