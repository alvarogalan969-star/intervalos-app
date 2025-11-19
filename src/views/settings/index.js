import { getAccentClasses } from "../../core/modeStyle.js";

const { bg, shadow } = getAccentClasses();

export function SettingsView() {
  return `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-center">Settings</h1>

      <!-- Selector de tema -->
      <div class="p-4 bg-slate-800 rounded flex items-center justify-between ${shadow}">
        <div>
          <div class="font-medium">Tema</div>
          <div class="text-sm text-slate-400">Claro u oscuro</div>
        </div>
        <div class="flex gap-2">
          <button
            data-theme="light"
            class="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded ${shadow}"
          >
            Claro
          </button>
          <button
            data-theme="dark"
            class="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded ${shadow}"
          >
            Oscuro
          </button>
        </div>
      </div>

      <!-- Resto de ajustes como los tenías en la opción A -->
      <div class="space-y-4">

        <div class="p-4 bg-slate-800 rounded ${shadow}">
          <div class="font-medium">Sonidos</div>
          <div class="text-sm text-slate-400">Activados</div>
        </div>

        <div class="p-4 bg-slate-800 rounded ${shadow}">
          <div class="font-medium">Notificaciones</div>
          <div class="text-sm text-slate-400">Desactivadas</div>
        </div>

      </div>
    </div>
  `;
}
