import { getPresetById } from "../../core/storage.js";

export function EditPresetView({ id }) {
  const preset = getPresetById(id);

  if (!preset) {
    return `<p class="text-red-400 text-sm">Preset no encontrado.</p>`;
  }

  const actividad = preset.intervalos[0]?.duracion || 0;
  const descanso = preset.intervalos[1]?.duracion || 0;
  const unidad = preset.intervalos[0]?.unidad || "minutes";
  const tipo = preset.tipo;

  return `
    <form data-form="edit-preset" class="space-y-4">

      <h1 class="text-2xl font-semibold">Editar preset</h1>

      <input type="hidden" name="id" value="${preset.id}" />

      <div>
        <label class="text-sm">Nombre</label>
        <input
          name="nombre"
          value="${preset.nombre}"
          class="w-full p-2 bg-slate-800 rounded"
        />
      </div>

      <div>
        <label class="text-sm">Tipo</label>
        <select name="tipo" class="w-full p-2 bg-slate-800 rounded">
          <option value="trabajo" ${tipo === "trabajo" ? "selected" : ""}>Trabajo</option>
          <option value="estudio" ${tipo === "estudio" ? "selected" : ""}>Estudio</option>
          <option value="deporte" ${tipo === "deporte" ? "selected" : ""}>Deporte</option>
        </select>
      </div>

      <div>
        <label class="text-sm">Actividad</label>
        <input
          type="number"
          name="actividad"
          value="${actividad}"
          class="w-full p-2 bg-slate-800 rounded"
        />
      </div>

      <div>
        <label class="text-sm">Descanso</label>
        <input
          type="number"
          name="descanso"
          value="${descanso}"
          class="w-full p-2 bg-slate-800 rounded"
        />
      </div>

      <div>
        <label class="text-sm">Unidad</label>
        <input type="hidden" name="unidad" value="${unidad}"/>

        <div class="flex gap-2 mt-1">
          <button type="button" data-unit="seconds" class="px-2 py-1 rounded bg-slate-800">s</button>
          <button type="button" data-unit="minutes" class="px-2 py-1 rounded bg-slate-800">m</button>
          <button type="button" data-unit="hours" class="px-2 py-1 rounded bg-slate-800">h</button>
        </div>
      </div>

      <button class="w-full px-4 py-2 bg-blue-600 rounded">
        Guardar cambios
      </button>

      <button type="button" id="delete-preset" class="w-full px-4 py-2 bg-red-600 rounded">
        Eliminar preset
      </button>

    </form>
  `;
}
