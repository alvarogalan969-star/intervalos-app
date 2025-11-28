import { getPresetById } from "../../core/storage.js";

export function EditPresetView({ id }) {
  const preset = getPresetById(id);

  if (!preset) {
    return `<p class="text-red-400 text-sm">Rutina no encontrada.</p>`;
  }

  const intervalos = preset.intervalos || [];
  const tipo = preset.tipo || "trabajo";

  const actividadIntervals = intervalos.filter((i) => i.modo !== "descanso");
  const descansoIntervals = intervalos.filter((i) => i.modo === "descanso");

  const bloques = actividadIntervals.length || 1;
  const actividad = actividadIntervals[0]?.duracion || 0;
  const descanso = descansoIntervals[0]?.duracion || 0;
  const unidadBase = intervalos[0]?.unidad || "minutes";

  function esUniforme() {
    if (intervalos.length === 0) return true;

    if (!actividadIntervals.every((i) => i.duracion === actividad && (i.unidad || unidadBase) === unidadBase)) {
      return false;
    }

    if (descansoIntervals.length > 0) {
      if (!descansoIntervals.every((i) => i.duracion === descanso && (i.unidad || unidadBase) === unidadBase)) {
        return false;
      }
    }

    return true;
  }

  const isUniform = esUniforme();
  const intervalMode = isUniform ? "uniforme" : "personalizado";

  function unitButtonClass(targetUnit) {
    const base = "flex-1 py-2 rounded-lg btn-secondary";
    return targetUnit === unidadBase
      ? base + " unit-selected"
      : base;
  }

  // 🔥 NUEVA FILA adaptada a tema claro/oscuro
  function renderCustomRows() {
    if (!intervalos.length) return "";
    return intervalos
      .map((intervalo) => {
        const tipoIntervalo = intervalo.modo === "descanso" ? "descanso" : "actividad";
        const unidadFila = intervalo.unidad || unidadBase;
        const duracion = intervalo.duracion || 0;

        return `
          <div data-interval-row class="flex items-center gap-2 card-soft px-3 py-2">
            <select
              name="tipo-intervalo"
              class="px-2 py-1 rounded input-base text-sm"
            >
              <option value="actividad" ${tipoIntervalo === "actividad" ? "selected" : ""}>Actividad</option>
              <option value="descanso" ${tipoIntervalo === "descanso" ? "selected" : ""}>Descanso</option>
            </select>

            <input
              type="number"
              name="duracion"
              value="${duracion}"
              placeholder="Tiempo"
              class="w-20 px-2 py-1 rounded input-base text-sm"
              min="1"
            />

            <select
              name="unidad-fila"
              class="px-2 py-1 rounded input-base text-sm"
            >
              <option value="seconds" ${unidadFila === "seconds" ? "selected" : ""}>s</option>
              <option value="minutes" ${unidadFila === "minutes" ? "selected" : ""}>min</option>
              <option value="hours" ${unidadFila === "hours" ? "selected" : ""}>h</option>
            </select>

            <button
              type="button"
              data-remove-interval-row
              class="ml-auto text-muted hover:text-red-400 text-xs"
            >
              ✕
            </button>
          </div>
        `;
      })
      .join("");
  }

  const filasPersonalizadas = renderCustomRows();

  // 🔥 Estilos semánticos para botones uniforme/personalizado
  const activeBtn = "flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-medium";
  const inactiveBtn = "flex-1 py-2 rounded-lg btn-secondary font-medium";

  const uniformBtnClasses = intervalMode === "uniforme" ? activeBtn : inactiveBtn;
  const customBtnClasses = intervalMode === "personalizado" ? activeBtn : inactiveBtn;

  return `
    <div class="space-y-6 max-w-md mx-auto">
      <h1 class="text-2xl font-semibold text-center">Editar rutina</h1>

      <form data-form="edit-preset" class="space-y-5">

        <input type="hidden" name="id" value="${preset.id}" />

        <!-- Nombre -->
        <div class="space-y-1">
          <label class="text-sm text-muted">Nombre</label>
          <input
            name="nombre"
            value="${preset.nombre}"
            class="w-full px-3 py-2 rounded-lg input-base"
          />
        </div>

        <!-- Tipo -->
        <div class="space-y-1 relative">
          <label class="text-sm text-muted">Tipo de actividad</label>
          <select
            name="tipo"
            class="w-full px-3 py-2 rounded-lg input-base appearance-none cursor-pointer"
          >
            <option value="trabajo" ${tipo === "trabajo" ? "selected" : ""}>Trabajo</option>
            <option value="estudio" ${tipo === "estudio" ? "selected" : ""}>Estudio</option>
            <option value="deporte" ${tipo === "deporte" ? "selected" : ""}>Deporte</option>
          </select>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-muted absolute right-3 top-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        <!-- Tipo de preset -->
        <div class="space-y-1">
          <label class="text-sm text-muted">Tipo de rutina</label>

          <input type="hidden" name="interval-mode" value="${intervalMode}" />

          <div class="flex gap-2 text-sm">
            <button type="button" data-interval-mode="uniforme" class="${uniformBtnClasses}">
              Todos iguales
            </button>

            <button type="button" data-interval-mode="personalizado" class="${customBtnClasses}">
              Intervalos distintos
            </button>
          </div>
        </div>

        <!-- UNIFORME -->
        <div data-interval-section="uniforme" class="space-y-4 mt-4 ${intervalMode === "personalizado" ? "hidden" : ""}">
          <div class="space-y-2">
            <label class="text-sm text-muted">Duraciones</label>
            <div class="flex gap-3">
              <input type="number" name="actividad" value="${actividad}" class="w-1/2 px-3 py-2 rounded-lg input-base" />
              <input type="number" name="descanso" value="${descanso}" class="w-1/2 px-3 py-2 rounded-lg input-base" />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-muted">Número de bloques</label>
            <input type="number" min="1" name="bloques" value="${bloques}" class="w-full px-3 py-2 rounded-lg input-base" />
          </div>

          <div class="space-y-2">
            <label class="text-sm text-muted">Unidad de tiempo</label>
            <input type="hidden" name="unidad" value="${unidadBase}" />

            <div class="flex gap-2 mt-1">
              <button type="button" data-unit="seconds" class="${unitButtonClass("seconds")}">Segundos</button>
              <button type="button" data-unit="minutes" class="${unitButtonClass("minutes")}">Minutos</button>
              <button type="button" data-unit="hours" class="${unitButtonClass("hours")}">Horas</button>
            </div>
          </div>
        </div>

        <!-- PERSONALIZADO -->
        <div data-interval-section="personalizado" class="space-y-3 mt-4 ${intervalMode === "uniforme" ? "hidden" : ""}">
          <div class="text-sm text-muted">
            Edita o añade intervalos personalizados.
          </div>

          <div id="intervals-list" class="space-y-2">${filasPersonalizadas}</div>

          <button
            type="button"
            data-add-interval
            class="w-full py-2 rounded-lg btn-secondary text-sm font-medium"
          >
            + Añadir intervalo
          </button>
        </div>

        <!-- Acciones -->
        <button class="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-semibold">
          Guardar cambios
        </button>

        <button
          type="button"
          id="delete-preset"
          class="w-full px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-slate-50 font-semibold"
        >
          Eliminar rutina
        </button>
      </form>
    </div>
  `;
}
