import { getPresets } from "../../core/storage.js";
import { getAccentClasses } from "../../core/modeStyle.js";

function presetColor(type) {
  if (type === "trabajo") return "preset-tag preset-tag-trabajo";
  if (type === "estudio") return "preset-tag preset-tag-estudio";
  if (type === "deporte") return "preset-tag preset-tag-deporte";
  return "preset-tag";
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
      const intervalos = preset.intervalos || [];

      const actividadIntervals = intervalos.filter((i) => i.modo !== "descanso");
      const descansoIntervals = intervalos.filter((i) => i.modo === "descanso");

      const actividad = actividadIntervals[0]?.duracion || 0;
      const descanso = descansoIntervals[0]?.duracion || 0;
      const unidadBase = intervalos[0]?.unidad || "minutes";

      const esUniforme =
        intervalos.length > 0 &&
        actividadIntervals.length > 0 &&
        actividadIntervals.every(
          (i) => i.duracion === actividad && i.unidad === unidadBase
        ) &&
        (descansoIntervals.length === 0 ||
          descansoIntervals.every(
            (i) => i.duracion === descanso && i.unidad === unidadBase
          ));

      let detalles = "";

      if (esUniforme) {
        const durActividad = actividad
          ? formatDuration(actividad, unidadBase)
          : "-";
        const durDescanso = descanso
          ? formatDuration(descanso, unidadBase)
          : "-";
        const bloques = actividadIntervals.length || 1;

        const partes = [];

        if (durActividad !== "-") {
          partes.push(`
            <span class="inline-flex items-center gap-1 text-xs">
              <span class="px-1.5 py-0.5 rounded card-soft font-mono">
                ${durActividad}
              </span>
              <span>Actividad</span>
            </span>
          `);
        }

        if (durDescanso !== "-") {
          partes.push(`
            <span class="inline-flex items-center gap-1 text-xs">
              <span class="px-1.5 py-0.5 rounded card-soft font-mono">
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

        detalles = partes.join(`
          <span class="mx-1 text-muted">·</span>
        `);
      } else {
        const total = intervalos.length;

        const preview = intervalos
          .slice(0, 4)
          .map((i) => {
            const u =
              i.unidad === "seconds"
                ? "s"
                : i.unidad === "hours"
                ? "h"
                : "m";
            const label = i.modo === "descanso" ? "Desc" : "Act";

            return `
              <span class="inline-flex items-center gap-1 text-xs">
                <span class="px-1.5 py-0.5 rounded card-soft font-mono">
                  ${i.duracion}${u}
                </span>
                <span>${label}</span>
              </span>
            `;
          })
          .join(`
            <span class="mx-1 text-muted">·</span>
          `);

        detalles = `
          <span class="inline-flex items-center gap-1 text-xs">
            Secuencia personalizada
          </span>

          <span class="mx-1 text-muted">·</span>

          <span class="inline-flex items-center gap-1 text-xs">
            ${total} intervalos
          </span>

          ${
            preview
              ? `
            <span class="mx-1 text-muted">·</span>
            ${preview}
            ${total > 4 ? `<span class="mx-1 text-muted">·</span> …` : ""}
          `
              : ""
          }
        `;
      }

      // ⬇⬇ Este es el return de CADA tarjeta
      return `
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 card ${shadow} transition-colors duration-500">
          <div>
            <div class="font-medium">${preset.nombre}</div>
            <div class="text-xs text-muted mt-4">${detalles}</div>
          </div>

          <div class="flex items-center gap-2 sm:self-auto self-end">

            <!-- Play -->
            <button
              data-use-preset
              data-preset-id="${preset.id}"
              aria-label="Usar preset"
              class="p-2 rounded-full btn-secondary flex items-center justify-center"
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
              class="p-2 rounded-full btn-secondary flex items-center justify-center"
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

  // ⬇⬇ Este es el return FINAL de la vista
  return `
    <div class="space-y-6 transition-colors duration-500">
      <h1 class="text-2xl font-semibold text-center">Rutinas</h1>

      <button
        data-link
        href="/presets/new"
        class="w-full px-4 py-2 ${bg} ${shadow} rounded-xl"
      >
        Crear Rutina
      </button>

      <div class="space-y-3">
        ${items}
      </div>
    </div>
  `;
}

