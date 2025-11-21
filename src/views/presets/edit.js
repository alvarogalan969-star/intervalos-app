import { getPresetById } from "../../core/storage.js";

export function EditPresetView({ id }) {
  const preset = getPresetById(id);

  if (!preset) {
    return `<p class="text-red-400 text-sm">Preset no encontrado.</p>`;
  }

  const actividadIntervals = preset.intervalos.filter(
    (i) => i.modo !== "descanso"
  );
  const bloques = actividadIntervals.length || 1;

  const actividad = preset.intervalos[0]?.duracion || 0;
  const descanso = preset.intervalos[1]?.duracion || 0;
  const unidad = preset.intervalos[0]?.unidad || "minutes";
  const tipo = preset.tipo;

  function unitButtonClass(targetUnit) {
    const base =
      "flex-1 py-2 rounded-lg border text-sm transition-colors duration-150";
    if (targetUnit === unidad) {
      return `${base} bg-emerald-600 border-emerald-500 text-slate-900 hover:bg-emerald-500`;
    }
    return `${base} bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700`;
  }

  return `
    <div class="space-y-6 max-w-md mx-auto">
      <h1 class="text-2xl font-semibold text-center">Editar preset</h1>

      <form data-form="edit-preset" class="space-y-5">

        <input type="hidden" name="id" value="${preset.id}" />

        <!-- Nombre -->
        <div class="space-y-1">
          <label class="text-sm text-slate-300">Nombre</label>
          <input
            name="nombre"
            value="${preset.nombre}"
            class="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg focus:outline-none focus:border-slate-500"
          />
        </div>

        <!-- Tipo -->
        <div class="space-y-1 relative">
          <label class="text-sm text-slate-300">Tipo de actividad</label>
          <div class="space-y-1 relative">
              <select
                name="tipo"
                class="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 focus:outline-none focus:border-slate-500 appearance-none cursor-pointer"
              >
                <option value="trabajo" ${tipo === "trabajo" ? "selected" : ""}>Trabajo</option>
                <option value="estudio" ${tipo === "estudio" ? "selected" : ""}>Estudio</option>
                <option value="deporte" ${tipo === "deporte" ? "selected" : ""}>Deporte</option>
              </select>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
        </div>

        <!-- Duraciones -->
        <div class="space-y-2">
          <label class="text-sm text-slate-300">Duraciones</label>
          <div class="flex gap-3">
            <input
              type="number"
              name="actividad"
              value="${actividad}"
              placeholder="Actividad"
              class="w-1/2 px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg focus:outline-none focus:border-slate-500"
            />
            <input
              type="number"
              name="descanso"
              value="${descanso}"
              placeholder="Descanso"
              class="w-1/2 px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <!-- Bloques -->
        <div class="space-y-1">
          <label class="text-sm text-slate-300">Número de bloques</label>
          <input
            type="number"
            min="1"
            name="bloques"
            value="${bloques}"
            class="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg focus:outline-none focus:border-slate-500"
          />
        </div>

        <!-- Unidad -->
        <div class="space-y-2">
          <label class="text-sm text-slate-300">Unidad de tiempo</label>
          <input type="hidden" name="unidad" value="${unidad}"/>

          <div class="flex gap-2 mt-1">
            <button 
              type="button"
              data-unit="seconds"
              class="${unitButtonClass("seconds")}"
            >
              Segundos
            </button>

            <button
              type="button"
              data-unit="minutes" 
              class="${unitButtonClass("minutes")}"
            >
              Minutos
            </button>

            <button 
              type="button" 
              data-unit="hours" 
              class="${unitButtonClass("hours")}"
            >
              Horas
            </button>
          </div>
        </div>

        <!-- Acciones -->
        <button
          class="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-semibold shadow-md shadow-emerald-900/20 border border-emerald-700 transition-colors"
        >
          Guardar cambios
        </button>

        <button
          type="button"
          id="delete-preset"
          class="w-full px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-red-100 font-semibold shadow-md shadow-red-900/20 border border-red-700 transition-colors"
        >
          Eliminar preset
        </button>

      </form>
    </div>
  `;
}
