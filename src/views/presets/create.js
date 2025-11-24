export function CreatePresetView() {
  return `
    <div class="space-y-6 max-w-md mx-auto">

      <h1 class="text-2xl font-semibold text-center">Nueva rutina</h1>

      <form class="space-y-5" data-form="create-preset">

        <!-- Nombre -->
        <div class="space-y-1">
          <label class="text-sm text-muted">Nombre</label>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre de la rutina"
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
            <option value="trabajo">Trabajo</option>
            <option value="estudio">Estudio</option>
            <option value="deporte">Deporte</option>
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

          <input type="hidden" name="interval-mode" value="uniforme" />

          <div class="flex gap-2 text-sm">
            <button
              type="button"
              data-interval-mode="uniforme"
              class="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-medium"
            >
              Todos iguales
            </button>

            <button
              type="button"
              data-interval-mode="personalizado"
              class="flex-1 py-2 rounded-lg btn-secondary"
            >
              Intervalos distintos
            </button>
          </div>
        </div>

        <!-- UNIFORME -->
        <div data-interval-section="uniforme" class="space-y-4 mt-4">

          <!-- Selector de unidades -->
          <div class="space-y-2">
            <label class="text-sm text-muted">Unidad de tiempo</label>

            <input type="hidden" name="unidad" value="minutes" />

            <div class="flex gap-2">
              <button
                type="button"
                data-unit="seconds"
                class="flex-1 py-2 rounded-lg btn-secondary text-sm"
              >
                Segundos
              </button>

              <button
                type="button"
                data-unit="minutes"
                class="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-sm"
              >
                Minutos
              </button>

              <button
                type="button"
                data-unit="hours"
                class="flex-1 py-2 rounded-lg btn-secondary text-sm"
              >
                Horas
              </button>
            </div>
          </div>

          <!-- Duraciones -->
          <div class="space-y-2">
            <label class="text-sm text-muted">Duraciones</label>
            <div class="flex gap-3">
              <input
                type="number"
                name="actividad"
                placeholder="Actividad"
                class="w-1/2 px-3 py-2 rounded-lg input-base"
              />
              <input
                type="number"
                name="descanso"
                placeholder="Descanso"
                class="w-1/2 px-3 py-2 rounded-lg input-base"
              />
            </div>
          </div>

          <!-- Bloques -->
          <div class="space-y-1">
            <label class="text-sm text-muted">Número de bloques</label>
            <input
              type="number"
              name="bloques"
              placeholder="Número de intervalos"
              class="w-full px-3 py-2 rounded-lg input-base"
              min="1"
            />
          </div>
        </div>

        <!-- PERSONALIZADO -->
        <div data-interval-section="personalizado" class="space-y-3 mt-4 hidden">
          <div class="text-sm text-muted">
            Aquí podrás añadir intervalos de actividad y descanso con tiempos distintos.
          </div>

          <div id="intervals-list" class="space-y-2"></div>

          <button
            type="button"
            data-add-interval
            class="w-full py-2 rounded-lg btn-secondary text-sm font-medium"
          >
            + Añadir intervalo
          </button>
        </div>

        <!-- Guardar -->
        <button
          type="submit"
          class="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-semibold"
        >
          Guardar rutina
        </button>

      </form>
    </div>
  `;
}
