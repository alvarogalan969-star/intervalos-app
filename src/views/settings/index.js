import { getAccentClasses } from "../../core/modeStyle.js";

export function SettingsView() {
  const { bg, shadow } = getAccentClasses();

  return `
    <div class="space-y-6 max-w-md mx-auto transition-colors duration-500">
      <h1 class="text-2xl font-semibold text-center">Ajustes</h1>

      <!-- Tema -->
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="font-medium">Tema</div>
          <div class="text-sm text-slate-400">Claro u oscuro</div>
        </div>
        <div class="flex gap-2">
          <button
            data-theme="light"
            class="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600"
          >
            Claro
          </button>
          <button
            data-theme="dark"
            class="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600"
          >
            Oscuro
          </button>
        </div>
      </div>

      <!-- Sonidos -->
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="font-medium">Sonidos</div>
          <div class="text-sm text-slate-400">Configuración de sonidos del timer</div>
        </div>
        <div class="text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          Próximamente
        </div>
      </div>

      <!-- Notificaciones -->
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="font-medium">Notificaciones</div>
          <div class="text-sm text-slate-400">Avisos cuando termine un intervalo</div>
        </div>
        <div class="text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          Próximamente
        </div>
      </div>
    </div>
  `;
}
