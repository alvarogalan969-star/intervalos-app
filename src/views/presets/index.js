import { getPresets } from "../../core/storage.js";
import { getAccentClasses } from "../../core/modeStyle.js";

const { bg, shadow, tag } = getAccentClasses();

function presetColor(type) {
  if (type === "trabajo") return "bg-blue-600/20 text-blue-300";
  if (type === "estudio") return "bg-emerald-600/20 text-emerald-300";
  if (type === "deporte") return "bg-red-600/20 text-orange-300";
  return "bg-slate-700 text-slate-300";
}

export function PresetsView() {
  const presets = getPresets();

  const items = presets
    .map((preset) => {
      const colorClass = presetColor(preset.tipo);
      const detalles = preset.intervalos
        .map((i) => `${i.duracion}${i.modo === "deporte" ? "s" : "m"} ${i.modo}`)
        .join(" · ");

      return `
        <div class="flex items-center justify-between p-3 bg-slate-900 rounded ${shadow}">
          <div>
            <div class="font-medium">${preset.nombre}</div>
            <div class="text-xs text-slate-400">${detalles}</div>
          </div>

          <span class="px-2 py-1 text-xs rounded ${colorClass}">
            ${preset.tipo}
          </span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-center">Presets</h1>

      <button data-link href="/presets/new" class="w-full px-4 py-2 ${bg} ${shadow} rounded">
        Crear preset
      </button>

      <div class="space-y-3">
        ${items}
      </div>
    </div>
  `;
}