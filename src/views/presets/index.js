import { getPresets } from "../../core/storage.js";
import { getAccentClasses } from "../../core/modeStyle.js";

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
  return `${duracion}m`;
}

export function PresetsView() {
  const { bg, shadow } = getAccentClasses();
  const presets = getPresets();

  const items = presets
    .map((preset) => {
      const colorClass = presetColor(preset.tipo);

      const actividadInterval = preset.intervalos.find(
        (i) => i.modo !== "descanso"
      );
      const descansoInterval = preset.intervalos.find(
        (i) => i.modo === "descanso"
      );
      const bloques =
        preset.intervalos.filter((i) => i.modo !== "descanso").length || 1;

      const durActividad = actividadInterval
        ? formatDuration(actividadInterval.duracion, actividadInterval.unidad)
        : "-";

      const durDescanso = descansoInterval
        ? formatDuration(descansoInterval.duracion, descansoInterval.unidad)
        : "-";

      const partes = [];

      if (durActividad !== "-") {
        partes.push(`
          <span class="inline-flex items-center gap-1 text-xs">
            <span class="px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700 font-mono">
              ${durActividad}
            </span>
            <span>${preset.nombre}</span>
          </span>
        `);
      }

      if (durDescanso !== "-") {
        partes.push(`
          <span class="inline-flex items-center gap-1 text-xs">
            <span class="px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700 font-mono">
              ${durDescanso}
            </span>
            <span>Descanso</span>
          </span>
        `);
      }

      partes.push(`
        <span class="inline-flex items-center gap-1 text-xs">
          x${bloques}
        </span>
      `);

      const detalles = partes.join(`
        <span class="mx-1 text-slate-600">·</span>
      `);

      return `
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl ${shadow} transition-colors duration-500">
          <div>
            <div class="font-medium">${preset.nombre}</div>
            <div class="text-xs text-slate-400">${detalles}</div>
          </div>

          <div class="flex items-center gap-2 sm:self-auto self-end">

            <!-- Play -->
            <button
              data-use-preset
              data-preset-id="${preset.id}"
              aria-label="Usar preset"
              class="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 4.5v11l9-5.5-9-5.5z" />
              </svg>
            </button>

            <!-- Editar -->
            <a
              data-link
              href="/presets/${preset.id}/edit"
              aria-label="Editar preset"
              class="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.505l-3 0.75a0.5 0.5 0 0 1-.606-.606l0.75-3a2 2 0 0 1 .505-.878l8.5-8.5z" />
              </svg>
            </a>

            <!-- Tipo -->
            <span class="px-2 py-1 text-xs rounded-full ${colorClass}">
              ${preset.tipo}
            </span>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="space-y-6 transition-colors duration-500">
      <h1 class="text-2xl font-semibold text-center">Presets</h1>

      <button
        data-link
        href="/presets/new"
        class="w-full px-4 py-2 ${bg} ${shadow} rounded-xl"
      >
        Crear Intervalo
      </button>

      <div class="space-y-3">
        ${items}
      </div>
    </div>
  `;
}
