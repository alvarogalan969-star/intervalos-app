export function SettingsView() {
  return `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-center">Settings</h1>

      <div class="space-y-4">

        <div class="p-4 bg-slate-800 rounded">
          <div class="font-medium">Tema</div>
          <div class="text-sm text-slate-400">Oscuro (por defecto)</div>
        </div>

        <div class="p-4 bg-slate-800 rounded">
          <div class="font-medium">Sonidos</div>
          <div class="text-sm text-slate-400">Activados</div>
        </div>

        <div class="p-4 bg-slate-800 rounded">
          <div class="font-medium">Notificaciones</div>
          <div class="text-sm text-slate-400">Desactivadas</div>
        </div>

      </div>
    </div>
  `;
}