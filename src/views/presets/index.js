import { getPresets } from "../../core/storage.js";
import { getAccentClasses } from "../../core/modeStyle.js";

const { bg, shadow, tag } = getAccentClasses();

function presetColor(type) {
  if (type === "trabajo") return "bg-blue-600/20 text-blue-300";
  if (type === "estudio") return "bg-emerald-600/20 text-emerald-300";
  if (type === "deporte") return "bg-red-600/20 text-orange-300";
  return "bg-slate-700 text-slate-300";
}

function formatDuration(duracion, unidad) {
  if (unidad === "seconds") return `${duracion}s`;
  if (unidad === "minutes") return `${duracion}m`;
  if (unidad === "hours") return `${duracion}h`;
  // por si algún preset antiguo no tiene unidad
  return `${duracion}m`;
}

export function PresetsView() {
  const presets = getPresets();

  const items = presets
    .map((preset) => {
      const colorClass = presetColor(preset.tipo);
      const detalles = preset.intervalos
        .map((i) => {
          const dur = formatDuration(i.duracion, i.unidad);
          return `
            <span class="inline-flex items-center gap-1 text-xs">
              <span class="px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700 font-mono">
                ${dur}
              </span>
              <span>${i.modo}</span>
            </span>
          `;
        })
        .join('<span class="mx-1 text-slate-600">·</span>');

      return `
        <div class="flex items-center justify-between p-3 bg-slate-900 rounded ${shadow}">
          <div>
            <div class="font-medium">${preset.nombre}</div>
            <div class="text-xs text-slate-400">${detalles}</div>
          </div>
          <div class="flex items-center gap-2">

            <span class="px-2 py-1 text-xs rounded ${colorClass}">
              ${preset.tipo}
            </span>

            <a
              data-link
              href="/presets/${preset.id}/edit"
              class="px-2 py-1 text-xs rounded border border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Editar
            </a>
            
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-center">Presets</h1>

      <button data-link href="/presets/new" class="w-full px-4 py-2 ${bg} ${shadow} rounded">
        Crear Intervalo
      </button>

      <div class="space-y-3">
        ${items}
      </div>
    </div>
  `;
}